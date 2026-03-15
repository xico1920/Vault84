// GameLoop.js — Motor do jogo.

import { GameState } from './GameState.js';
import { SE } from './SoundEngine.js';
import { saveGame, loadGame } from './SaveSystem.js';
import { checkAchievements } from './AchievementSystem.js';
import { notifyThreat, notifyAchievement, notifyReactorCritical, notifyAlert } from './NotificationSystem.js';

const TICK_MS = 1000;
let intervalId = null;
let tickCount  = 0;
let _paused    = false;

export { loadGame };

export function startGameLoop()  { if (intervalId) return; _paused = false; intervalId = setInterval(tick, TICK_MS); }
export function stopGameLoop()   { if (intervalId) { clearInterval(intervalId); intervalId = null; } }
export function pauseGameLoop()  { _paused = true;  if (intervalId) { clearInterval(intervalId); intervalId = null; } }
export function resumeGameLoop() { if (_paused) { _paused = false; if (!intervalId) intervalId = setInterval(tick, TICK_MS); } }
export function isGamePaused()   { return _paused; }

// ─────────────────────────────────────────────────────────────────
function tick() {
    tickCount++;

    // 1. REACTOR TEMPERATURE
    updateReactorTemperature();

    // 2. POWER CASCADE — if reactor offline, cascade shutdown
    if (!GameState.reactor.online) {
        cascadeShutdown();
    }

    // 3. MINING — only if online + reactor power
    if (GameState.mining.online && GameState.reactor.efficiency > 0) {
        const mined = GameState.mining.ratePerTick;
        const cap   = GameState.mining.storageMax;
        const prev  = GameState.mining.rawOres;
        GameState.mining.rawOres = Math.min(cap, prev + mined);
        GameState.mining.totalMined += mined;
        GameState.session.oreMined += mined;
        if (prev < cap && GameState.mining.rawOres >= cap) {
            GameState.addLog('RAW ORE STORAGE FULL — ore overflow', 'warn');
            notifyAlert('RAW STORAGE FULL — sell or upgrade SSM');
        }
    }

    // 4. REFINERY
    if (GameState.refinery.online && GameState.mining.rawOres > 0) {
        const toRefine = Math.min(GameState.mining.rawOres, GameState.refinery.ratePerTick);
        const refCap   = GameState.refinery.storageMax;
        if (GameState.refinery.refinedOres < refCap) {
            GameState.mining.rawOres   -= toRefine;
            GameState.refinery.refinedOres = Math.min(refCap, GameState.refinery.refinedOres + toRefine);
        }
    }

    // 5. SSM AUTO-SELL
    if (GameState.ssm.autoSell) autoSellOres();

    // 6. PRICE FLUCTUATION every 15 ticks
    GameState.ssm.priceVarianceTimer++;
    if (GameState.ssm.priceVarianceTimer >= 15) {
        GameState.ssm.priceVarianceTimer = 0;
        fluctuatePrices();
    }

    // 7. WEAR / DEGRADATION every 30 ticks
    if (tickCount % 30 === 0) { updateWear(); saveGame(GameState); }

    // 8. SECURITY THREATS
    GameState.security.nextThreatTimer++;
    if (GameState.security.nextThreatTimer >= GameState.security.threatInterval) {
        GameState.security.nextThreatTimer = 0;
        maybeSpawnThreat();
    }
    tickThreats();

    // 9. PERIMETER SENSORS
    GameState.security.perimeter.motionTimer++;
    if (GameState.security.perimeter.motionTimer >= GameState.security.perimeter.motionInterval) {
        GameState.security.perimeter.motionTimer = 0;
        maybePerimeterEvent();
    }

    // 10. TEMP WARNINGS
    const temp = GameState.reactor.temperature;
    if (temp >= 1200 && temp < 1201) {
        GameState.addLog(`REACTOR TEMP WARNING — ${temp}°C`, 'warn');
        SE.threat();
        notifyReactorCritical(temp);
    }

    // 11. ACHIEVEMENTS
    const earned = checkAchievements(GameState);
    earned.forEach(a => { notifyAchievement(a); GameState.addLog(`ACHIEVEMENT: ${a.label}`, 'ok'); });

    GameState.emit('tick', tickCount);
}

// ─────────────────────────────────────────────────────────────────
function cascadeShutdown() {
    let cascaded = false;
    if (GameState.mining.online)   { GameState.mining.online   = false; cascaded = true; }
    if (GameState.refinery.online) { GameState.refinery.online = false; cascaded = true; }
    if (GameState.water.pumpOnline){ GameState.water.pumpOnline = false; cascaded = true; }
    if (cascaded) {
        GameState.addLog('POWER FAILURE — cascade shutdown initiated', 'crit');
        GameState.emit('cascade', {});
    }
}

// ─────────────────────────────────────────────────────────────────
function updateReactorTemperature() {
    const r = GameState.reactor;
    const w = GameState.water;

    const coolantMultiplier = { 'low': 0.4, 'regular': 0.8, 'optimal': 1.0 }[r.coolantFlow] || 1.0;
    const waterActive = w.pumpOnline;

    const reactorHeatBase = r.upgradeLevel <= 1 ? 12 : 10 + (r.upgradeLevel * r.upgradeLevel * 2.5);
    const heatGenerated   = r.online ? reactorHeatBase : 0;

    const waterCoolingBase = 14 + (w.upgradeLevel * 8);
    const coolingRate      = waterActive ? (waterCoolingBase * coolantMultiplier) : 1;
    const netDelta         = heatGenerated - coolingRate;

    if (waterActive) {
        if (netDelta > 0) {
            r.temperature += netDelta * 0.8;
        } else {
            const equilibrium = r.online ? Math.max(200, 120 + (r.upgradeLevel * 60) - (w.upgradeLevel * 40)) : 80;
            if (r.temperature > equilibrium)       r.temperature -= Math.min(Math.abs(netDelta) * 0.5, r.temperature - equilibrium);
            else if (r.temperature < equilibrium && r.online) r.temperature += 2;
        }
    } else {
        r.temperature += r.online ? heatGenerated * 0.9 : -1;
    }

    if (r.temperature >= 1800 && r.online) {
        r.online = false;
        GameState.session.meltdownsAvoided++;
        GameState.addLog('REACTOR EMERGENCY SHUTDOWN — MELTDOWN AVERTED', 'crit');
        notifyAlert('☢ REACTOR EMERGENCY SHUTDOWN — MELTDOWN AVERTED');
        SE.threat();
    }
    r.temperature = Math.round(Math.max(20, r.temperature));
}

// ─────────────────────────────────────────────────────────────────
function updateWear() {
    const wm = GameState._diffWearMult || 1.0;
    if (GameState.reactor.online) {
        const tempFactor = GameState.reactor.temperature / 1000;
        const gain = (0.3 + tempFactor * 0.4 + (GameState.reactor.upgradeLevel - 1) * 0.1) * wm;
        GameState.reactor.wear = Math.min(100, GameState.reactor.wear + gain);
        if (GameState.reactor.wear >= 75 && GameState.reactor.wear < 75 + gain + 0.1) {
            GameState.addLog('REACTOR heavily worn — efficiency dropping', 'warn');
            notifyAlert('⚠ REACTOR WEAR CRITICAL — repair in Security');
        }
    }

    if (GameState.mining.online) {
        const gain = (0.2 + (GameState.mining.upgradeLevel - 1) * 0.08) * wm;
        GameState.mining.wear = Math.min(100, GameState.mining.wear + gain);
        if (GameState.mining.wear >= 75 && GameState.mining.wear < 75 + gain + 0.1)
            GameState.addLog('MINING SHAFT heavily worn — output dropping', 'warn');
    }

    if (GameState.refinery.online && GameState.refinery.refinedOres > 0) {
        const gain = (0.15 + (GameState.refinery.upgradeLevel - 1) * 0.06) * wm;
        GameState.refinery.wear = Math.min(100, GameState.refinery.wear + gain);
    }

    if (GameState.water.pumpOnline) {
        const gain = (0.1 + (GameState.water.upgradeLevel - 1) * 0.05) * wm;
        GameState.water.wear = Math.min(100, GameState.water.wear + gain);
        if (GameState.water.wear >= 75 && GameState.water.wear < 75 + gain + 0.1)
            GameState.addLog('WATER PUMP heavily worn — cooling degraded', 'warn');
    }

    GameState.emit('wear', {});
}

export function repairSystem(system) {
    const repairCosts = { reactor: 80, mining: 40, refinery: 55, water: 45 };
    const cost = repairCosts[system];
    if (!cost || GameState.cash < cost) return false;
    GameState.cash -= cost;
    GameState[system].wear = 0;
    GameState.session.repairsPerformed++;
    GameState.addLog(`${system.toUpperCase()} repaired — wear reset`, 'ok');
    GameState.emit('repair', { system });
    SE.resolve();
    return true;
}

// ─────────────────────────────────────────────────────────────────
function autoSellOres() {
    const s = GameState.ssm;
    const target = s.sellTarget || 'both';

    // Smart mode — sell whichever is better value relative to base, only when price is spiking
    if (target === 'smart' && s.smartSellUnlocked) {
        const rawRatio     = s.rawOrePrice / 2;
        const refinedRatio = s.refinedOrePrice / 8;
        if (rawRatio >= 1.2 && rawRatio >= refinedRatio) {
            const earned = Math.floor(GameState.mining.rawOres) * s.rawOrePrice;
            if (earned > 0) { GameState.cash += earned; GameState.session.cashEarned += earned; GameState.mining.rawOres = GameState.mining.rawOres % 1; }
        } else if (refinedRatio >= 1.2) {
            const earned = Math.floor(GameState.refinery.refinedOres) * s.refinedOrePrice;
            if (earned > 0) { GameState.cash += earned; GameState.session.cashEarned += earned; GameState.refinery.refinedOres = GameState.refinery.refinedOres % 1; }
        }
        return;
    }

    let earned = 0;
    if (target === 'both' || target === 'raw') {
        earned += Math.floor(GameState.mining.rawOres) * s.rawOrePrice;
        GameState.mining.rawOres = GameState.mining.rawOres % 1;
    }
    if (target === 'both' || target === 'refined') {
        earned += Math.floor(GameState.refinery.refinedOres) * s.refinedOrePrice;
        GameState.refinery.refinedOres = GameState.refinery.refinedOres % 1;
    }
    if (earned > 0) {
        GameState.cash += earned;
        GameState.session.cashEarned += earned;
    }
}

// ─────────────────────────────────────────────────────────────────
function fluctuatePrices() {
    const s = GameState.ssm;
    const prevRaw = s.rawOrePrice, prevRef = s.refinedOrePrice;

    // Random market events
    const spike = Math.random() < 0.08; // 8% chance of price spike
    const crash = Math.random() < 0.05; // 5% chance of crash
    const mult  = spike ? (1.4 + Math.random() * 0.6) : crash ? (0.4 + Math.random() * 0.3) : (0.8 + Math.random() * 0.4);

    s.rawOrePrice      = Math.max(1, Math.round(2 * mult * 10) / 10);
    s.refinedOrePrice  = Math.max(4, Math.round(8 * mult * 10) / 10);

    if (spike) {
        GameState.addLog(`MARKET SPIKE — ore prices x${mult.toFixed(1)}`, 'ok');
        notifyAlert(`PRICE SPIKE: ORE +${Math.round((mult-1)*100)}% — SELL NOW`);
    } else if (crash) {
        GameState.addLog(`MARKET CRASH — ore prices -${Math.round((1-mult)*100)}%`, 'warn');
    }

    GameState.emit('priceUpdate', { raw: s.rawOrePrice, refined: s.refinedOrePrice });
}

// ─────────────────────────────────────────────────────────────────
function maybeSpawnThreat() {
    const w = GameState.workshop.upgrades;
    const offenseLevel = (w.reactor.level-1)+(w.mining.level-1)+(w.refinery.level-1)+(w.water.level-1)+(w.ssm.level-1);
    const defenseLevel = w.security.level - 1;
    const threatScore  = (offenseLevel * 0.06) - (defenseLevel * 0.10);
    const spawnChance  = Math.max(0, Math.min(0.75, threatScore));
    if (offenseLevel === 0 || Math.random() > spawnChance) return;

    // THREAT TYPES with distinct mechanics
    const threatTypes = [
        {
            type: 'VIRUS',
            color: '#ff2222',
            desc: 'Corrupting system files',
            clicksPerSev: 6,    // easiest — click to purge
            timePerSev: 18,
            onSpawn: (t) => {
                // Virus slowly drains efficiency — ongoing tick damage
                GameState.addLog(`VIRUS detected in ${t.target.toUpperCase()} — purge immediately`, 'crit');
            },
            onTick: (t) => {
                // Gradual drain while active
                if (t.target === 'mining') GameState.mining.rawOres = Math.max(0, GameState.mining.rawOres - 0.1 * t.severity);
                if (t.target === 'refinery') GameState.refinery.refinedOres = Math.max(0, GameState.refinery.refinedOres - 0.05 * t.severity);
                if (t.target === 'ssm') GameState.cash = Math.max(0, GameState.cash - 0.5 * t.severity);
            }
        },
        {
            type: 'BREACH',
            color: '#ff8800',
            desc: 'Unauthorized access — draining credits',
            clicksPerSev: 10,   // harder — drains caps continuously
            timePerSev: 25,
            onSpawn: (t) => {
                GameState.addLog(`BREACH detected — ${t.target.toUpperCase()} compromised`, 'crit');
            },
            onTick: (t) => {
                // Breach drains caps rapidly
                GameState.cash = Math.max(0, GameState.cash - 2 * t.severity);
            }
        },
        {
            type: 'MALWARE',
            color: '#d400ff',
            desc: 'System malware — disabling subsystem',
            clicksPerSev: 14,   // hardest
            timePerSev: 30,
            onSpawn: (t) => {
                // Malware immediately takes a system offline
                GameState.addLog(`MALWARE — ${t.target.toUpperCase()} forcibly disabled`, 'crit');
                notifyAlert(`⚠ MALWARE: ${t.target.toUpperCase()} OFFLINE — GO TO SECURITY`);
                switch(t.target) {
                    case 'mining':   GameState.mining.online   = false; break;
                    case 'refinery': GameState.refinery.online = false; break;
                    case 'water':    GameState.water.pumpOnline = false; break;
                    case 'reactor':  GameState.reactor.temperature += 200 * t.severity; break;
                    case 'ssm':      GameState.cash = Math.max(0, GameState.cash - 50 * t.severity); break;
                }
            },
            onTick: () => {} // damage already done on spawn
        }
    ];

    const targets    = ['reactor','mining','refinery','water','ssm'];
    const tDef       = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const severity   = Math.floor(Math.random() * 3) + 1;
    const threat = {
        id:       Date.now(),
        type:     tDef.type,
        color:    tDef.color,
        desc:     tDef.desc,
        target:   targets[Math.floor(Math.random() * targets.length)],
        severity,
        clicks:   0,
        clicksReq: tDef.clicksPerSev * severity,
        timeLeft: tDef.timePerSev * severity,
        onTick:   tDef.onTick,
        active:   true,
    };

    tDef.onSpawn(threat);
    GameState.security.threats.push(threat);
    GameState.emit('threat', threat);
    notifyThreat(threat);
    SE.threat();
}

// Tick active threats — drain effects + countdown
export function tickThreats() {
    const expired = [];
    GameState.security.threats.forEach(t => {
        t.timeLeft--;
        if (t.onTick) t.onTick(t);
        if (t.timeLeft <= 0) expired.push(t.id);
    });
    expired.forEach(id => {
        const t = GameState.security.threats.find(x => x.id === id);
        if (t) {
            GameState.addLog(`${t.type} on ${t.target.toUpperCase()} expired — system damaged`, 'crit');
            // On expiry: bring system back online but heavily worn
            if (t.type === 'MALWARE') {
                switch(t.target) {
                    case 'mining':   GameState.mining.online   = true; GameState.mining.wear   = Math.min(100, GameState.mining.wear   + 30); break;
                    case 'refinery': GameState.refinery.online = true; GameState.refinery.wear = Math.min(100, GameState.refinery.wear + 30); break;
                    case 'water':    GameState.water.pumpOnline= true; GameState.water.wear    = Math.min(100, GameState.water.wear    + 30); break;
                }
            }
        }
        resolveThreat(id, true); // silent resolve — no SE.resolve()
    });
}

export function resolveThreat(threatId, silent = false) {
    const idx = GameState.security.threats.findIndex(t => t.id === threatId);
    if (idx === -1) return;
    const t = GameState.security.threats[idx];
    // Restore malware-disabled systems
    if (t.type === 'MALWARE' && !silent) {
        switch(t.target) {
            case 'mining':   GameState.mining.online    = true; break;
            case 'refinery': GameState.refinery.online  = true; break;
            case 'water':    GameState.water.pumpOnline = true; break;
        }
        GameState.addLog(`MALWARE on ${t.target.toUpperCase()} neutralised — system restored`, 'ok');
    } else if (!silent) {
        GameState.addLog(`${t.type} on ${t.target.toUpperCase()} neutralised`, 'ok');
    }
    if (!silent) GameState.session.threatsResolved++;
    GameState.security.threats.splice(idx, 1);
    GameState.emit('threatResolved', threatId);
}

// ─────────────────────────────────────────────────────────────────
function maybePerimeterEvent() {
    const sec = GameState.security.perimeter;
    const w   = GameState.workshop.upgrades;

    // Higher security level = better detection, fewer false alarms
    const detectionChance = 0.15 + (w.security.level - 1) * 0.05;
    if (Math.random() > detectionChance) return;

    const zone = sec.zones[Math.floor(Math.random() * sec.zones.length)];
    const alert = { zone, ts: new Date().toLocaleTimeString(), resolved: false };
    sec.alerts.unshift(alert);
    if (sec.alerts.length > 10) sec.alerts.pop();

    GameState.addLog(`MOTION DETECTED — sector ${zone}`, 'warn');
    GameState.emit('perimeterAlert', alert);
    SE.threat();
}

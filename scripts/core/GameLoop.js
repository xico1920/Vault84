// GameLoop.js - Motor do jogo. Tick a cada segundo.

import { GameState } from './GameState.js';
import { SE } from './SoundEngine.js';

const TICK_MS = 1000; // 1 segundo por tick

let intervalId = null;
let tickCount = 0;
let _paused = false;

export function startGameLoop() {
    if (intervalId) return;
    _paused = false;
    intervalId = setInterval(tick, TICK_MS);
}

export function stopGameLoop() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function pauseGameLoop() {
    _paused = true;
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export function resumeGameLoop() {
    if (_paused) {
        _paused = false;
        if (!intervalId) intervalId = setInterval(tick, TICK_MS);
    }
}

export function isGamePaused() { return _paused; }

function tick() {
    tickCount++;

    // ── 1. REACTOR: temperatura ────────────────────────────────
    updateReactorTemperature();

    // ── 2. MINING ─────────────────────────────────────────────
    if (GameState.mining.online && GameState.reactor.efficiency > 0) {
        const mined = GameState.mining.ratePerTick;
        GameState.mining.rawOres += mined;
        GameState.mining.totalMined += mined;
    }

    // ── 3. REFINERY ───────────────────────────────────────────
    if (GameState.refinery.online && GameState.mining.rawOres > 0) {
        const toRefine = Math.min(GameState.mining.rawOres, GameState.refinery.ratePerTick);
        GameState.mining.rawOres -= toRefine;
        GameState.refinery.refinedOres += toRefine;
    }

    // ── 4. SSM auto-sell ──────────────────────────────────────
    if (GameState.ssm.autoSell) {
        autoSellOres();
    }

    // ── 5. Ore prices variance (a cada 15 ticks) ──────────────
    GameState.ssm.priceVarianceTimer++;
    if (GameState.ssm.priceVarianceTimer >= 15) {
        GameState.ssm.priceVarianceTimer = 0;
        fluctuatePrices();
    }

    // ── 6. Security threats ───────────────────────────────────
    GameState.security.nextThreatTimer++;
    if (GameState.security.nextThreatTimer >= GameState.security.threatInterval) {
        GameState.security.nextThreatTimer = 0;
        maybeSpawnThreat();
    }

    // Notifica todos os módulos que o tick aconteceu
    GameState.emit('tick', tickCount);
}

function updateReactorTemperature() {
    const r = GameState.reactor;
    const w = GameState.water;

    const coolantMultiplier = {
        'low': 0.4,
        'regular': 0.8,
        'optimal': 1.0
    }[r.coolantFlow] || 1.0;

    const waterActive = w.pumpOnline;

    // Heat scales with reactor upgrade level — higher level = more power = more heat
    // upgradeLevel 1 = 12°C/tick, level 2 = 20, level 3 = 30, level 4 = 42, etc.
    const reactorHeatBase = r.upgradeLevel <= 1 ? 12 : 10 + (r.upgradeLevel * r.upgradeLevel * 2.5);
    const heatGenerated = r.online ? reactorHeatBase : 0;

    // Water cooling capacity scales with WATER upgrade level only
    // water level 1 can handle ~reactor level 1 comfortably
    // Each water upgrade adds meaningful cooling but player must keep pace with reactor
    const waterCoolingBase = 14 + (w.upgradeLevel * 8); // lv1=22, lv2=30, lv3=38, lv4=46
    const coolingRate = waterActive ? (waterCoolingBase * coolantMultiplier) : 1;

    // Net change this tick
    const netDelta = heatGenerated - coolingRate;

    if (waterActive) {
        if (netDelta > 0) {
            // Overheating — reactor too powerful for current water level
            r.temperature += netDelta * 0.8;
        } else {
            // Cooling toward equilibrium
            const equilibrium = r.online ? Math.max(200, 120 + (r.upgradeLevel * 60) - (w.upgradeLevel * 40)) : 80;
            if (r.temperature > equilibrium) {
                r.temperature -= Math.min(Math.abs(netDelta) * 0.5, r.temperature - equilibrium);
            } else if (r.temperature < equilibrium && r.online) {
                r.temperature += 2;
            }
        }
    } else {
        // Pump offline: temp climbs steadily — reactor heat has nowhere to go
        if (r.online) {
            r.temperature += heatGenerated * 0.9;
        } else {
            r.temperature = Math.max(20, r.temperature - 1);
        }
    }

    // Emergency shutdown at 1800°C
    if (r.temperature >= 1800 && r.online) {
        r.online = false;
        GameState.emit('alert', { type: 'MELTDOWN', msg: 'REACTOR EMERGENCY SHUTDOWN — TEMPERATURE CRITICAL' });
    }

    r.temperature = Math.round(Math.max(20, r.temperature));
}

function autoSellOres() {
    const s = GameState.ssm;
    
    if (s.sellMode === 'always') {
        // Vende tudo automaticamente
        const rawEarnings = Math.floor(GameState.mining.rawOres) * s.rawOrePrice;
        const refEarnings = Math.floor(GameState.refinery.refinedOres) * s.refinedOrePrice;
        GameState.cash += rawEarnings + refEarnings;
        GameState.mining.rawOres = GameState.mining.rawOres % 1;
        GameState.refinery.refinedOres = GameState.refinery.refinedOres % 1;
    } else if (s.sellMode === 'threshold') {
        // Só vende se tiver acima do threshold de preço (média ponderada)
        const avgPrice = (s.rawOrePrice + s.refinedOrePrice * 2) / 3;
        if (avgPrice >= s.sellThreshold) {
            const rawEarnings = Math.floor(GameState.mining.rawOres) * s.rawOrePrice;
            const refEarnings = Math.floor(GameState.refinery.refinedOres) * s.refinedOrePrice;
            GameState.cash += rawEarnings + refEarnings;
            GameState.mining.rawOres = GameState.mining.rawOres % 1;
            GameState.refinery.refinedOres = GameState.refinery.refinedOres % 1;
        }
    }
}

function fluctuatePrices() {
    const s = GameState.ssm;
    // Variação de ±20% nos preços base
    s.rawOrePrice = Math.max(1, Math.round(2 * (0.8 + Math.random() * 0.4) * 10) / 10);
    s.refinedOrePrice = Math.max(4, Math.round(8 * (0.8 + Math.random() * 0.4) * 10) / 10);
    GameState.emit('priceUpdate', { raw: s.rawOrePrice, refined: s.refinedOrePrice });
}

function maybeSpawnThreat() {
    const w = GameState.workshop.upgrades;

    // Total non-security upgrade levels (each upgrade attracts more system complexity/attack surface)
    const offenseLevel = (w.reactor.level - 1) + (w.mining.level - 1) +
                         (w.refinery.level - 1) + (w.water.level - 1) + (w.ssm.level - 1);

    // Security level reduces probability
    const defenseLevel = w.security.level - 1;

    // Base probability: 0% at level 0, scales up with upgrades, reduced by security
    // Net threat score: each offense upgrade adds ~6%, each security upgrade removes ~10%
    const threatScore = (offenseLevel * 0.06) - (defenseLevel * 0.10);
    const spawnChance = Math.max(0, Math.min(0.75, threatScore));

    // Early game (no upgrades) = no threats
    if (offenseLevel === 0) return;
    if (Math.random() > spawnChance) return;

    const types = ['VIRUS', 'MALFUNCTION'];
    const targets = ['reactor', 'mining', 'refinery', 'water', 'ssm'];
    const threat = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        severity: Math.floor(Math.random() * 3) + 1,
        active: true,
        timeLeft: 60  // segundos para resolver antes de penalidade
    };

    // Aplica penalidade imediata leve
    applyThreatEffect(threat, 0.5);

    GameState.security.threats.push(threat);
    GameState.emit('threat', threat);
    SE.threat();
}

export function resolveThreat(threatId) {
    const idx = GameState.security.threats.findIndex(t => t.id === threatId);
    if (idx === -1) return;
    GameState.security.threats[idx].active = false;
    GameState.security.threats.splice(idx, 1);
    GameState.emit('threatResolved', threatId);
}

function applyThreatEffect(threat, multiplier = 1) {
    switch(threat.target) {
        case 'reactor':
            GameState.reactor.temperature += 50 * threat.severity * multiplier;
            break;
        case 'mining':
            GameState.mining.rawOres = Math.max(0, GameState.mining.rawOres - 5 * threat.severity * multiplier);
            break;
        case 'refinery':
            GameState.refinery.refinedOres = Math.max(0, GameState.refinery.refinedOres - 3 * threat.severity * multiplier);
            break;
        case 'water':
            // Pump fica offline temporariamente
            GameState.water.pumpOnline = false;
            setTimeout(() => { GameState.water.pumpOnline = true; }, 10000);
            break;
        case 'ssm':
            GameState.cash = Math.max(0, GameState.cash - 20 * threat.severity * multiplier);
            break;
    }
}

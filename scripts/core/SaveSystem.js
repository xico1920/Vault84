// SaveSystem.js — localStorage persistence

const SAVE_KEY = 'vault84_save_v1';

const SAVE_FIELDS = {
    cash:    v => v.cash,
    reactor: v => ({
        online: v.reactor.online,
        temperature: v.reactor.temperature,
        coolantFlow: v.reactor.coolantFlow,
        upgradeLevel: v.reactor.upgradeLevel,
        wear: v.reactor.wear,
    }),
    water: v => ({
        pumpOnline: v.water.pumpOnline,
        flowRate: v.water.flowRate,
        upgradeLevel: v.water.upgradeLevel,
        wear: v.water.wear,
    }),
    mining: v => ({
        online: v.mining.online,
        rawOres: v.mining.rawOres,
        totalMined: v.mining.totalMined,
        autoRate: v.mining.autoRate,
        upgradeLevel: v.mining.upgradeLevel,
        storageMax: v.mining.storageMax,
        wear: v.mining.wear,
    }),
    refinery: v => ({
        online: v.refinery.online,
        refinedOres: v.refinery.refinedOres,
        upgradeLevel: v.refinery.upgradeLevel,
        refineRate: v.refinery.refineRate,
        storageMax: v.refinery.storageMax,
        wear: v.refinery.wear,
    }),
    ssm: v => ({
        autoSell: v.ssm.autoSell,
        sellMode: v.ssm.sellMode,
        sellThreshold: v.ssm.sellThreshold,
        rawOrePrice: v.ssm.rawOrePrice,
        refinedOrePrice: v.ssm.refinedOrePrice,
        upgradeLevel: v.ssm.upgradeLevel,
    }),
    security: v => ({
        level: v.security.level,
        threatInterval: v.security.threatInterval,
    }),
    workshop: v => ({
        upgrades: JSON.parse(JSON.stringify(v.workshop.upgrades)),
    }),
};

export function saveGame(GameState) {
    try {
        const data = { savedAt: Date.now(), difficulty: GameState.difficulty, achievements: GameState.achievements || [] };
        for (const [key, fn] of Object.entries(SAVE_FIELDS)) {
            data[key] = fn(GameState);
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        return true;
    } catch(e) {
        console.warn('Save failed:', e);
        return false;
    }
}

export function loadGame(GameState) {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);

        // Restore each field carefully — never overwrite getters/methods
        if (data.cash !== undefined) GameState.cash = data.cash;

        const restore = (target, saved) => {
            if (!saved) return;
            for (const [k, v] of Object.entries(saved)) {
                if (k in target && typeof target[k] !== 'function') {
                    try { target[k] = v; } catch(e) {} // skip getters
                }
            }
        };

        restore(GameState.reactor,  data.reactor);
        restore(GameState.water,    data.water);
        restore(GameState.mining,   data.mining);
        restore(GameState.refinery, data.refinery);
        restore(GameState.ssm,      data.ssm);
        restore(GameState.security, data.security);

        if (data.workshop?.upgrades) {
            restore(GameState.workshop.upgrades.reactor,  data.workshop.upgrades.reactor);
            restore(GameState.workshop.upgrades.mining,   data.workshop.upgrades.mining);
            restore(GameState.workshop.upgrades.refinery, data.workshop.upgrades.refinery);
            restore(GameState.workshop.upgrades.water,    data.workshop.upgrades.water);
            restore(GameState.workshop.upgrades.ssm,      data.workshop.upgrades.ssm);
            restore(GameState.workshop.upgrades.security, data.workshop.upgrades.security);
        }

        // Also sync upgradeLevel from workshop to subsystems
        GameState.reactor.upgradeLevel  = data.workshop?.upgrades?.reactor?.level  || GameState.reactor.upgradeLevel;
        GameState.mining.upgradeLevel   = data.workshop?.upgrades?.mining?.level   || GameState.mining.upgradeLevel;
        GameState.refinery.upgradeLevel = data.workshop?.upgrades?.refinery?.level || GameState.refinery.upgradeLevel;
        GameState.water.upgradeLevel    = data.workshop?.upgrades?.water?.level    || GameState.water.upgradeLevel;
        GameState.ssm.upgradeLevel      = data.workshop?.upgrades?.ssm?.level      || GameState.ssm.upgradeLevel;
        GameState.security.level        = data.workshop?.upgrades?.security?.level || GameState.security.level;

        if (data.achievements) GameState.achievements = data.achievements;
        if (data.difficulty)   GameState.difficulty   = data.difficulty;

        GameState.addLog(`SAVE RESTORED — ${new Date(data.savedAt).toLocaleTimeString()}`, 'ok');
        return true;
    } catch(e) {
        console.warn('Load failed:', e);
        return false;
    }
}

export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
}

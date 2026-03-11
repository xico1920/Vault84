// GameState.js - Estado global do jogo.

export const GameState = {
    // ─── ECONOMIA ────────────────────────────────────────────────
    cash: 0,

    // ─── EVENT LOG ───────────────────────────────────────────────
    eventLog: [], // { time, msg, type: 'info'|'warn'|'crit'|'ok' }

    // ─── REACTOR CORE ────────────────────────────────────────────
    reactor: {
        online: true,
        temperature: 720,
        coolantFlow: 'optimal',
        upgradeLevel: 1,
        wear: 0,          // 0–100: degradação acumulada
        wearDrainRate: 0, // eficiência perdida por wear

        get powerGW()    { return this.online ? 2.4 * this.upgradeLevel : 0; },
        get wearPenalty(){ return Math.max(0, this.wear / 100 * 0.4); }, // até -40% eficiência
        get efficiency() {
            if (!this.online) return 0;
            let eff = 1.0 - this.wearPenalty;
            if (this.temperature <= 1000) return eff;
            if (this.temperature >= 1500) return 0;
            return eff * (1.0 - (this.temperature - 1000) / 500);
        },
        get status() {
            if (!this.online) return 'OFFLINE';
            if (this.temperature >= 1500) return 'CRITICAL';
            if (this.temperature >= 1000) return 'WARNING';
            if (this.wear >= 70) return 'WORN';
            return 'ONLINE';
        }
    },

    // ─── WATER TREATMENT ─────────────────────────────────────────
    water: {
        pumpOnline: true,
        flowRate: 100,
        upgradeLevel: 1,
        wear: 0,
        get coolingPower() {
            if (!this.pumpOnline) return 0;
            return this.flowRate * this.upgradeLevel * (1 - this.wear / 100 * 0.3);
        }
    },

    // ─── MINING SHAFT ────────────────────────────────────────────
    mining: {
        online: true,
        rawOres: 0,
        totalMined: 0,
        autoRate: 1,
        upgradeLevel: 1,
        storageMax: 50,   // cap de armazenamento — sobe com SSM upgrade
        wear: 0,
        get ratePerTick() {
            const reactorBoost = GameState.reactor.efficiency;
            const wearPenalty  = Math.max(0, this.wear / 100 * 0.5);
            return this.autoRate * this.upgradeLevel * reactorBoost * (1 - wearPenalty);
        }
    },

    // ─── ORE REFINERY ─────────────────────────────────────────────
    refinery: {
        online: true,
        refinedOres: 0,
        upgradeLevel: 1,
        refineRate: 0.5,
        storageMax: 30,   // cap de armazenamento refined
        wear: 0,
        get efficiency() {
            const wearPenalty = Math.max(0, this.wear / 100 * 0.4);
            return GameState.reactor.efficiency * (GameState.water.pumpOnline ? 1.0 : 0.4) * (1 - wearPenalty);
        },
        get ratePerTick() {
            return this.refineRate * this.upgradeLevel * this.efficiency;
        }
    },

    // ─── SSM ──────────────────────────────────────────────────────
    ssm: {
        autoSell: false,
        sellMode: 'always',
        sellThreshold: 50,
        rawOrePrice: 2,
        refinedOrePrice: 8,
        priceVarianceTimer: 0,
        upgradeLevel: 1,
        get rawPrice()     { return this.rawOrePrice; },
        get refinedPrice() { return this.refinedOrePrice; }
    },

    // ─── SECURITY ─────────────────────────────────────────────────
    security: {
        level: 1,
        threats: [],
        nextThreatTimer: 0,
        threatInterval: 120,
        // Perimeter sensors — motion detection zones
        perimeter: {
            zones: ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON'],
            alerts: [],   // { zone, time, resolved }
            motionTimer: 0,
            motionInterval: 180, // ticks entre eventos de perim
        }
    },

    // ─── WORKSHOP ────────────────────────────────────────────────
    workshop: {
        upgrades: {
            reactor:  { level: 1, cost: 100 },
            mining:   { level: 1, cost: 50  },
            refinery: { level: 1, cost: 75  },
            water:    { level: 1, cost: 60  },
            ssm:      { level: 1, cost: 80  },
            security: { level: 1, cost: 90  },
        }
    },

    // ─── HELPERS ─────────────────────────────────────────────────
    formatCash(val) {
        if (val >= 1_000_000) return `${(val/1_000_000).toFixed(2)}M$`;
        if (val >= 1_000)     return `${(val/1_000).toFixed(1)}k$`;
        return `${Math.floor(val)}$`;
    },

    addLog(msg, type = 'info') {
        const now = new Date();
        const ts  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        this.eventLog.unshift({ ts, msg, type });
        if (this.eventLog.length > 60) this.eventLog.pop();
        this.emit('log', { ts, msg, type });
    },

    _listeners: {},
    on(event, fn)   { if (!this._listeners[event]) this._listeners[event] = []; this._listeners[event].push(fn); },
    emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); }
};

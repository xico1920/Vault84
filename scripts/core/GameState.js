// GameState.js - Estado global do jogo. Tudo passa por aqui.

export const GameState = {
    // ─── ECONOMIA ────────────────────────────────────────────────
    cash: 0,

    // ─── REACTOR CORE ────────────────────────────────────────────
    reactor: {
        online: true,
        temperature: 720,       // °C  (< 1000 = 100%, > 1500 = 0%)
        targetTemp: 720,
        coolantFlow: 'optimal', // 'low' | 'regular' | 'optimal'
        upgradeLevel: 1,

        get powerGW() {
            return this.online ? 2.4 * this.upgradeLevel : 0;
        },
        get efficiency() {
            if (!this.online) return 0;
            if (this.temperature <= 1000) return 1.0;
            if (this.temperature >= 1500) return 0.0;
            return 1.0 - (this.temperature - 1000) / 500;
        },
        get status() {
            if (!this.online) return 'OFFLINE';
            if (this.temperature >= 1500) return 'CRITICAL';
            if (this.temperature >= 1000) return 'WARNING';
            return 'ONLINE';
        }
    },

    // ─── WATER TREATMENT ─────────────────────────────────────────
    water: {
        pumpOnline: true,
        flowRate: 100,      // L/min base
        upgradeLevel: 1,

        get coolingPower() {
            if (!this.pumpOnline) return 0;
            // Quanto mais power vem do reactor, mais precisa de água
            const base = this.flowRate * this.upgradeLevel;
            return base;
        }
    },

    // ─── MINING SHAFT ────────────────────────────────────────────
    mining: {
        online: true,
        rawOres: 0,
        totalMined: 0,
        autoRate: 1,        // ores/tick automático
        upgradeLevel: 1,
        lastClickBonus: 0,

        get ratePerTick() {
            const reactorBoost = GameState.reactor.efficiency;
            return this.autoRate * this.upgradeLevel * reactorBoost;
        }
    },

    // ─── ORE REFINERY ─────────────────────────────────────────────
    refinery: {
        online: true,
        refinedOres: 0,
        upgradeLevel: 1,
        refineRate: 0.5,    // ores refinadas por tick (por raw ore consumida)

        get efficiency() {
            return GameState.reactor.efficiency * (GameState.water.pumpOnline ? 1.0 : 0.4);
        },
        get ratePerTick() {
            return this.refineRate * this.upgradeLevel * this.efficiency;
        }
    },

    // ─── SSM ──────────────────────────────────────────────────────
    ssm: {
        autoSell: false,
        sellMode: 'always',     // 'always' | 'threshold'
        sellThreshold: 50,
        rawOrePrice: 2,         // $ por raw ore (varia)
        refinedOrePrice: 8,     // $ por refined ore (varia)
        priceVarianceTimer: 0,
        upgradeLevel: 1,

        get rawPrice() { return this.rawOrePrice; },
        get refinedPrice() { return this.refinedOrePrice; }
    },

    // ─── SECURITY ─────────────────────────────────────────────────
    security: {
        level: 1,
        threats: [],        // { id, type, target, severity, active }
        nextThreatTimer: 0,
        threatInterval: 120, // ticks entre ameaças
    },

    // ─── WORKSHOP ────────────────────────────────────────────────
    workshop: {
        upgrades: {
            reactor:  { level: 1, cost: 100  },
            mining:   { level: 1, cost: 50   },
            refinery: { level: 1, cost: 75   },
            water:    { level: 1, cost: 60   },
            ssm:      { level: 1, cost: 80   },
            security: { level: 1, cost: 90   },
        }
    },

    // ─── HELPERS ─────────────────────────────────────────────────
    formatCash(val) {
        if (val >= 1_000_000) return `${(val/1_000_000).toFixed(2)}M$`;
        if (val >= 1_000)     return `${(val/1_000).toFixed(1)}k$`;
        return `${Math.floor(val)}$`;
    },

    // listeners para UI reactive
    _listeners: {},
    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    },
    emit(event, data) {
        (this._listeners[event] || []).forEach(fn => fn(data));
    }
};

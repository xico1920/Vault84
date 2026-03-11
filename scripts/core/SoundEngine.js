// SoundEngine.js — soft click sounds + threat warning

class SoundEngine {
    constructor() {
        this._ctx = null;
        this._vol = 0.18;
    }

    _init() {
        if (this._ctx) return;
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    _resume() {
        try { if (this._ctx?.state === 'suspended') this._ctx.resume(); } catch(e) {}
    }

    setVolume(v) { this._vol = v; }

    // Soft mouse click — gentle low transient, not harsh
    click() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx, now = ctx.currentTime;

            // Very short low-freq thump — like a soft physical button press
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(180, now);
            o.frequency.exponentialRampToValueAtTime(60, now + 0.025);
            g.gain.setValueAtTime(this._vol * 0.4, now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
            o.connect(g); g.connect(ctx.destination);
            o.start(now); o.stop(now + 0.035);
        } catch(e) {}
    }

    // Nav transition — whisper-quiet, two soft tones
    navTransition() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx, now = ctx.currentTime;
            [0, 0.055].forEach((dt, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = i === 0 ? 320 : 440;
                g.gain.setValueAtTime(this._vol * 0.15, now + dt);
                g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.07);
                o.connect(g); g.connect(ctx.destination);
                o.start(now + dt); o.stop(now + dt + 0.08);
            });
        } catch(e) {}
    }

    // All other sounds are just the same soft click
    confirm()      { this.click(); }
    error()        { this.click(); }
    alert()        { this.click(); }
    reactorOnline(){ this.click(); }
    sell()         { this.click(); }
    mine()         { this.click(); }
    upgrade()      { this.click(); }
    // Power ON — phosphor hum building up, low thrum rising to a clean tone
    powerOn() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx, now = ctx.currentTime;

            // Deep thrum — like capacitors charging
            const thrum = ctx.createOscillator();
            const thrumG = ctx.createGain();
            thrum.type = 'sawtooth';
            thrum.frequency.setValueAtTime(40, now);
            thrum.frequency.exponentialRampToValueAtTime(120, now + 0.8);
            thrumG.gain.setValueAtTime(0, now);
            thrumG.gain.linearRampToValueAtTime(this._vol * 0.35, now + 0.15);
            thrumG.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
            // Low-pass to keep it warm not harsh
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = 300;
            thrum.connect(lp); lp.connect(thrumG); thrumG.connect(ctx.destination);
            thrum.start(now); thrum.stop(now + 1.1);

            // High phosphor whine — like the flyback transformer
            const whine = ctx.createOscillator();
            const whineG = ctx.createGain();
            whine.type = 'sine';
            whine.frequency.setValueAtTime(8000, now + 0.3);
            whine.frequency.exponentialRampToValueAtTime(15700, now + 1.1);
            whineG.gain.setValueAtTime(0, now + 0.3);
            whineG.gain.linearRampToValueAtTime(this._vol * 0.08, now + 0.5);
            whineG.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            whine.connect(whineG); whineG.connect(ctx.destination);
            whine.start(now + 0.3); whine.stop(now + 1.3);

            // Final "settled" beep — monitor ready
            const beep = ctx.createOscillator();
            const beepG = ctx.createGain();
            beep.type = 'sine';
            beep.frequency.value = 880;
            beepG.gain.setValueAtTime(0, now + 1.1);
            beepG.gain.linearRampToValueAtTime(this._vol * 0.25, now + 1.13);
            beepG.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
            beep.connect(beepG); beepG.connect(ctx.destination);
            beep.start(now + 1.1); beep.stop(now + 1.4);
        } catch(e) {}
    }

    // Power OFF — whine descends, thrum dies, magnetic thud at the end
    powerOff() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx, now = ctx.currentTime;

            // Descending phosphor whine — flyback dying
            const whine = ctx.createOscillator();
            const whineG = ctx.createGain();
            whine.type = 'sine';
            whine.frequency.setValueAtTime(15700, now);
            whine.frequency.exponentialRampToValueAtTime(200, now + 0.55);
            whineG.gain.setValueAtTime(this._vol * 0.10, now);
            whineG.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            whine.connect(whineG); whineG.connect(ctx.destination);
            whine.start(now); whine.stop(now + 0.65);

            // Low thud — degaussing coil thump
            const thud = ctx.createOscillator();
            const thudG = ctx.createGain();
            thud.type = 'sine';
            thud.frequency.setValueAtTime(80, now + 0.45);
            thud.frequency.exponentialRampToValueAtTime(20, now + 0.75);
            thudG.gain.setValueAtTime(0, now + 0.45);
            thudG.gain.linearRampToValueAtTime(this._vol * 0.5, now + 0.48);
            thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            thud.connect(thudG); thudG.connect(ctx.destination);
            thud.start(now + 0.45); thud.stop(now + 0.85);
        } catch(e) {}
    }

    // Threat resolved — clean rising two-tone confirm, satisfying
    resolve() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx, now = ctx.currentTime;
            // Two clean sine tones ascending — like "cleared"
            [[0, 440, 520], [0.12, 660, 0]].forEach(([dt, f1, f2]) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(f1, now + dt);
                if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dt + 0.08);
                g.gain.setValueAtTime(0, now + dt);
                g.gain.linearRampToValueAtTime(this._vol * 0.45, now + dt + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.18);
                o.connect(g); g.connect(ctx.destination);
                o.start(now + dt); o.stop(now + dt + 0.20);
            });
        } catch(e) {}
    }
    threat() {
        try {
            this._init(); this._resume();
            const ctx = this._ctx;
            // Two pulses with a short gap — like a vault alarm ping
            [0, 0.28].forEach((delay, i) => {
                const now = ctx.currentTime + delay;

                // Main tone — low sine, drops in pitch
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(i === 0 ? 220 : 180, now);
                o.frequency.exponentialRampToValueAtTime(i === 0 ? 160 : 130, now + 0.22);
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(this._vol * 0.55, now + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
                o.connect(g); g.connect(ctx.destination);
                o.start(now); o.stop(now + 0.26);

                // Sub harmonic layer — adds body without harshness
                const o2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                o2.type = 'triangle';
                o2.frequency.setValueAtTime(i === 0 ? 110 : 90, now);
                g2.gain.setValueAtTime(0, now);
                g2.gain.linearRampToValueAtTime(this._vol * 0.20, now + 0.02);
                g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);
                o2.connect(g2); g2.connect(ctx.destination);
                o2.start(now); o2.stop(now + 0.22);
            });
        } catch(e) {}
    }
}

export const SE = new SoundEngine();

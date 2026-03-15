// MusicEngine.js — Simple audio player, local files + user uploads

export class MusicEngine {
    constructor() {
        this.audio      = new Audio();
        this.audio.loop = false;
        this.tracks     = []; // { label, src, type } — type: 'local'|'user'
        this.current    = -1;
        this.volume     = 0.4;
        this.audio.volume = this.volume;
        this._onChange  = null;

        // When a track ends, auto-advance
        this.audio.addEventListener('ended', () => this.next());
    }

    // Add local bundled tracks (called at init)
    addLocal(label, src) {
        this.tracks.push({ label, src, type: 'local' });
        if (this.current === -1) this.current = 0;
    }

    // Add user-uploaded file
    addUserFile(file) {
        const url = URL.createObjectURL(file);
        const label = file.name.replace(/\.[^.]+$/, '').toUpperCase();
        this.tracks.push({ label, src: url, type: 'user' });
        if (this.current === -1) this.current = 0;
        this._notify();
    }

    removeTrack(idx) {
        if (this.tracks[idx]?.type === 'user') URL.revokeObjectURL(this.tracks[idx].src);
        const wasPlaying = this.isPlaying() && this.current === idx;
        this.tracks.splice(idx, 1);
        if (this.current >= this.tracks.length) this.current = this.tracks.length - 1;
        if (wasPlaying && this.tracks.length) this.play(this.current);
        else if (wasPlaying) this.audio.pause();
        this._notify();
    }

    play(idx) {
        if (idx !== undefined) this.current = idx;
        if (this.current < 0 || this.current >= this.tracks.length) return;
        this.audio.src = this.tracks[this.current].src;
        this.audio.volume = this.volume;
        this.audio.play().catch(() => {});
        this._notify();
    }

    pause() { this.audio.pause(); this._notify(); }

    toggle() {
        if (this.isPlaying()) this.pause();
        else this.play();
    }

    next() {
        if (!this.tracks.length) return;
        this.play((this.current + 1) % this.tracks.length);
    }

    prev() {
        if (!this.tracks.length) return;
        // If >3s in, restart current; else go prev
        if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
        this.play((this.current - 1 + this.tracks.length) % this.tracks.length);
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        this.audio.volume = this.volume;
        this._notify();
    }

    isPlaying() { return !this.audio.paused && !this.audio.ended; }
    getTrack()  { return this.tracks[this.current] || null; }
    getDuration(){ return this.audio.duration || 0; }
    getCurrentTime(){ return this.audio.currentTime || 0; }
    seekTo(t)   { this.audio.currentTime = t; }

    onChange(fn) { this._onChange = fn; }
    _notify()    { this._onChange?.(); }
}

export const musicEngine = new MusicEngine();

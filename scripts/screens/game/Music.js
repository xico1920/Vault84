// Music.js — Music player screen

import { musicEngine } from '../../core/MusicEngine.js';
const tr = k => window.t?.(k) ?? k;

function fmt(s) {
    if (!isFinite(s)) return '--:--';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2,'0')}`;
}

export function createMusicScreen() {
    let rafId = null;

    function buildTrackList() {
        if (!musicEngine.tracks.length) return `
            <div style="color:var(--muted);font-size:0.75rem;padding:1rem;text-align:center;border:1px dashed var(--muted);">
                NO TRACKS — place mp3s in assets/audio/music/ or upload below
            </div>`;
        return musicEngine.tracks.map((t, i) => {
            const active = musicEngine.current === i;
            return `<div class="mus-row" data-idx="${i}" style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-left:2px solid ${active?'var(--hi)':'transparent'};background:${active?'rgba(20,253,206,0.05)':'transparent'};cursor:pointer;">
                <span style="font-size:0.58rem;color:var(--muted);min-width:18px;">${String(i+1).padStart(2,'0')}</span>
                <span style="flex:1;font-size:0.8rem;color:${active?'var(--hi)':'var(--dim)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.label}</span>
                <span style="font-size:0.58rem;color:var(--muted);">${t.type==='user'?'USER':'LOCAL'}</span>
                ${active&&musicEngine.isPlaying()?'<span style="color:var(--hi);animation:blink-cursor 1s infinite;font-size:0.7rem;">♪</span>':''}
                <button class="mus-del btn btn-sm" data-idx="${i}" style="font-size:0.58rem;padding:1px 5px;border-color:var(--muted);color:var(--muted);opacity:0.5;">✕</button>
            </div>`;
        }).join('');
    }

    function refreshList() {
        const el = document.getElementById('mus-list');
        if (!el) return;
        el.innerHTML = buildTrackList();
        el.querySelectorAll('.mus-row').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.classList.contains('mus-del')) return;
                musicEngine.play(+row.dataset.idx);
                refreshList();
            });
        });
        el.querySelectorAll('.mus-del').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                musicEngine.removeTrack(+btn.dataset.idx);
                refreshList();
            });
        });
    }

    function updateUI() {
        const on  = musicEngine.isPlaying();
        const cur = musicEngine.getCurrentTime();
        const dur = musicEngine.getDuration();
        const pct = dur ? (cur / dur * 100) : 0;
        const t   = musicEngine.getTrack();
        const vol = Math.round(musicEngine.volume * 100);

        const $ = id => document.getElementById(id);
        const title = $('mus-title'); if (title) title.textContent = t ? t.label : '-- NO TRACK LOADED --';
        const curEl = $('mus-cur');   if (curEl) curEl.textContent = fmt(cur);
        const durEl = $('mus-dur');   if (durEl) durEl.textContent = fmt(dur);
        const prog  = $('mus-prog');  if (prog)  prog.style.width  = pct + '%';
        const play  = $('mus-play');
        if (play) { play.textContent = on ? '⏸ PAUSE' : '▶ PLAY'; play.className = `btn ${on?'btn-primary':''}`; play.style.cssText='padding:5px 18px;letter-spacing:2px;min-width:80px;'; }
        const stat  = $('mus-status'); if (stat) { stat.textContent = on?'PLAYING':'STOPPED'; stat.style.color = on?'var(--hi)':'var(--muted)'; }
        const vstat = $('mus-vol-stat'); if (vstat) vstat.textContent = vol + '%';
        const vlbl  = $('mus-vol-lbl'); if (vlbl) vlbl.textContent = vol + '%';
        const vsldr = $('mus-vol');  if (vsldr) vsldr.value = vol;
    }

    return {
        render() {
            const on  = musicEngine.isPlaying();
            const vol = Math.round(musicEngine.volume * 100);
            const t   = musicEngine.getTrack();

            return `
            <div class="dept-layout" style="grid-template-columns:1fr 200px;">
              <div class="dept-main">
                <h1>${tr('nav_music')}</h1>
                <h2>${tr('mus_h2')}</h2>

                <div class="panel" style="margin-bottom:0.75rem;">
                  <div class="panel-title">${tr('mus_now_playing')}</div>
                  <div id="mus-title" style="font-size:1.1rem;color:var(--hi);letter-spacing:2px;margin:0.35rem 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${t ? t.label : '-- NO TRACK LOADED --'}
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:0.5rem;">
                    <span id="mus-cur" style="font-size:0.62rem;color:var(--muted);min-width:30px;">0:00</span>
                    <div id="mus-prog-wrap" style="flex:1;height:4px;background:var(--muted);cursor:pointer;">
                      <div id="mus-prog" style="height:100%;width:0%;background:var(--hi);"></div>
                    </div>
                    <span id="mus-dur" style="font-size:0.62rem;color:var(--muted);min-width:30px;text-align:right;">--:--</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                    <button id="mus-prev" class="btn btn-sm">◀◀</button>
                    <button id="mus-play" class="btn ${on?'btn-primary':''}" style="padding:5px 18px;letter-spacing:2px;min-width:80px;">${on?'⏸ PAUSE':'▶ PLAY'}</button>
                    <button id="mus-next" class="btn btn-sm">▶▶</button>
                    <div style="margin-left:auto;display:flex;align-items:center;gap:5px;font-size:0.68rem;color:var(--muted);">
                      VOL <input id="mus-vol" type="range" min="0" max="100" value="${vol}" style="width:70px;accent-color:var(--hi);cursor:pointer;">
                      <span id="mus-vol-lbl" style="color:var(--dim);min-width:26px;">${vol}%</span>
                    </div>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title" style="margin-bottom:0.4rem;">${tr('mus_tracklist')}</div>
                  <div id="mus-list"></div>
                </div>

                <div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.6rem;">
                  <label style="cursor:pointer;">
                    <span class="btn btn-sm" style="letter-spacing:2px;">+ UPLOAD</span>
                    <input id="mus-upload" type="file" accept=".mp3,.ogg,.wav,.flac" multiple style="display:none;">
                  </label>
                  <span style="font-size:0.58rem;color:var(--muted);">mp3 · ogg · wav · flac</span>
                </div>
              </div>

              <div class="dept-sidebar">
                <div class="panel">
                  <div class="panel-title">// STATUS</div>
                  <div class="stat-row" style="margin-top:0.4rem;">
                    <span>STATE</span>
                    <span id="mus-status" style="color:${on?'var(--hi)':'var(--muted)'};">${on?'PLAYING':'STOPPED'}</span>
                  </div>
                  <div class="stat-row">
                    <span>TRACKS</span>
                    <span>${musicEngine.tracks.length}</span>
                  </div>
                  <div class="stat-row">
                    <span>VOLUME</span>
                    <span id="mus-vol-stat">${vol}%</span>
                  </div>
                </div>
                <div class="panel" style="font-size:0.62rem;color:var(--muted);line-height:1.9;">
                  <div class="panel-title" style="margin-bottom:0.3rem;">// HELP</div>
                  <div>▶ play / pause</div>
                  <div>◀◀ / ▶▶ skip</div>
                  <div>Click track to select</div>
                  <div>Click bar to seek</div>
                  <div style="margin-top:0.5rem;color:#1a3a28;font-size:0.58rem;">Music continues<br>while browsing<br>other tabs.</div>
                </div>
              </div>
            </div>`;
        },

        onRendered() {
            document.getElementById('mus-play')?.addEventListener('click', () => { musicEngine.toggle(); updateUI(); });
            document.getElementById('mus-prev')?.addEventListener('click', () => { musicEngine.prev(); updateUI(); refreshList(); });
            document.getElementById('mus-next')?.addEventListener('click', () => { musicEngine.next(); updateUI(); refreshList(); });

            document.getElementById('mus-vol')?.addEventListener('input', e => {
                musicEngine.setVolume(e.target.value / 100);
                const lbl = document.getElementById('mus-vol-lbl');
                const st  = document.getElementById('mus-vol-stat');
                if (lbl) lbl.textContent = e.target.value + '%';
                if (st)  st.textContent  = e.target.value + '%';
            });

            document.getElementById('mus-prog-wrap')?.addEventListener('click', e => {
                const rect = e.currentTarget.getBoundingClientRect();
                musicEngine.seekTo((e.clientX - rect.left) / rect.width * musicEngine.getDuration());
            });

            document.getElementById('mus-upload')?.addEventListener('change', e => {
                Array.from(e.target.files).forEach(f => musicEngine.addUserFile(f));
                e.target.value = '';
                refreshList();
            });

            refreshList();
            rafId = setInterval(updateUI, 300);
        },

        onExit() {
            if (rafId) { clearInterval(rafId); rafId = null; }
        }
    };
}

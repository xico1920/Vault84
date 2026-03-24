import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { showTutorial } from '../../core/TutorialOverlay.js';
import { exportSave, importSave, getLeaderboard } from '../../core/SaveSystem.js';
import { GameState } from '../../core/GameState.js';
import { SE } from '../../core/SoundEngine.js';
const t = k => window.t?.(k) ?? k;

export function createSettingsScreen(USERNAME_KEY, audio) {
    let viewer3d=null;
    return {
        async render() {
            const vol=audio?.sounds?.bg?Math.round((audio.sounds.bg.volume||0.1)*100):10;
            const sfxVol = Math.round((SE._vol || 0.18) * 100);
            const curLang = window.getLang?.() || localStorage.getItem('vault84_lang') || 'EN';
            const board = getLeaderboard();
            const diffs = ['EASY', 'STANDARD', 'HARD', 'NIGHTMARE'];
            const diffColors = { EASY:'#14fdce', STANDARD:'#d4e800', HARD:'#ff8800', NIGHTMARE:'#ff2222' };

            const leaderboardHTML = diffs.map(d => {
                const run = board[d];
                if (!run) return `<div class="stat-row"><span class="key" style="color:${diffColors[d]};font-size:0.68rem;">${d}</span><span class="val" style="color:#1a4a2a;">--</span></div>`;
                const mins = Math.floor(run.timeSeconds / 60), secs = run.timeSeconds % 60;
                return `<div style="border-left:2px solid ${diffColors[d]};padding:3px 6px;margin-bottom:4px;background:rgba(0,0,0,0.2);">
                    <div style="color:${diffColors[d]};font-size:0.65rem;letter-spacing:1px;">${d}</div>
                    <div style="color:#14fdce;font-size:0.72rem;">${GameState.formatCash(run.cashEarned)}</div>
                    <div style="color:#3d9970;font-size:0.58rem;">${run.oreMined} ore mined · ${run.threatsResolved} threats · ${mins}m${secs}s</div>
                </div>`;
            }).join('');

            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>${t('set_title')}</h1>
                <h2>${t('set_sub')}</h2>

                <div class="panel">
                  <div class="panel-title">${t('set_language')}</div>
                  <div style="display:flex;gap:4px;">
                    <button id="set-lang-pt" class="btn btn-sm" style="letter-spacing:3px;padding:4px 16px;${curLang==='PT'?'background:#14fdce;color:#020f07;border-color:#14fdce;':''}">PT</button>
                    <button id="set-lang-en" class="btn btn-sm" style="letter-spacing:3px;padding:4px 16px;${curLang==='EN'?'background:#14fdce;color:#020f07;border-color:#14fdce;':''}">EN</button>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('set_audio')}</div>
                  <div class="stat-row" style="margin-bottom:0.5rem;">
                    <span class="key" style="min-width:160px;">${t('set_bg_music')}</span>
                    <input id="set-bgvol" type="range" min="0" max="100" value="${vol}" style="flex:1;accent-color:#14fdce;margin:0 0.75rem;">
                    <span class="val" id="set-bgvol-lbl">${vol}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="key" style="min-width:160px;">${t('set_sfx')}</span>
                    <input id="set-sfxvol" type="range" min="0" max="100" value="${sfxVol}" style="flex:1;accent-color:#14fdce;margin:0 0.75rem;">
                    <span class="val" id="set-sfxvol-lbl">${sfxVol}%</span>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('set_general')}</div>
                  <p class="label" style="margin-bottom:0.75rem;">${t('set_autosave')}</p>
                  <button id="set-lore" class="btn" style="padding:7px 20px;letter-spacing:2px;display:block;margin-bottom:6px;">${t('set_lore_btn')}</button>
                  <button id="set-tutorial" class="btn" style="padding:7px 20px;letter-spacing:2px;display:block;margin-bottom:6px;">${t('set_tutorial_btn')}</button>
                  <button id="set-clear" class="btn btn-danger" style="padding:7px 20px;letter-spacing:2px;display:block;">${t('set_clear_btn')}</button>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('set_save_data')}</div>
                  <p class="label" style="margin-bottom:0.75rem;">${t('set_save_desc')}</p>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="set-export" class="btn" style="padding:7px 18px;letter-spacing:2px;border-color:#14fdce;color:#14fdce;">${t('set_export_btn')}</button>
                    <button id="set-import-btn" class="btn" style="padding:7px 18px;letter-spacing:2px;border-color:#5ecba8;color:#5ecba8;">${t('set_import_btn')}</button>
                    <input id="set-import-file" type="file" accept=".json" style="display:none;">
                  </div>
                  <div id="set-import-status" style="margin-top:6px;font-size:0.65rem;color:#3d9970;min-height:14px;"></div>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('set_best_runs')}</div>
                  <div style="margin-top:0.4rem;">${leaderboardHTML}</div>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('set_about')}</div>
                  <p class="label">VAULT 84 -- VOLTEC SYSTEMS</p>
                  <p class="label">BUILD 0.2.0</p>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-settings','SETTINGS')}
                <div class="panel mini-stats">
                  <div class="panel-title">${t('set_shortcuts')}</div>
                  <div style="font-size:0.62rem;color:#3d9970;line-height:1.8;">
                    <div><span style="color:#14fdce;">1</span> STATUS &nbsp;<span style="color:#14fdce;">2</span> REACTOR</div>
                    <div><span style="color:#14fdce;">3</span> MINING &nbsp;<span style="color:#14fdce;">4</span> REFINERY</div>
                    <div><span style="color:#14fdce;">5</span> WATER &nbsp;&nbsp;<span style="color:#14fdce;">6</span> SSM</div>
                    <div><span style="color:#14fdce;">7</span> WORKSHOP <span style="color:#14fdce;">8</span> SECURITY</div>
                    <div><span style="color:#14fdce;">9</span> MUSIC &nbsp;&nbsp;<span style="color:#14fdce;">0</span> SETTINGS</div>
                    <div><span style="color:#14fdce;">C</span> CREDITS</div>
                  </div>
                </div>
                <div class="panel mini-stats">
                  <div class="panel-title">${t('set_system')}</div>
                  <p>OVERSEER<span style="color:#14fdce;">ACTIVE</span></p>
                  <p>SESSION<span>TEMP</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            // ── Language buttons ──────────────────────────────────
            ['pt','en'].forEach(lang => {
                document.getElementById(`set-lang-${lang}`)?.addEventListener('click', () => {
                    const newLang = lang.toUpperCase();
                    if ((window.getLang?.() || localStorage.getItem('vault84_lang') || 'EN') === newLang) return;
                    localStorage.setItem('vault84_lang', newLang);
                    if (window._setLang) window._setLang(newLang);
                    if (window._applyLangUI) window._applyLangUI(newLang);
                    if (window._playLangGlitch) window._playLangGlitch();
                });
            });

            document.getElementById('set-bgvol')?.addEventListener('input',e=>{
                if(audio?.sounds?.bg)audio.setVolume('bg',e.target.value/100);
                const l=document.getElementById('set-bgvol-lbl');if(l)l.textContent=`${e.target.value}%`;
            });
            document.getElementById('set-sfxvol')?.addEventListener('input',e=>{
                SE.setVolume(e.target.value / 100);
                const l=document.getElementById('set-sfxvol-lbl');if(l)l.textContent=`${e.target.value}%`;
            });
            document.getElementById('set-lore')?.addEventListener('click', () => {
                localStorage.removeItem('vault84_lore_seen');
                window._pauseGame?.();
                window._screenManager?.navigateTo('lore');
            });
            document.getElementById('set-tutorial')?.addEventListener('click', () => {
                const username = localStorage.getItem(USERNAME_KEY) || 'Overseer';
                showTutorial(username);
            });
            document.getElementById('set-clear')?.addEventListener('click',()=>{
                if(confirm('Wipe all data and restart from the beginning?')){
                    localStorage.clear();
                    location.reload();
                }
            });

            // ── Export save ───────────────────────────────────────
            document.getElementById('set-export')?.addEventListener('click', () => {
                const ok = exportSave();
                const status = document.getElementById('set-import-status');
                if (status) {
                    status.textContent = ok ? '// SAVE EXPORTED SUCCESSFULLY' : '// NO SAVE DATA FOUND';
                    status.style.color = ok ? '#14fdce' : '#ff8800';
                    setTimeout(() => { if(status) status.textContent = ''; }, 3000);
                }
            });

            // ── Import save ───────────────────────────────────────
            document.getElementById('set-import-btn')?.addEventListener('click', () => {
                document.getElementById('set-import-file')?.click();
            });
            document.getElementById('set-import-file')?.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const status = document.getElementById('set-import-status');
                    const ok = importSave(ev.target.result, GameState);
                    if (status) {
                        status.textContent = ok ? '// SAVE IMPORTED — RELOADING...' : '// IMPORT FAILED — INVALID FILE';
                        status.style.color = ok ? '#14fdce' : '#ff2222';
                    }
                    if (ok) setTimeout(() => location.reload(), 1200);
                };
                reader.readAsText(file);
                // Reset input so same file can be re-imported
                e.target.value = '';
            });

            viewer3d=mountDeptModel('canvas-settings','settings',{
                cz:3.8,
                animate:(model,scene,t)=>{
                    // Gears face camera (XY plane) — rotate on Z axis
                    // Ratio 12:7, opposite directions (meshing)
                    if(model.userData.bigGear)   model.userData.bigGear.rotation.z   =  t * 0.0008;
                    if(model.userData.smallGear) model.userData.smallGear.rotation.z = -t * 0.0008 * (12/7);
                }
            });
        },

        onExit() { viewer3d?.dispose(); }
    };
}

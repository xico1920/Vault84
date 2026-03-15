import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { showTutorial } from '../../core/TutorialOverlay.js';

export function createSettingsScreen(USERNAME_KEY, audio) {
    let viewer3d=null;
    return {
        async render() {
            const vol=audio?.sounds?.bg?Math.round((audio.sounds.bg.volume||0.1)*100):10;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>SETTINGS</h1>
                <h2>SYSTEM CONFIGURATION</h2>

                <div class="panel">
                  <div class="panel-title">AUDIO</div>
                  <div class="stat-row" style="margin-bottom:0.5rem;">
                    <span class="key" style="min-width:160px;">BACKGROUND MUSIC</span>
                    <input id="set-bgvol" type="range" min="0" max="100" value="${vol}" style="flex:1;accent-color:#14fdce;margin:0 0.75rem;">
                    <span class="val" id="set-bgvol-lbl">${vol}%</span>
                  </div>
                  <div class="stat-row">
                    <span class="key" style="min-width:160px;">SOUND EFFECTS</span>
                    <input id="set-sfxvol" type="range" min="0" max="100" value="80" style="flex:1;accent-color:#14fdce;margin:0 0.75rem;">
                    <span class="val" id="set-sfxvol-lbl">80%</span>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">GENERAL</div>
                  <p class="label" style="margin-bottom:0.75rem;">Game saves automatically every 30 seconds.</p>
                  <button id="set-lore" class="btn" style="padding:7px 20px;letter-spacing:2px;display:block;margin-bottom:6px;">VIEW LORE</button>
                  <button id="set-tutorial" class="btn" style="padding:7px 20px;letter-spacing:2px;display:block;margin-bottom:6px;">VIEW TUTORIAL AGAIN</button>
                  <button id="set-clear" class="btn btn-danger" style="padding:7px 20px;letter-spacing:2px;display:block;">WIPE ALL DATA &amp; RESTART</button>
                </div>

                <div class="panel">
                  <div class="panel-title">ABOUT</div>
                  <p class="label">VAULT 84 -- VOLTEC SYSTEMS</p>
                  <p class="label">BUILD 0.1.0-ALPHA</p>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-settings','SETTINGS')}
                <div class="panel mini-stats">
                  <div class="panel-title">SYSTEM</div>
                  <p>OVERSEER<span style="color:#14fdce;">ACTIVE</span></p>
                  <p>SESSION<span>TEMP</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            document.getElementById('set-bgvol')?.addEventListener('input',e=>{
                if(audio?.sounds?.bg)audio.setVolume('bg',e.target.value/100);
                const l=document.getElementById('set-bgvol-lbl');if(l)l.textContent=`${e.target.value}%`;
            });
            document.getElementById('set-sfxvol')?.addEventListener('input',e=>{
                const l=document.getElementById('set-sfxvol-lbl');if(l)l.textContent=`${e.target.value}%`;
            });
            document.getElementById('set-lore')?.addEventListener('click', () => {
                localStorage.removeItem('vault84_lore_seen');
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

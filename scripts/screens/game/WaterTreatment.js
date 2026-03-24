import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
const t = k => window.t?.(k) ?? k;

export function createWaterTreatmentScreen() {
    let viewer3d = null, tickFn = null;
    const tc = t => t>1000?'#ff2222':t>800?'#ff8800':'#14fdce';

    function upd() {
        const w=GameState.water, r=GameState.reactor, $=id=>document.getElementById(id);
        const s=$('wt-st');   if(s){s.textContent=w.pumpOnline?'OPERATIONAL':'OFFLINE';s.style.color=w.pumpOnline?'#14fdce':'#ff2222';}
        const f=$('wt-fl');   if(f)f.textContent=w.pumpOnline?`${w.flowRate*w.upgradeLevel} L/min`:'0 L/min';
        const c=$('wt-cl');   if(c){c.textContent=w.pumpOnline?'ACTIVE':'INACTIVE';c.style.color=w.pumpOnline?'#14fdce':'#ff2222';}
        const t=$('wt-tmp');  if(t){t.textContent=`${r.temperature}C`;t.style.color=tc(r.temperature);}
        const b=$('wt-tbar'); if(b){b.style.width=`${Math.min(100,(r.temperature/1800)*100)}%`;b.style.background=tc(r.temperature);}
        const tog=$('wt-tog'); if(tog){tog.textContent=w.pumpOnline?t('wt_shutdown'):t('wt_start');tog.className=`btn ${w.pumpOnline?'btn-danger':''}`;}
        const wn=$('wt-warn'); if(wn)wn.style.display=(!w.pumpOnline&&r.temperature>800)?'block':'none';
    }

    return {
        async render() {
            const w=GameState.water, r=GameState.reactor;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>${t('wt_h1')}</h1>
                <h2>${t('wt_h2')}</h2>

                <div class="panel">
                  <div class="panel-title">${t('wt_pump')}</div>
                  <div class="stat-row"><span class="key">PUMP</span><span class="val" id="wt-st" style="color:${w.pumpOnline?'#14fdce':'#ff2222'}">${w.pumpOnline?'OPERATIONAL':'OFFLINE'}</span></div>
                  <div class="stat-row"><span class="key">FLOW RATE</span><span class="val" id="wt-fl">${w.pumpOnline?`${w.flowRate*w.upgradeLevel} L/min`:'0 L/min'}</span></div>
                  <div class="stat-row"><span class="key">COOLING LOOP</span><span class="val" id="wt-cl" style="color:${w.pumpOnline?'#14fdce':'#ff2222'}">${w.pumpOnline?'ACTIVE':'INACTIVE'}</span></div>
                </div>

                <div class="panel">
                  <div class="panel-title">${t('wt_thermal_feed')}</div>
                  <div class="stat-row"><span class="key">CORE TEMP</span><span class="val" id="wt-tmp" style="color:${tc(r.temperature)}">${r.temperature}C</span></div>
                  <div class="bar-track"><div class="bar-fill" id="wt-tbar" style="width:${Math.min(100,(r.temperature/1800)*100)}%;background:${tc(r.temperature)};"></div></div>
                  <div class="label">${t('wt_pump_desc')}</div>
                </div>

                <div id="wt-warn" style="display:${!w.pumpOnline&&r.temperature>800?'block':'none'};padding:0.5rem 0.75rem;border:1px solid #ff2222;color:#ff2222;margin:0.5rem 0;letter-spacing:1px;font-size:0.95rem;">
                  !! WARNING: REACTOR TEMP RISING -- PUMP OFFLINE
                </div>

                <button id="wt-tog" class="btn ${w.pumpOnline?'btn-danger':''}" style="width:100%;max-width:260px;padding:8px;font-size:1.1rem;letter-spacing:3px;margin-top:0.3rem;">
                  ${w.pumpOnline?t('wt_shutdown'):t('wt_start')}
                </button>

                <hr class="sep">
                <div class="label" style="line-height:2;">
                  <div>> Cools Reactor Core and Ore Refinery</div>
                  <div>> Shutdown risks meltdown if reactor stays online</div>
                  <div>> Upgrade in Workshop for higher flow rate</div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-water', t('wt_h1'))}
                <div class="panel mini-stats">
                  <div class="panel-title">${t('wt_specs')}</div>
                  <p>PUMP LVL<span>${w.upgradeLevel}</span></p>
                  <p>MAX FLOW<span>${w.flowRate*w.upgradeLevel} L/min</span></p>
                  <p>PWR DRAW<span>${(w.upgradeLevel*0.1).toFixed(1)} GW</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn = () => upd(); GameState.on('tick', tickFn);
            document.getElementById('wt-tog')?.addEventListener('click', () => { GameState.water.pumpOnline = !GameState.water.pumpOnline; upd(); });
            viewer3d = mountDeptModel('canvas-water', 'watertreatment', {
                cz: 3.8,
                animate: (model, _, t) => { if(model.children[7]) model.children[7].rotation.y = t * 0.002; }
            });
        },

        onExit() {
            if (tickFn && GameState._listeners['tick']) GameState._listeners['tick'] = GameState._listeners['tick'].filter(f => f !== tickFn);
            viewer3d?.dispose();
        }
    };
}

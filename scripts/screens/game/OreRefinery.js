import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';

export function createOreRefineryScreen() {
    let viewer3d = null, tickFn = null;
    const ec = e => { const p=Math.round(e*100); return p>60?'#14fdce':p>30?'#ff8800':'#ff2222'; };

    function upd() {
        const ref=GameState.refinery, r=GameState.reactor, w=GameState.water, $=id=>document.getElementById(id);
        const eff=ref.efficiency, p=Math.round(eff*100);
        const s=$('or-st'); if(s){s.textContent=ref.online&&eff>0?'OPERATIONAL':'OFFLINE';s.style.color=ref.online&&eff>0?'#14fdce':'#ff2222';}
        const e=$('or-eff'); if(e){e.textContent=`${p}%`;e.style.color=ec(eff);}
        const eb=$('or-eb'); if(eb){eb.style.width=`${p}%`;eb.style.background=ec(eff);}
        const rw=$('or-raw'); if(rw)rw.textContent=Math.floor(GameState.mining.rawOres);
        const rf=$('or-ref'); if(rf)rf.textContent=Math.floor(ref.refinedOres);
        const rt=$('or-rate'); if(rt)rt.textContent=`${ref.ratePerTick.toFixed(2)}/s`;
        const rc=$('or-reff'); if(rc){rc.textContent=`${Math.round(r.efficiency*100)}%`;rc.style.color=r.efficiency>0.6?'#14fdce':'#ff8800';}
        const wc=$('or-wst'); if(wc){wc.textContent=w.pumpOnline?'ONLINE':'OFFLINE';wc.style.color=w.pumpOnline?'#14fdce':'#ff2222';}
    }

    return {
        async render() {
            const ref=GameState.refinery, r=GameState.reactor, w=GameState.water, eff=ref.efficiency, p=Math.round(eff*100);
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>ORE REFINERY</h1>
                <h2>THERMAL PROCESSING UNIT</h2>

                <div class="panel">
                  <div class="panel-title">STATUS</div>
                  <div class="stat-row"><span class="key">OPERATIONAL</span><span class="val" id="or-st" style="color:${ref.online&&eff>0?'#14fdce':'#ff2222'}">${ref.online&&eff>0?'OPERATIONAL':'OFFLINE'}</span></div>
                  <div class="stat-row"><span class="key">EFFICIENCY</span><span class="val" id="or-eff" style="color:${ec(eff)}">${p}%</span></div>
                  <div class="bar-track"><div class="bar-fill" id="or-eb" style="width:${p}%;background:${ec(eff)};"></div></div>
                  <div class="stat-row"><span class="key">REFINE RATE</span><span class="val" id="or-rate">${ref.ratePerTick.toFixed(2)}/s</span></div>
                </div>

                <div class="panel">
                  <div class="panel-title">FLOW</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                    <div>
                      <div class="label">INPUT</div>
                      <div style="font-size:1.6rem;color:#d4e800;" id="or-raw">${Math.floor(GameState.mining.rawOres)}</div>
                      <div class="label">RAW ORES</div>
                    </div>
                    <div>
                      <div class="label">OUTPUT</div>
                      <div style="font-size:1.6rem;color:#14fdce;" id="or-ref">${Math.floor(ref.refinedOres)}</div>
                      <div class="label">REFINED ORES</div>
                    </div>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">EFFICIENCY FACTORS</div>
                  <div class="stat-row"><span class="key">REACTOR POWER</span><span class="val" id="or-reff" style="color:${r.efficiency>0.6?'#14fdce':'#ff8800'}">${Math.round(r.efficiency*100)}%</span></div>
                  <div class="stat-row"><span class="key">WATER COOLING</span><span class="val" id="or-wst" style="color:${w.pumpOnline?'#14fdce':'#ff2222'}">${w.pumpOnline?'ONLINE':'OFFLINE'}</span></div>
                  <div class="label" style="margin-top:0.4rem;">Without water: 40% max &nbsp;|&nbsp; Without reactor: halted</div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-refinery','ORE REFINERY')}
                <div class="panel mini-stats">
                  <div class="panel-title">SPECS</div>
                  <p>FURNACES<span>${ref.upgradeLevel}</span></p>
                  <p>PWR DRAW<span>${(ref.upgradeLevel*0.3).toFixed(1)} GW</span></p>
                  <p>SELL RATIO<span>1:4</span></p>
                  <div class="label" style="margin-top:0.4rem;">Refined = 4x raw value</div>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn = () => upd(); GameState.on('tick', tickFn);
            viewer3d = mountDeptModel('canvas-refinery', 'orerefinery', {
                cz: 3.5,
                animate: (model, _, t) => { if (model.children[2]) model.children[2].rotation.z = t * 0.001; }
            });
        },

        onExit() {
            if (tickFn && GameState._listeners['tick']) GameState._listeners['tick'] = GameState._listeners['tick'].filter(f => f !== tickFn);
            viewer3d?.dispose();
        }
    };
}

import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';

export function createSmartStorageUnitScreen() {
    let viewer3d=null, tickFn=null, priceFn=null;

    function upd() {
        const s=GameState.ssm, m=GameState.mining, ref=GameState.refinery, $=id=>document.getElementById(id);
        const rw=$('ssm-raw');  if(rw)rw.textContent=Math.floor(m.rawOres);
        const rf=$('ssm-ref');  if(rf)rf.textContent=Math.floor(ref.refinedOres);
        const ca=$('ssm-cash'); if(ca)ca.textContent=GameState.formatCash(GameState.cash);
        const rp=$('ssm-rp');   if(rp)rp.textContent=`${s.rawOrePrice.toFixed(1)}$`;
        const pp=$('ssm-pp');   if(pp)pp.textContent=`${s.refinedOrePrice.toFixed(1)}$`;
        const rt=$('ssm-rt');   if(rt){rt.textContent=s.rawOrePrice>2?'[+]':'[-]';rt.style.color=s.rawOrePrice>2?'#14fdce':'#ff2222';}
        const pt=$('ssm-pt');   if(pt){pt.textContent=s.refinedOrePrice>8?'[+]':'[-]';pt.style.color=s.refinedOrePrice>8?'#14fdce':'#ff2222';}
        const al=$('ssm-auto'); if(al){al.textContent=s.autoSell?'ENABLED':'DISABLED';al.style.color=s.autoSell?'#14fdce':'#3d9970';}
        const ml=$('ssm-mode'); if(ml)ml.textContent=s.sellMode==='always'?'SELL ALWAYS':`THRESHOLD (${s.sellThreshold}$)`;
    }

    function sellAll() {
        const s=GameState.ssm;
        const e = Math.floor(GameState.mining.rawOres)*s.rawOrePrice + Math.floor(GameState.refinery.refinedOres)*s.refinedOrePrice;
        GameState.cash += e;
        GameState.mining.rawOres = GameState.mining.rawOres % 1;
        GameState.refinery.refinedOres = GameState.refinery.refinedOres % 1;
        if(e>0) SE.sell();
        const fb=document.getElementById('ssm-fb');
        if(fb){fb.textContent=e>0?`>> SOLD ${GameState.formatCash(e)}`:'>> NOTHING TO SELL';fb.style.color=e>0?'#14fdce':'#3d9970';setTimeout(()=>{if(fb)fb.textContent='';},1500);}
        upd();
    }

    const mBtn = (id,lbl,active) =>
        `<button id="${id}" class="btn btn-sm" style="background:${active?'#14fdce':'transparent'};color:${active?'#020f07':'#14fdce'};">${lbl}</button>`;

    return {
        async render() {
            const s=GameState.ssm, m=GameState.mining, ref=GameState.refinery;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>SSM</h1>
                <h2>SMART STORAGE MANAGEMENT</h2>

                <div class="panel">
                  <div class="panel-title">TREASURY</div>
                  <div style="font-size:2.4rem;color:#14fdce;" id="ssm-cash">${GameState.formatCash(GameState.cash)}</div>
                </div>

                <div class="panel">
                  <div class="panel-title">INVENTORY</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.5rem;">
                    <div>
                      <div class="label">RAW ORES</div>
                      <div style="font-size:1.8rem;color:#d4e800;" id="ssm-raw">${Math.floor(m.rawOres)}</div>
                      <div class="label">@ <span id="ssm-rp">${s.rawOrePrice.toFixed(1)}$</span> <span id="ssm-rt">[-]</span></div>
                    </div>
                    <div>
                      <div class="label">REFINED ORES</div>
                      <div style="font-size:1.8rem;color:#14fdce;" id="ssm-ref">${Math.floor(ref.refinedOres)}</div>
                      <div class="label">@ <span id="ssm-pp">${s.refinedOrePrice.toFixed(1)}$</span> <span id="ssm-pt">[-]</span></div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <button id="ssm-sell" class="btn btn-primary" style="font-size:1.1rem;letter-spacing:2px;padding:7px 20px;">SELL ALL</button>
                    <span id="ssm-fb" style="font-size:0.9rem;color:#14fdce;"></span>
                  </div>
                </div>

                <div class="panel">
                  <div class="panel-title">AUTO-SELL</div>
                  <div class="stat-row" style="margin-bottom:0.4rem;"><span class="key">STATUS</span><span class="val" id="ssm-auto" style="color:${s.autoSell?'#14fdce':'#3d9970'}">${s.autoSell?'ENABLED':'DISABLED'}</span></div>
                  <button id="ssm-atog" class="btn btn-sm" style="margin-bottom:0.6rem;">${s.autoSell?'DISABLE':'ENABLE'} AUTO-SELL</button>
                  <div class="stat-row" style="margin-bottom:0.4rem;"><span class="key">MODE</span><span class="val label" id="ssm-mode">${s.sellMode==='always'?'SELL ALWAYS':`THRESHOLD (${s.sellThreshold}$)`}</span></div>
                  <div class="btn-group">
                    ${mBtn('ssm-ma','ALWAYS',s.sellMode==='always')}
                    ${mBtn('ssm-mt','THRESHOLD',s.sellMode==='threshold')}
                  </div>
                  <div class="label" style="margin-top:0.4rem;">THRESHOLD: only sells when avg price >= ${s.sellThreshold}$</div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-ssm','SMART STORAGE')}
                <div class="panel mini-stats">
                  <div class="panel-title">MARKET</div>
                  <p>BASE RAW<span>2.0$</span></p>
                  <p>BASE REF<span>8.0$</span></p>
                  <p>VARIANCE<span>+/- 20%</span></p>
                  <p>UPDATES<span>EVERY 15s</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn=()=>upd(); priceFn=()=>upd();
            GameState.on('tick',tickFn); GameState.on('priceUpdate',priceFn);
            document.getElementById('ssm-sell')?.addEventListener('click', sellAll);
            document.getElementById('ssm-atog')?.addEventListener('click',()=>{
                GameState.ssm.autoSell=!GameState.ssm.autoSell;
                const b=document.getElementById('ssm-atog'); if(b)b.textContent=(GameState.ssm.autoSell?'DISABLE':'ENABLE')+' AUTO-SELL';
                upd();
            });
            document.getElementById('ssm-ma')?.addEventListener('click',()=>{GameState.ssm.sellMode='always';const a=document.getElementById('ssm-ma'),t=document.getElementById('ssm-mt');if(a){a.style.background='#14fdce';a.style.color='#020f07';}if(t){t.style.background='transparent';t.style.color='#14fdce';}upd();});
            document.getElementById('ssm-mt')?.addEventListener('click',()=>{GameState.ssm.sellMode='threshold';const a=document.getElementById('ssm-ma'),t=document.getElementById('ssm-mt');if(a){a.style.background='transparent';a.style.color='#14fdce';}if(t){t.style.background='#14fdce';t.style.color='#020f07';}upd();});
            viewer3d = mountDeptModel('canvas-ssm','smartstorageunit',{cz:3.5});
        },

        onExit() {
            ['tick','priceUpdate'].forEach(e=>{if(GameState._listeners[e])GameState._listeners[e]=GameState._listeners[e].filter(f=>f!==tickFn&&f!==priceFn);});
            viewer3d?.dispose();
        }
    };
}

import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
const tr = k => window.t?.(k) ?? k;

export function createSmartStorageUnitScreen() {
    let viewer3d=null, tickFn=null, priceFn=null;

    function upd() {
        const s=GameState.ssm, m=GameState.mining, ref=GameState.refinery, $=id=>document.getElementById(id);
        if($('ssm-raw'))  $('ssm-raw').textContent=`${Math.floor(m.rawOres)} / ${m.storageMax}`;
        if($('ssm-ref'))  $('ssm-ref').textContent=`${Math.floor(ref.refinedOres)} / ${ref.storageMax}`;
        if($('ssm-cash')) $('ssm-cash').textContent=GameState.formatCash(GameState.cash);
        if($('ssm-rp'))   $('ssm-rp').textContent=`${s.rawOrePrice.toFixed(1)}$`;
        if($('ssm-pp'))   $('ssm-pp').textContent=`${s.refinedOrePrice.toFixed(1)}$`;
        if($('ssm-rt'))   { $('ssm-rt').textContent=s.rawOrePrice>2?'▲':'▼'; $('ssm-rt').style.color=s.rawOrePrice>2?'#14fdce':'#ff2222'; }
        if($('ssm-pt'))   { $('ssm-pt').textContent=s.refinedOrePrice>8?'▲':'▼'; $('ssm-pt').style.color=s.refinedOrePrice>8?'#14fdce':'#ff2222'; }
        if($('ssm-auto')) { $('ssm-auto').textContent=s.autoSell?'ENABLED':'DISABLED'; $('ssm-auto').style.color=s.autoSell?'#14fdce':'#5ecba8'; }
        const rb=$('ssm-raw-bar'); if(rb){rb.style.width=`${Math.min(100,(m.rawOres/m.storageMax)*100)}%`;rb.style.background=m.rawOres/m.storageMax>=0.9?'#ff2222':m.rawOres/m.storageMax>=0.7?'#ff8800':'#d4e800';}
        const rfb=$('ssm-ref-bar'); if(rfb){rfb.style.width=`${Math.min(100,(ref.refinedOres/ref.storageMax)*100)}%`;rfb.style.background=ref.refinedOres/ref.storageMax>=0.9?'#ff2222':ref.refinedOres/ref.storageMax>=0.7?'#ff8800':'#14fdce';}
        // Highlight active sell target
        ['both','raw','refined','smart'].forEach(t=>{
            const b=$(`ssm-st-${t}`); if(!b) return;
            const active = s.sellTarget===t && (t!=='smart'||s.smartSellUnlocked);
            b.style.background=active?'#14fdce':'transparent'; b.style.color=active?'#020f07':'#14fdce';
            b.style.opacity = t==='smart'&&!s.smartSellUnlocked?'0.3':'1';
            b.disabled = t==='smart'&&!s.smartSellUnlocked;
        });
        // Smart sell status
        const ss=$('ssm-smart-status'); if(ss){ss.textContent=s.smartSellUnlocked?'UNLOCKED — sells highest value ore when price >120% base':'Unlock in Workshop (5,000$)';}
    }

    function sellOres(target) {
        const s=GameState.ssm;
        let earned=0;
        if(target==='both'||target==='raw') { earned+=Math.floor(GameState.mining.rawOres)*s.rawOrePrice; GameState.mining.rawOres=GameState.mining.rawOres%1; }
        if(target==='both'||target==='refined') { earned+=Math.floor(GameState.refinery.refinedOres)*s.refinedOrePrice; GameState.refinery.refinedOres=GameState.refinery.refinedOres%1; }
        if(earned>0) { GameState.cash+=earned; GameState.session.cashEarned+=earned; SE.sell(); }
        const fb=document.getElementById('ssm-fb');
        if(fb){fb.textContent=earned>0?`>> SOLD ${GameState.formatCash(earned)}`:'>> NOTHING TO SELL';fb.style.color=earned>0?'#14fdce':'#3d9970';setTimeout(()=>{if(fb)fb.textContent='';},1500);}
        upd();
    }

    const mBtn=(id,lbl,active,disabled=false)=>
        `<button id="${id}" class="btn btn-sm" style="background:${active?'#14fdce':'transparent'};color:${active?'#020f07':'#14fdce'};opacity:${disabled?'0.3':'1'};" ${disabled?'disabled':''}>${lbl}</button>`;

    return {
        async render() {
            const s=GameState.ssm, m=GameState.mining, ref=GameState.refinery;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>SSM</h1>
                <h2>${tr('ssm_h2')}</h2>
                <div class="panel">
                  <div class="panel-title">${tr('st_treasury')}</div>
                  <div style="font-size:2.4rem;color:#14fdce;" id="ssm-cash">${GameState.formatCash(GameState.cash)}</div>
                </div>
                <div class="panel">
                  <div class="panel-title">${tr('ssm_inventory')}</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.5rem;">
                    <div>
                      <div class="label">RAW ORES</div>
                      <div style="font-size:1.4rem;color:#d4e800;" id="ssm-raw">${Math.floor(m.rawOres)} / ${m.storageMax}</div>
                      <div class="bar-track" style="margin:4px 0;"><div class="bar-fill" id="ssm-raw-bar" style="width:${Math.min(100,(m.rawOres/m.storageMax)*100)}%;background:#d4e800;transition:width 0.3s;"></div></div>
                      <div class="label">@ <span id="ssm-rp">${s.rawOrePrice.toFixed(1)}$</span> <span id="ssm-rt">▼</span></div>
                    </div>
                    <div>
                      <div class="label">REFINED ORES</div>
                      <div style="font-size:1.4rem;color:#14fdce;" id="ssm-ref">${Math.floor(ref.refinedOres)} / ${ref.storageMax}</div>
                      <div class="bar-track" style="margin:4px 0;"><div class="bar-fill" id="ssm-ref-bar" style="width:${Math.min(100,(ref.refinedOres/ref.storageMax)*100)}%;background:#14fdce;transition:width 0.3s;"></div></div>
                      <div class="label">@ <span id="ssm-pp">${s.refinedOrePrice.toFixed(1)}$</span> <span id="ssm-pt">▼</span></div>
                    </div>
                  </div>
                  <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button id="ssm-sell-both" class="btn btn-primary" style="font-size:1rem;letter-spacing:2px;padding:6px 16px;">${tr('ssm_sell_all')}</button>
                    <button id="ssm-sell-raw" class="btn" style="font-size:0.9rem;padding:6px 12px;">${tr('ssm_sell_raw')}</button>
                    <button id="ssm-sell-ref" class="btn" style="font-size:0.9rem;padding:6px 12px;">${tr('ssm_sell_refined')}</button>
                  </div>
                  <span id="ssm-fb" style="display:block;height:1.2rem;font-size:0.9rem;color:#14fdce;margin-top:4px;"></span>
                </div>
                <div class="panel">
                  <div class="panel-title">${tr('ssm_autosell')}</div>
                  <div class="stat-row" style="margin-bottom:0.4rem;"><span class="key">STATUS</span><span class="val" id="ssm-auto" style="color:${s.autoSell?'#14fdce':'#3d9970'}">${s.autoSell?'ENABLED':'DISABLED'}</span></div>
                  <button id="ssm-atog" class="btn btn-sm" style="margin-bottom:0.8rem;">${s.autoSell?'DISABLE':'ENABLE'} AUTO-SELL</button>
                  <div class="label" style="margin-bottom:0.4rem;">${tr('ssm_sell_target')}</div>
                  <div class="btn-group" style="flex-wrap:wrap;gap:4px;">
                    ${mBtn('ssm-st-both','BOTH',s.sellTarget==='both')}
                    ${mBtn('ssm-st-raw','RAW ONLY',s.sellTarget==='raw')}
                    ${mBtn('ssm-st-refined','REFINED ONLY',s.sellTarget==='refined')}
                    ${mBtn('ssm-st-smart','SMART ★',s.sellTarget==='smart'&&s.smartSellUnlocked,!s.smartSellUnlocked)}
                  </div>
                  <div id="ssm-smart-status" class="label" style="margin-top:0.4rem;font-size:0.72rem;">${s.smartSellUnlocked?'UNLOCKED — sells highest value ore when price >120% base':'Unlock Smart Sell in Workshop (5,000$)'}</div>
                </div>
              </div>
              <div class="dept-sidebar">
                ${dept3DPanel('canvas-ssm', tr('ssm_h2'))}
                <div class="panel mini-stats">
                  <div class="panel-title">${tr('ssm_market')}</div>
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
            document.getElementById('ssm-sell-both')?.addEventListener('click',()=>sellOres('both'));
            document.getElementById('ssm-sell-raw')?.addEventListener('click',()=>sellOres('raw'));
            document.getElementById('ssm-sell-ref')?.addEventListener('click',()=>sellOres('refined'));
            document.getElementById('ssm-atog')?.addEventListener('click',()=>{
                GameState.ssm.autoSell=!GameState.ssm.autoSell;
                const b=document.getElementById('ssm-atog'); if(b)b.textContent=(GameState.ssm.autoSell?'DISABLE':'ENABLE')+' AUTO-SELL';
                upd();
            });
            ['both','raw','refined','smart'].forEach(t=>{
                document.getElementById(`ssm-st-${t}`)?.addEventListener('click',()=>{
                    if(t==='smart'&&!GameState.ssm.smartSellUnlocked) return;
                    GameState.ssm.sellTarget=t; upd();
                });
            });
            upd();
            viewer3d=mountDeptModel('canvas-ssm','smartstorageunit',{cz:3.5});
        },

        onExit() {
            ['tick','priceUpdate'].forEach(e=>{if(GameState._listeners[e])GameState._listeners[e]=GameState._listeners[e].filter(f=>f!==tickFn&&f!==priceFn);});
            viewer3d?.dispose();
        }
    };
}

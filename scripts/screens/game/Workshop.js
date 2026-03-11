import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';

export function createWorkshopScreen() {
    let viewer3d=null, tickFn=null;
    const cfg={
        reactor:  {label:'REACTOR CORE',    desc:'Increases power output multiplier',  effect:()=>{GameState.reactor.upgradeLevel++;}},
        mining:   {label:'MINING SHAFT',    desc:'Increases auto-mine yield per tick',  effect:()=>{GameState.mining.autoRate+=0.5;GameState.mining.upgradeLevel++;}},
        refinery: {label:'ORE REFINERY',    desc:'Increases ore refine rate',           effect:()=>{GameState.refinery.refineRate+=0.2;GameState.refinery.upgradeLevel++;}},
        water:    {label:'WATER TREATMENT', desc:'Increases cooling flow rate',          effect:()=>{GameState.water.upgradeLevel++;}},
        ssm:      {label:'SMART STORAGE',   desc:'Improves base ore sell prices',       effect:()=>{GameState.ssm.rawOrePrice+=0.5;GameState.ssm.refinedOrePrice+=1;GameState.ssm.upgradeLevel++;}},
        security: {label:'SECURITY',        desc:'Reduces threat spawn interval',       effect:()=>{GameState.security.threatInterval=Math.max(30,GameState.security.threatInterval-15);GameState.security.level++;}},
    };
    const cost=key=>Math.floor(GameState.workshop.upgrades[key].cost*Math.pow(1.6,GameState.workshop.upgrades[key].level-1));

    function upd() {
        const cashEl=document.getElementById('ws-cash'); if(cashEl)cashEl.textContent=GameState.formatCash(GameState.cash);
        Object.keys(cfg).forEach(key=>{
            const c=cost(key), can=GameState.cash>=c, lv=GameState.workshop.upgrades[key].level;
            const ce=document.getElementById(`ws-cost-${key}`); if(ce)ce.textContent=GameState.formatCash(c);
            const le=document.getElementById(`ws-lv-${key}`);   if(le)le.textContent=`LVL ${lv}`;
            const b=document.getElementById(`ws-btn-${key}`);
            if(b){b.disabled=!can;b.style.opacity=can?'1':'0.35';b.className=`btn btn-sm ${can?'btn-primary':''}`;}
        });
    }

    function buy(key) {
        const c=cost(key); if(GameState.cash<c)return;
        GameState.cash-=c; cfg[key].effect(); GameState.workshop.upgrades[key].level++;
        SE.upgrade();
        const fb=document.getElementById('ws-fb'); if(fb){fb.textContent=`>> ${cfg[key].label} UPGRADED`;setTimeout(()=>{if(fb)fb.textContent='';},2000);}
        upd();
    }

    return {
        async render() {
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>WORKSHOP</h1>
                <h2>SYSTEMS UPGRADE BAY</h2>

                <div class="panel">
                  <div class="panel-title">AVAILABLE FUNDS</div>
                  <div style="font-size:2rem;color:#14fdce;" id="ws-cash">${GameState.formatCash(GameState.cash)}</div>
                  <div id="ws-fb" style="height:1.3rem;font-size:0.9rem;color:#14fdce;margin-top:4px;"></div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                  ${Object.entries(cfg).map(([key,c])=>{
                    const lv=GameState.workshop.upgrades[key].level, co=cost(key), can=GameState.cash>=co;
                    return `
                    <div class="panel" style="margin:0;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px;">
                        <span style="font-size:0.95rem;">${c.label}</span>
                        <span class="label" id="ws-lv-${key}">LVL ${lv}</span>
                      </div>
                      <div class="label" style="margin-bottom:0.5rem;">${c.desc}</div>
                      <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span class="label">COST: <span id="ws-cost-${key}">${GameState.formatCash(co)}</span></span>
                        <button id="ws-btn-${key}" class="btn btn-sm ${can?'btn-primary':''}" style="opacity:${can?'1':'0.35'};" ${can?'':'disabled'}>UPGRADE</button>
                      </div>
                    </div>`;
                  }).join('')}
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-workshop','WORKSHOP')}
                <div class="panel mini-stats">
                  <div class="panel-title">UPGRADE LOG</div>
                  ${Object.entries(cfg).map(([key,c])=>`<p>${c.label.substring(0,10).padEnd(10)}<span>LVL ${GameState.workshop.upgrades[key].level}</span></p>`).join('')}
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn=()=>upd(); GameState.on('tick',tickFn);
            Object.keys(cfg).forEach(key=>document.getElementById(`ws-btn-${key}`)?.addEventListener('click',()=>buy(key)));
            viewer3d=mountDeptModel('canvas-workshop','workshop',{
                cz:3.8,
                animate:(model,_,t)=>{if(model.children[7])model.children[7].rotation.z=t*0.002;}
            });
        },

        onExit() {
            if(tickFn&&GameState._listeners['tick'])GameState._listeners['tick']=GameState._listeners['tick'].filter(f=>f!==tickFn);
            viewer3d?.dispose();
        }
    };
}

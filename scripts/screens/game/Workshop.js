import { SE } from '../../core/SoundEngine.js';
import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
const t = k => window.t?.(k) ?? k;

export function createWorkshopScreen() {
    let viewer3d=null, tickFn=null;

    const cfg = {
        reactor:  { label:'REACTOR CORE',    desc:'Power output +2.4 GW per level', pwrGain:2.4, pwrCost:0.2,
            effect(){ GameState.reactor.upgradeLevel++; GameState.addLog(`Reactor LVL ${GameState.reactor.upgradeLevel} — heat load increased`,'ok'); }},
        mining:   { label:'MINING SHAFT',    desc:'Auto-mine yield +0.5/tick',      pwrGain:0,   pwrCost:0.4,
            effect(){ GameState.mining.autoRate+=0.5; GameState.mining.upgradeLevel++; GameState.addLog(`Mining upgraded — yield +0.5/tick`,'ok'); }},
        refinery: { label:'ORE REFINERY',    desc:'Refine rate +0.2/tick',          pwrGain:0,   pwrCost:0.3,
            effect(){ GameState.refinery.refineRate+=0.2; GameState.refinery.upgradeLevel++; GameState.addLog(`Refinery upgraded — rate +0.2`,'ok'); }},
        water:    { label:'WATER TREATMENT', desc:'Cooling capacity +8 units',      pwrGain:0,   pwrCost:0.3,
            effect(){ GameState.water.upgradeLevel++; GameState.addLog(`Water pump upgraded — cooling +8`,'ok'); }},
        ssm:      { label:'SMART STORAGE',   desc:'Storage +30 raw / +20 refined',  pwrGain:0,   pwrCost:0,
            effect(){ GameState.ssm.rawOrePrice+=0.5; GameState.ssm.refinedOrePrice+=1; GameState.ssm.upgradeLevel++;
                GameState.mining.storageMax+=30; GameState.refinery.storageMax+=20;
                GameState.addLog(`SSM upgraded — storage expanded`,'ok'); }},
        security: { label:'SECURITY',        desc:'Threat interval -15s',           pwrGain:0,   pwrCost:0,
            effect(){ GameState.security.threatInterval=Math.max(30,GameState.security.threatInterval-15);
                GameState.security.level++; GameState.security.perimeter.motionInterval=Math.min(300,GameState.security.perimeter.motionInterval+20);
                GameState.addLog(`Security upgraded — threat interval reduced`,'ok'); }},
        smartsell:{ label:'SMART SELL MODULE', desc:'Auto-sell based on market rate vs production',pwrGain:0,pwrCost:0,
            effect(){ GameState.ssm.smartSellUnlocked=true; GameState.addLog(`Smart Sell unlocked — market-aware auto-sell`,'ok'); }},
    };

    const cost = key => {
        if (key === 'smartsell') return 5000;
        return Math.floor(GameState.workshop.upgrades[key].cost * Math.pow(1.6, GameState.workshop.upgrades[key].level - 1));
    };

    const pwrCheck = key => {
        const c = cfg[key];
        if (!c.pwrCost) return { ok: true };
        const headroom = GameState.powerHeadroom - c.pwrCost + c.pwrGain;
        return { ok: headroom >= 0 };
    };

    function upd() {
        const cashEl = document.getElementById('ws-cash');
        if (cashEl) cashEl.textContent = GameState.formatCash(GameState.cash);
        const pwEl = document.getElementById('ws-power');
        if (pwEl) {
            const h = GameState.powerHeadroom;
            pwEl.textContent = `OUTPUT ${GameState.powerOutput.toFixed(1)} GW  |  DRAW ${GameState.powerDraw.toFixed(1)} GW  |  FREE ${h>=0?'+':''}${h.toFixed(1)} GW`;
            pwEl.style.color = h < 0 ? '#ff2222' : h < 0.5 ? '#ff8800' : '#14fdce';
        }
        Object.keys(cfg).forEach(key => {
            const c = cost(key), pwr = pwrCheck(key);
            const isSmartSell = key === 'smartsell';
            const alreadyOwned = isSmartSell && GameState.ssm.smartSellUnlocked;
            const can = GameState.cash >= c && pwr.ok && !alreadyOwned;
            const lv = isSmartSell ? (alreadyOwned ? 'OWNED' : 'LOCKED') : `LVL ${GameState.workshop.upgrades[key]?.level||1}`;

            const ce = document.getElementById(`ws-cost-${key}`); if(ce) ce.textContent = alreadyOwned ? '--' : GameState.formatCash(c);
            const le = document.getElementById(`ws-lv-${key}`);   if(le) le.textContent = lv;
            const pe = document.getElementById(`ws-pwr-${key}`);
            if (pe) {
                if (cfg[key].pwrCost > 0)       { pe.textContent = `+${cfg[key].pwrCost} GW draw`; pe.style.color = pwr.ok ? '#3d9970' : '#ff2222'; }
                else if (cfg[key].pwrGain > 0)  { pe.textContent = `+${cfg[key].pwrGain} GW out`;  pe.style.color = '#14fdce'; }
                else pe.textContent = '';
            }
            const b = document.getElementById(`ws-btn-${key}`);
            if (b) { b.disabled = !can; b.style.opacity = can ? '1' : '0.35'; b.className = `btn btn-sm ${can ? 'btn-primary' : ''}`; }
            const de = document.getElementById(`ws-dn-${key}`);
            if (de) { const lvl=(GameState.workshop.upgrades[key]?.level||1); de.disabled=lvl<=1; de.style.opacity=lvl>1?'0.7':'0.2'; }
        });
    }

    function buy(key) {
        const c = cost(key); const pwr = pwrCheck(key);
        if (GameState.cash < c) return;
        if (!pwr.ok) {
            const fb = document.getElementById('ws-fb');
            if (fb) { fb.textContent = '>> INSUFFICIENT POWER — upgrade Reactor first'; fb.style.color = '#ff2222'; setTimeout(() => { if(fb) fb.textContent = ''; }, 3000); }
            return;
        }
        GameState.cash -= c;
        cfg[key].effect();
        if (GameState.workshop.upgrades[key]) GameState.workshop.upgrades[key].level++;
        SE.upgrade();
        const fb = document.getElementById('ws-fb');
        if (fb) { fb.textContent = `>> ${cfg[key].label} UPGRADED`; fb.style.color = '#14fdce'; setTimeout(() => { if(fb) fb.textContent = ''; }, 2000); }
        upd();
    }

    function downgrade(key) {
        const upgrades = GameState.workshop.upgrades[key];
        if (!upgrades || upgrades.level <= 1) return;
        const refund = Math.floor(cost(key) * 0.5);

        // Simulate power after downgrade to check impact
        const powerLoss = key === 'reactor' ? 2.4 : 0;
        const drawSaved = key === 'mining' ? 0.4 : key === 'refinery' ? 0.3 : key === 'water' ? 0.3 : 0;
        const newHeadroom = GameState.powerHeadroom - powerLoss + drawSaved;

        if (newHeadroom < 0) {
            // Predict which systems would cascade offline
            let simHeadroom = newHeadroom;
            const willGoOffline = [];
            for (const sys of ['refinery','mining','water']) {
                if (simHeadroom >= 0) break;
                if (sys === 'refinery' && GameState.refinery.online)  { simHeadroom += GameState.refinery.powerDrawGW; willGoOffline.push('ORE REFINERY'); }
                else if (sys === 'mining' && GameState.mining.online)  { simHeadroom += GameState.mining.powerDrawGW;   willGoOffline.push('MINING SHAFT'); }
                else if (sys === 'water' && GameState.water.pumpOnline){ simHeadroom += GameState.water.powerDrawGW;    willGoOffline.push('WATER PLANT'); }
            }

            // Show confirmation modal
            const existing = document.getElementById('downgrade-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'downgrade-modal';
            modal.style.cssText = `
                position:fixed;top:0;left:0;right:0;bottom:0;
                background:rgba(0,0,0,0.75);z-index:9999;
                display:flex;align-items:center;justify-content:center;
                font-family:'VT323',monospace;
            `;
            modal.innerHTML = `
                <div style="border:1px solid #ff8800;background:#020e06;padding:1.5rem;max-width:420px;width:90%;box-shadow:0 0 30px rgba(255,136,0,0.2);">
                    <div style="color:#ff8800;font-size:1.1rem;letter-spacing:3px;margin-bottom:0.8rem;">⚠ POWER DEFICIT WARNING</div>
                    <div style="color:#5ecba8;font-size:0.82rem;margin-bottom:0.6rem;">
                        Downgrading <span style="color:#14fdce;">${cfg[key].label}</span> will cause a
                        <span style="color:#ff2222;">${Math.abs(newHeadroom).toFixed(1)} GW deficit</span>.
                    </div>
                    ${willGoOffline.length ? `
                    <div style="border:1px solid #ff220030;background:#1a000010;padding:0.5rem 0.7rem;margin-bottom:0.8rem;">
                        <div style="font-size:0.7rem;color:#ff2222;letter-spacing:2px;margin-bottom:4px;">SYSTEMS FORCED OFFLINE:</div>
                        ${willGoOffline.map(s=>`<div style="color:#ff4444;font-size:0.78rem;">▸ ${s}</div>`).join('')}
                    </div>` : ''}
                    <div style="color:#3d9970;font-size:0.72rem;margin-bottom:1rem;">
                        Refund: <span style="color:#14fdce;">+${refund}$</span>
                    </div>
                    <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
                        <button id="dg-cancel" style="padding:4px 16px;font-family:'VT323',monospace;font-size:0.85rem;letter-spacing:2px;border:1px solid #0d3a20;background:transparent;color:#3d9970;cursor:pointer;">CANCEL</button>
                        <button id="dg-confirm" style="padding:4px 16px;font-family:'VT323',monospace;font-size:0.85rem;letter-spacing:2px;border:1px solid #ff8800;background:rgba(255,136,0,0.1);color:#ff8800;cursor:pointer;">CONFIRM DOWNGRADE</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);

            document.getElementById('dg-cancel').onclick = () => modal.remove();
            document.getElementById('dg-confirm').onclick = () => {
                modal.remove();
                applyDowngrade(key, refund, willGoOffline);
            };
            return;
        }

        applyDowngrade(key, refund, []);
    }

    function applyDowngrade(key, refund, cascaded) {
        if (key === 'reactor')  { GameState.reactor.upgradeLevel   = Math.max(1, GameState.reactor.upgradeLevel - 1); }
        if (key === 'mining')   { GameState.mining.autoRate        = Math.max(0, GameState.mining.autoRate - 0.5); GameState.mining.upgradeLevel = Math.max(1, GameState.mining.upgradeLevel - 1); }
        if (key === 'refinery') { GameState.refinery.refineRate    = Math.max(0.2, GameState.refinery.refineRate - 0.2); GameState.refinery.upgradeLevel = Math.max(1, GameState.refinery.upgradeLevel - 1); }
        if (key === 'water')    { GameState.water.upgradeLevel     = Math.max(1, GameState.water.upgradeLevel - 1); }
        if (key === 'ssm')      { GameState.ssm.upgradeLevel       = Math.max(1, GameState.ssm.upgradeLevel - 1); GameState.mining.storageMax = Math.max(50, GameState.mining.storageMax - 30); GameState.refinery.storageMax = Math.max(20, GameState.refinery.storageMax - 20); }
        if (key === 'security') { GameState.security.threatInterval = Math.min(180, GameState.security.threatInterval + 15); }
        GameState.workshop.upgrades[key].level--;
        GameState.cash += refund;

        // Apply cascade offline
        for (const sys of cascaded) {
            if (sys === 'ORE REFINERY') GameState.refinery.online = false;
            if (sys === 'MINING SHAFT') GameState.mining.online = false;
            if (sys === 'WATER PLANT')  GameState.water.pumpOnline = false;
        }

        if (cascaded.length > 0) {
            GameState.addLog(`POWER DEFICIT — ${cascaded.join(', ')} forced offline`, 'crit');
        }
        GameState.addLog(`${cfg[key].label} downgraded — +${refund}$ refunded`, 'warn');

        const fb = document.getElementById('ws-fb');
        if (fb) {
            fb.textContent = cascaded.length
                ? `>> DEFICIT: ${cascaded.join(', ')} offline`
                : `>> DOWNGRADE: +${refund}$ refunded`;
            fb.style.color = cascaded.length ? '#ff2222' : '#ff8800';
            setTimeout(() => { if(fb) fb.textContent = ''; }, 3000);
        }
        SE.click?.();
        upd();
    }

    return {
        async render() {
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>${t('nav_workshop')}</h1>
                <h2>${t('ws_h2')}</h2>
                <div class="panel">
                  <div class="panel-title">${t('ws_funds')}</div>
                  <div style="font-size:2rem;color:#14fdce;" id="ws-cash">${GameState.formatCash(GameState.cash)}</div>
                  <div id="ws-power" style="font-size:0.75rem;letter-spacing:1px;margin-top:4px;"></div>
                  <div id="ws-fb" style="height:1.3rem;font-size:0.9rem;color:#14fdce;margin-top:4px;"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                  ${Object.entries(cfg).map(([key,c]) => {
                    const isSmartSell = key === 'smartsell';
                    const alreadyOwned = isSmartSell && GameState.ssm.smartSellUnlocked;
                    const lv = isSmartSell ? (alreadyOwned ? 'OWNED' : 'LOCKED') : `LVL ${GameState.workshop.upgrades[key]?.level||1}`;
                    const co = isSmartSell ? 5000 : cost(key);
                    const pwr = pwrCheck(key);
                    const can = GameState.cash >= co && pwr.ok && !alreadyOwned;
                    return `
                    <div class="panel" style="margin:0;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px;">
                        <span style="font-size:0.85rem;">${c.label}</span>
                        <span class="label" id="ws-lv-${key}" style="font-size:0.7rem;">${lv}</span>
                      </div>
                      <div class="label" style="margin-bottom:3px;font-size:0.7rem;">${c.desc}</div>
                      <div id="ws-pwr-${key}" class="label" style="font-size:0.65rem;margin-bottom:0.4rem;"></div>
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
                        <span class="label" style="font-size:0.72rem;">COST: <span id="ws-cost-${key}">${alreadyOwned?'--':GameState.formatCash(co)}</span></span>
                        <span style="display:flex;gap:4px;">
                          ${!isSmartSell ? `<button id="ws-dn-${key}" class="btn btn-sm" style="opacity:${(GameState.workshop.upgrades[key]?.level||1)>1?'0.7':'0.2'};border-color:#ff8800;color:#ff8800;font-size:0.6rem;padding:1px 5px;" ${(GameState.workshop.upgrades[key]?.level||1)<=1?'disabled':''}>▼</button>` : ''}
                          <button id="ws-btn-${key}" class="btn btn-sm ${can?'btn-primary':''}" style="opacity:${can?'1':'0.35'};" ${can?'':'disabled'}>${t('ws_upgrade')}</button>
                        </span>
                      </div>
                    </div>`;
                  }).join('')}
                </div>
              </div>
              <div class="dept-sidebar">
                ${dept3DPanel('canvas-workshop', t('nav_workshop'))}
                <div class="panel mini-stats">
                  <div class="panel-title">${t('ws_power_budget')}</div>
                  <p>REACTOR<span id="ws-s-reactor">${GameState.reactor.powerGW.toFixed(1)} GW</span></p>
                  <p>WATER<span>-${GameState.water.powerDrawGW.toFixed(1)} GW</span></p>
                  <p>MINING<span>-${GameState.mining.powerDrawGW.toFixed(1)} GW</span></p>
                  <p>REFINERY<span>-${GameState.refinery.powerDrawGW.toFixed(1)} GW</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn = () => upd(); GameState.on('tick', tickFn);
            Object.keys(cfg).forEach(key => {
                document.getElementById(`ws-btn-${key}`)?.addEventListener('click', () => buy(key));
                document.getElementById(`ws-dn-${key}`)?.addEventListener('click', () => downgrade(key));
            });
            upd();
            viewer3d = mountDeptModel('canvas-workshop','workshop',{ cz:3.8, animate:(model,_,t)=>{ if(model.children[7]) model.children[7].rotation.z=t*0.002; }});
        },

        onExit() {
            if(tickFn&&GameState._listeners['tick']) GameState._listeners['tick']=GameState._listeners['tick'].filter(f=>f!==tickFn);
            viewer3d?.dispose();
        }
    };
}

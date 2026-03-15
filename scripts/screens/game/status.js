import { GameState } from '../../core/GameState.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { mountVaultMap } from '../../core/VisualEngine.js';
import { ACHIEVEMENTS } from '../../core/AchievementSystem.js';

export function createStatusScreen() {
    let viewer3d = null, vaultMap = null, tickFn = null;

    const dot = (on, warn=false) => `<span class="dot ${on?(warn?'dot-warn':'dot-ok'):'dot-off'}"></span>`;

    function renderSession() {
        const el = document.getElementById('st-session'); if (!el) return;
        const s = GameState.session;
        const elapsed = Math.floor((Date.now() - s.startTime) / 1000);
        const mins = Math.floor(elapsed / 60), secs = elapsed % 60;
        const diff = GameState.difficulty || 'STANDARD';
        const diffColors = { EASY:'#14fdce', STANDARD:'#d4e800', HARD:'#ff8800', NIGHTMARE:'#ff2222' };
        el.innerHTML = `
            <p>TIME<span>${mins}m ${secs}s</span></p>
            <p>DIFFICULTY<span style="color:${diffColors[diff]||'#14fdce'}">${diff}</span></p>
            <p>ORE MINED<span>${Math.floor(s.oreMined)}</span></p>
            <p>CASH EARNED<span>${GameState.formatCash(s.cashEarned)}</span></p>
            <p>THREATS RESOLVED<span>${s.threatsResolved}</span></p>
            <p>REPAIRS<span>${s.repairsPerformed}</span></p>`;
    }

    function renderAchievements() {
        const el = document.getElementById('st-achievements'); if (!el) return;
        const count = document.getElementById('st-ach-count');
        const earned = GameState.achievements || [];
        if (count) count.textContent = `${earned.length}/${ACHIEVEMENTS.length}`;
        el.innerHTML = ACHIEVEMENTS.map(a => {
            const done = earned.includes(a.id);
            return `<div style="
                border:1px solid ${done ? '#0d3a20' : '#071a0f'};
                background:${done ? 'rgba(20,253,206,0.04)' : 'rgba(0,0,0,0.15)'};
                padding:0.3rem 0.4rem;
                opacity:${done ? '1' : '0.35'};
            ">
                <div style="display:flex;align-items:center;gap:5px;">
                  <span style="font-size:0.85rem;">${a.icon}</span>
                  <span style="color:${done?'#14fdce':'#3d9970'};font-size:0.68rem;letter-spacing:1px;line-height:1.2;">${a.label}</span>
                </div>
                <div class="label" style="font-size:0.6rem;line-height:1.2;margin-top:2px;">${a.desc}</div>
            </div>`;
        }).join('');
    }

    function upd() {
        const r=GameState.reactor,m=GameState.mining,ref=GameState.refinery,w=GameState.water,sec=GameState.security,$=id=>document.getElementById(id);
        const ca=$('st-cash'); if(ca)ca.textContent=GameState.formatCash(GameState.cash);
        const pb=$('st-pbar'); if(pb){pb.style.width=`${r.efficiency*100}%`;pb.style.background=r.efficiency>0.6?'#14fdce':r.efficiency>0.3?'#ff8800':'#ff2222';}
        const pw=$('st-pw');   if(pw)pw.textContent=`${(r.powerGW*r.efficiency).toFixed(2)} GW`;
        const rstat=$('st-rs');if(rstat){rstat.innerHTML=`${dot(r.online,r.temperature>800)} ${r.status}`;rstat.style.color=r.efficiency>0.5?'#14fdce':'#ff8800';}
        const rtemp=$('st-rt');if(rtemp){rtemp.textContent=`${r.temperature}C`;rtemp.style.color=r.temperature>1000?'#ff2222':r.temperature>800?'#ff8800':'#3d9970';}
        const mst=$('st-ms');if(mst){const on=m.online&&r.efficiency>0;mst.innerHTML=`${dot(on)} ${on?'ACTIVE':'OFFLINE'}`;}
        const mr=$('st-mr'); if(mr)mr.textContent=`${m.ratePerTick.toFixed(2)}/s`;
        const mw=$('st-mw'); if(mw)mw.textContent=Math.floor(m.rawOres);
        const rfst=$('st-rfs');if(rfst){const on=ref.online&&ref.efficiency>0;rfst.innerHTML=`${dot(on)} ${on?'OPERATIONAL':'OFFLINE'}`;}
        const rfr=$('st-rfr'); if(rfr)rfr.textContent=Math.floor(ref.refinedOres);
        const wst=$('st-ws'); if(wst){wst.innerHTML=`${dot(w.pumpOnline)} ${w.pumpOnline?'ONLINE':'OFFLINE'}`;}
        const sc=$('st-sc');  if(sc){sc.textContent=sec.threats.length;sc.style.color=sec.threats.length>0?'#ff2222':'#14fdce';}
        const alerts=[];
        if(r.temperature>1000) alerts.push({msg:`REACTOR TEMP ${r.temperature}C -- CRITICAL`,c:'#ff2222'});
        if(!w.pumpOnline)      alerts.push({msg:'WATER PUMP OFFLINE',c:'#ff2222'});
        if(sec.threats.length) alerts.push({msg:`${sec.threats.length} SECURITY THREAT(S) ACTIVE`,c:'#ff8800'});
        if(!r.online)          alerts.push({msg:'REACTOR OFFLINE -- ALL SYSTEMS DEGRADED',c:'#ff2222'});
        const ae=$('st-alerts');
        if(ae) ae.innerHTML=alerts.length
            ? alerts.map(a=>`<div style="color:${a.c};margin-bottom:3px;">>> ${a.msg}</div>`).join('')
            : `<div class="label">-- ALL SYSTEMS NOMINAL --</div>`;
        renderSession();
        renderAchievements();
    }

    return {
        async render() {
            const r=GameState.reactor,m=GameState.mining,ref=GameState.refinery,w=GameState.water,sec=GameState.security;
            const d2=(on,warn=false)=>`<span class="dot ${on?(warn?'dot-warn':'dot-ok'):'dot-off'}"></span>`;
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>STATUS</h1>
                <h2>VAULT 84 OPERATIONS OVERVIEW</h2>
                <div class="panel">
                  <div class="panel-title">TREASURY</div>
                  <div style="font-size:2.2rem;color:#14fdce;" id="st-cash">${GameState.formatCash(GameState.cash)}</div>
                </div>
                <div class="panel">
                  <div class="panel-title">POWER GRID</div>
                  <div class="bar-track"><div class="bar-fill" id="st-pbar" style="width:${r.efficiency*100}%;"></div></div>
                  <div class="stat-row"><span class="key">OUTPUT</span><span class="val" id="st-pw">${(r.powerGW*r.efficiency).toFixed(2)} GW</span></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.6rem;">
                  <div class="panel" style="margin:0;"><div class="panel-title">REACTOR</div><div id="st-rs">${d2(r.online)} ${r.status}</div><div class="label">TEMP: <span id="st-rt">${r.temperature}C</span></div></div>
                  <div class="panel" style="margin:0;"><div class="panel-title">MINING</div><div id="st-ms">${d2(m.online&&r.efficiency>0)} ${m.online&&r.efficiency>0?'ACTIVE':'OFFLINE'}</div><div class="label"><span id="st-mr">${m.ratePerTick.toFixed(2)}/s</span> | RAW: <span id="st-mw">${Math.floor(m.rawOres)}</span></div></div>
                  <div class="panel" style="margin:0;"><div class="panel-title">REFINERY</div><div id="st-rfs">${d2(ref.online&&ref.efficiency>0)} ${ref.online&&ref.efficiency>0?'OPERATIONAL':'OFFLINE'}</div><div class="label">REFINED: <span id="st-rfr">${Math.floor(ref.refinedOres)}</span></div></div>
                  <div class="panel" style="margin:0;"><div class="panel-title">WATER</div><div id="st-ws">${d2(w.pumpOnline)} ${w.pumpOnline?'ONLINE':'OFFLINE'}</div></div>
                  <div class="panel" style="margin:0;"><div class="panel-title">SECURITY</div><div>THREATS: <span id="st-sc" style="color:${sec.threats.length?'#ff2222':'#14fdce'}">${sec.threats.length}</span></div></div>
                  <div class="panel" style="margin:0;"><div class="panel-title">SSM</div><div>AUTO-SELL: <span style="color:${GameState.ssm.autoSell?'#14fdce':'#3d9970'}">${GameState.ssm.autoSell?'ON':'OFF'}</span></div></div>
                </div>

                <div class="panel">
                  <div class="panel-title">// ACHIEVEMENTS <span id="st-ach-count" class="label" style="float:right;font-size:0.7rem;"></span></div>
                  <div id="st-achievements" style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-top:0.4rem;"></div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-status','VAULT 84')}
                <div class="panel" style="padding:0;overflow:hidden;">
                  <div class="panel-title" style="padding:4px 8px;">// FACILITY MAP</div>
                  <canvas id="canvas-vault-map" style="display:block;width:100%;"></canvas>
                </div>
                <div class="panel">
                  <div class="panel-title">ALERTS</div>
                  <div id="st-alerts"><div class="label">-- ALL SYSTEMS NOMINAL --</div></div>
                </div>
                <div class="panel mini-stats">
                  <div class="panel-title">SESSION STATS</div>
                  <div id="st-session"></div>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn = () => upd();
            GameState.on('tick', tickFn);
            viewer3d = mountDeptModel('canvas-status', 'status', {
                cz: 2.8,
                animate: (model, _, t) => { model.rotation.y = t * 0.0004; }
            });
            vaultMap = mountVaultMap('canvas-vault-map');
            renderSession();
            renderAchievements();
        },

        onExit() {
            if (tickFn && GameState._listeners['tick']) GameState._listeners['tick'] = GameState._listeners['tick'].filter(f => f !== tickFn);
            viewer3d?.dispose();
            vaultMap?.destroy();
        }
    };
}

import { GameState } from '../../core/GameState.js';
import { resolveThreat, repairSystem } from '../../core/GameLoop.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { SE } from '../../core/SoundEngine.js';

export function createSecurityScreen() {
    let viewer3d=null, tickFn=null, threatFn=null, perimFn=null;
    let activeMG=null, mgInt=null;

    // ── Render active threats list ─────────────────────────────
    function renderThreats() {
        const c = document.getElementById('sec-threats'); if(!c) return;
        const threats = GameState.security.threats;
        if (!threats.length) {
            c.innerHTML = `<div class="label" style="padding:0.5rem 0;color:#5ecba8;">-- NO ACTIVE THREATS --</div>`;
            return;
        }
        c.innerHTML = threats.map(t => `
            <div class="threat-row" data-id="${t.id}" style="border-left:3px solid ${t.color};padding:0.4rem 0.6rem;margin-bottom:0.4rem;background:rgba(0,0,0,0.2);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>
                  <span style="color:${t.color};font-weight:bold;">[${t.type}]</span>
                  <span style="margin-left:6px;">${t.target.toUpperCase()}</span>
                  <span class="label" style="margin-left:6px;">SEV ${t.severity}</span>
                </span>
                <span style="display:flex;gap:0.4rem;align-items:center;">
                  <span style="color:${t.timeLeft < 10 ? '#ff2222' : '#ff8800'};font-size:0.85rem;">${t.timeLeft}s</span>
                  <button class="btn btn-sm sec-engage" data-id="${t.id}" style="border-color:${t.color};color:${t.color};">ENGAGE</button>
                </span>
              </div>
              <div class="label" style="font-size:0.75rem;margin-top:2px;color:#5ecba8;">${t.desc}</div>
              <div class="bar-track" style="margin-top:4px;height:3px;">
                <div class="bar-fill" style="width:${Math.round(t.clicks/t.clicksReq*100)}%;background:${t.color};height:3px;"></div>
              </div>
            </div>`).join('');
        c.querySelectorAll('.sec-engage').forEach(b =>
            b.addEventListener('click', () => startMG(parseInt(b.dataset.id)))
        );
    }

    // ── Minigame ───────────────────────────────────────────────
    function startMG(tid) {
        const t = GameState.security.threats.find(x => x.id === tid); if (!t) return;
        if (activeMG?.tid === tid) return;
        if (mgInt) clearInterval(mgInt);
        activeMG = { tid, t };
        renderMG();
        mgInt = setInterval(() => {
            if (!activeMG) { clearInterval(mgInt); return; }
            const threat = GameState.security.threats.find(x => x.id === activeMG.tid);
            if (!threat) { activeMG = null; clearInterval(mgInt); renderMG(); return; }
            const tEl = document.getElementById('mg-timer');
            if (tEl) { tEl.textContent = `${threat.timeLeft}s`; tEl.style.color = threat.timeLeft < 8 ? '#ff2222' : '#ff8800'; }
            const pEl = document.getElementById('mg-progress');
            if (pEl) pEl.style.width = `${Math.round(threat.clicks/threat.clicksReq*100)}%`;
            const cEl = document.getElementById('mg-cnt');
            if (cEl) cEl.textContent = `${threat.clicks} / ${threat.clicksReq}`;
            if (!GameState.security.threats.find(x => x.id === activeMG.tid)) {
                clearInterval(mgInt); activeMG = null; renderMG();
            }
        }, 200);
    }

    function getActionLabel(type) {
        return { VIRUS: 'PURGE VIRUS', BREACH: 'TRACE & LOCK', MALWARE: 'FORCE REMOVE' }[type] || 'ENGAGE';
    }

    function renderMG() {
        const mg = document.getElementById('sec-mg'); if (!mg) return;
        if (!activeMG) {
            mg.innerHTML = `<div class="label" style="text-align:center;padding:0.75rem;">Select a threat to engage</div>`;
            return;
        }
        const t = GameState.security.threats.find(x => x.id === activeMG.tid);
        if (!t) { mg.innerHTML = `<div class="label" style="text-align:center;padding:0.75rem;">Select a threat to engage</div>`; return; }
        const pct = Math.round(t.clicks / t.clicksReq * 100);
        mg.innerHTML = `
          <div class="panel" style="border-color:${t.color};margin:0;background:rgba(0,0,0,0.3);">
            <div class="panel-title" style="color:${t.color};">${t.type} — ${t.target.toUpperCase()}</div>
            <div class="label" style="margin-bottom:0.5rem;font-size:0.8rem;">${t.desc}</div>
            <div class="stat-row">
              <span class="key">TIME LEFT</span>
              <span class="val" id="mg-timer" style="color:#ff8800;">${t.timeLeft}s</span>
            </div>
            <div class="stat-row">
              <span class="key">PROGRESS</span>
              <span class="val" id="mg-cnt">${t.clicks} / ${t.clicksReq}</span>
            </div>
            <div class="bar-track" style="margin:0.4rem 0;">
              <div class="bar-fill" id="mg-progress" style="width:${pct}%;background:${t.color};transition:width 0.1s;"></div>
            </div>
            <button id="mg-btn" class="btn btn-primary" style="width:100%;font-size:1.2rem;letter-spacing:2px;padding:10px;border-color:${t.color};color:${t.color};margin-top:0.3rem;">
              ${getActionLabel(t.type)}
            </button>
          </div>`;
        document.getElementById('mg-btn')?.addEventListener('click', () => {
            if (!activeMG) return;
            const threat = GameState.security.threats.find(x => x.id === activeMG.tid);
            if (!threat) return;
            threat.clicks++;
            SE.click();
            if (threat.clicks >= threat.clicksReq) {
                clearInterval(mgInt);
                resolveThreat(activeMG.tid);
                SE.resolve();
                activeMG = null;
                const mg2 = document.getElementById('sec-mg');
                if (mg2) mg2.innerHTML = `<div class="label" style="color:#14fdce;text-align:center;padding:0.75rem;">✓ THREAT NEUTRALIZED</div>`;
                setTimeout(() => { renderThreats(); renderMG(); }, 1500);
            }
        });
    }

    // ── Perimeter sensor display ───────────────────────────────
    function renderPerimeter() {
        const el = document.getElementById('sec-perimeter'); if (!el) return;
        const p  = GameState.security.perimeter;
        const activeAlerts = p.alerts.filter(a => !a.resolved).slice(0, 5);

        el.innerHTML = `
          <div class="panel-title">PERIMETER SENSORS</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:0.6rem;">
            ${p.zones.map(z => {
                const hasAlert = activeAlerts.find(a => a.zone === z);
                return `<div class="sensor-zone ${hasAlert ? 'sensor-alert' : ''}" data-zone="${z}">
                  <div class="sensor-dot"></div>
                  <div style="font-size:0.65rem;letter-spacing:1px;">${z}</div>
                </div>`;
            }).join('')}
          </div>
          ${activeAlerts.length ? `
            <div class="label" style="color:#ff8800;margin-bottom:0.3rem;">!! MOTION DETECTED</div>
            ${activeAlerts.map(a => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid #1a4a2e;">
                <span style="color:#ff8800;font-size:0.85rem;">SECTOR ${a.zone}</span>
                <span class="label" style="font-size:0.7rem;">${a.ts}</span>
                <button class="btn btn-sm sec-clear-zone" data-zone="${a.zone}" style="font-size:0.7rem;padding:2px 6px;">CLEAR</button>
              </div>`).join('')}
          ` : `<div class="label" style="color:#5ecba8;font-size:0.8rem;">All sectors nominal</div>`}`;

        el.querySelectorAll('.sec-clear-zone').forEach(b =>
            b.addEventListener('click', () => {
                const z = b.dataset.zone;
                const alert = p.alerts.find(a => a.zone === z && !a.resolved);
                if (alert) { alert.resolved = true; SE.resolve(); renderPerimeter(); }
            })
        );
    }

    // ── Repair panel ───────────────────────────────────────────
    function renderRepair() {
        const el = document.getElementById('sec-repair'); if (!el) return;
        const systems = [
            { id: 'reactor',  label: 'REACTOR',  wear: GameState.reactor.wear,  cost: 80 },
            { id: 'mining',   label: 'MINING',   wear: GameState.mining.wear,   cost: 40 },
            { id: 'refinery', label: 'REFINERY', wear: GameState.refinery.wear, cost: 55 },
            { id: 'water',    label: 'WATER',    wear: GameState.water.wear,    cost: 45 },
        ];
        el.innerHTML = systems.map(s => {
            const wCol = s.wear >= 70 ? '#ff2222' : s.wear >= 40 ? '#ff8800' : '#5ecba8';
            const canAfford = GameState.cash >= s.cost;
            return `
              <div class="stat-row" style="align-items:center;">
                <span class="key" style="min-width:80px;">${s.label}</span>
                <div style="flex:1;margin:0 0.5rem;">
                  <div class="bar-track" style="height:5px;">
                    <div class="bar-fill" style="width:${s.wear}%;background:${wCol};height:5px;transition:width 0.3s;"></div>
                  </div>
                </div>
                <span style="color:${wCol};min-width:36px;font-size:0.85rem;">${Math.round(s.wear)}%</span>
                <button class="btn btn-sm sec-repair" data-sys="${s.id}" style="margin-left:6px;${!canAfford?'opacity:0.4;':''}" ${!canAfford?'disabled':''}>
                  REPAIR ${s.cost}$
                </button>
              </div>`;
        }).join('');
        el.querySelectorAll('.sec-repair').forEach(b =>
            b.addEventListener('click', () => {
                if (repairSystem(b.dataset.sys)) renderRepair();
            })
        );
    }

    function upd() {
        const nc = document.getElementById('sec-cnt');
        if (nc) { nc.textContent = GameState.security.threats.length; nc.style.color = GameState.security.threats.length > 0 ? '#ff2222' : '#14fdce'; }
        const nt = document.getElementById('sec-next');
        if (nt) nt.textContent = `${GameState.security.threatInterval - GameState.security.nextThreatTimer}s`;
        renderThreats();
        renderRepair();
    }

    return {
        async render() {
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>SECURITY</h1>
                <h2>VAULT DEFENSE SYSTEM</h2>

                <div class="panel">
                  <div class="panel-title">THREAT OVERVIEW</div>
                  <div class="stat-row">
                    <span class="key">ACTIVE THREATS</span>
                    <span class="val" id="sec-cnt" style="color:${GameState.security.threats.length > 0 ? '#ff2222' : '#14fdce'}">${GameState.security.threats.length}</span>
                  </div>
                  <div class="stat-row"><span class="key">NEXT SCAN IN</span><span class="val label" id="sec-next">--</span></div>
                </div>

                <div class="panel" id="sec-perimeter"></div>

                <div class="panel">
                  <div class="panel-title">ACTIVE THREATS</div>
                  <div id="sec-threats"><div class="label" style="padding:0.4rem 0;">-- NO ACTIVE THREATS --</div></div>
                </div>

                <div id="sec-mg" style="margin-top:0.6rem;">
                  <div class="label" style="text-align:center;padding:0.75rem;">Select a threat to engage</div>
                </div>

                <hr class="sep">
                <div class="label" style="line-height:2;font-size:0.8rem;">
                  <div><span style="color:#ff2222;">[VIRUS]</span> gradual drain — click to purge</div>
                  <div><span style="color:#ff8800;">[BREACH]</span> caps drain — trace & lock</div>
                  <div><span style="color:#d400ff;">[MALWARE]</span> disables system — force remove</div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-security','SECURITY')}
                <div class="panel mini-stats">
                  <div class="panel-title">MAINTENANCE</div>
                  <div id="sec-repair"></div>
                </div>
                <div class="panel mini-stats" style="margin-top:0.5rem;">
                  <div id="sec-perimeter-side" style="display:none;"></div>
                  <div class="panel-title">SPECS</div>
                  <p>SEC LVL<span>${GameState.workshop.upgrades.security.level}</span></p>
                  <p>INTERVAL<span>${GameState.security.threatInterval}s</span></p>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn  = () => upd();
            threatFn = () => { renderThreats(); upd(); };
            perimFn  = () => renderPerimeter();
            GameState.on('tick',           tickFn);
            GameState.on('threat',         threatFn);
            GameState.on('threatResolved', threatFn);
            GameState.on('perimeterAlert', perimFn);
            GameState.on('repair',         () => renderRepair());
            renderThreats(); renderMG(); renderRepair(); renderPerimeter();

            viewer3d = mountDeptModel('canvas-security','security',{
                cz:3.2,
                animate:(model,scene,t)=>{
                    if(model.children[2]) model.children[2].rotation.y = t*0.003;
                    const threats = GameState.security.threats.length;
                    const existing = scene.userData.virusNodes || [];
                    const threatColors = { VIRUS: 0xff2222, BREACH: 0xff8800, MALWARE: 0xcc00ff };
                    while(existing.length < threats * 3) {
                        const tRef = GameState.security.threats[Math.floor(existing.length/3)] || GameState.security.threats[0];
                        const col = tRef ? (threatColors[tRef.type] || 0xff2222) : 0xff2222;
                        const virusMat = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.75 });
                        const shapes = [new THREE.OctahedronGeometry(0.08+Math.random()*0.12,0), new THREE.TetrahedronGeometry(0.09+Math.random()*0.1,0), new THREE.IcosahedronGeometry(0.06+Math.random()*0.09,0)];
                        const mesh = new THREE.Mesh(shapes[Math.floor(Math.random()*3)], virusMat);
                        const r2=0.6+Math.random()*1.2, a=Math.random()*Math.PI*2;
                        mesh.position.set(Math.cos(a)*r2,(Math.random()-0.5)*1.5,Math.sin(a)*r2);
                        mesh.userData.orbit={r:r2,a,speed:0.0008+Math.random()*0.001,vy:(Math.random()-0.5)*1.5};
                        scene.add(mesh); existing.push(mesh);
                    }
                    while(existing.length > threats * 3) { const m=existing.pop(); scene.remove(m); }
                    scene.userData.virusNodes = existing;
                    existing.forEach((m,i)=>{
                        const o=m.userData.orbit; o.a+=o.speed*(1+threats*0.3);
                        m.position.x=Math.cos(o.a)*o.r; m.position.z=Math.sin(o.a)*o.r;
                        m.position.y=o.vy+Math.sin(t*0.001+i)*0.15;
                        m.rotation.x+=0.012; m.rotation.y+=0.009;
                        m.material.opacity=0.4+0.5*Math.abs(Math.sin(t*0.002+i*0.8));
                    });
                }
            });
        },

        onExit() {
            if(mgInt) clearInterval(mgInt); activeMG=null;
            ['tick','threat','threatResolved','perimeterAlert','repair'].forEach(e=>{
                if(GameState._listeners[e]) GameState._listeners[e]=GameState._listeners[e].filter(f=>f!==tickFn&&f!==threatFn&&f!==perimFn);
            });
            viewer3d?.dispose();
        }
    };
}

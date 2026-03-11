import { GameState } from '../../core/GameState.js';
import { resolveThreat } from '../../core/GameLoop.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { SE } from '../../core/SoundEngine.js';

export function createSecurityScreen() {
    let viewer3d=null, tickFn=null, threatFn=null, activeMG=null, mgInt=null;

    function renderThreats() {
        const c=document.getElementById('sec-threats'); if(!c)return;
        const threats=GameState.security.threats;
        if(!threats.length){c.innerHTML=`<div class="label" style="padding:0.4rem 0;">-- NO ACTIVE THREATS --</div>`;return;}
        c.innerHTML=threats.map(t=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;border-bottom:1px solid #1a4a2e;">
              <span>
                <span style="color:${t.severity>=3?'#ff2222':'#ff8800'};">[${t.type}]</span>
                <span style="margin-left:6px;">${t.target.toUpperCase()}</span>
                <span class="label" style="margin-left:6px;">SEV ${t.severity}</span>
              </span>
              <button class="btn btn-sm sec-engage" data-id="${t.id}">ENGAGE</button>
            </div>`).join('');
        c.querySelectorAll('.sec-engage').forEach(b=>b.addEventListener('click',()=>startMG(parseInt(b.dataset.id))));
    }

    function startMG(tid) {
        const t=GameState.security.threats.find(x=>x.id===tid); if(!t)return;
        activeMG={tid,clicks:0,req:t.severity*8+5,time:15,type:t.type};
        renderMG();
        if(mgInt)clearInterval(mgInt);
        mgInt=setInterval(()=>{
            if(!activeMG){clearInterval(mgInt);return;}
            activeMG.time--;
            const el=document.getElementById('mg-timer'); if(el)el.textContent=`${activeMG.time}s`;
            if(activeMG.time<=0){
                clearInterval(mgInt); activeMG=null;
                const mg=document.getElementById('sec-mg'); if(mg)mg.innerHTML=`<div class="label" style="color:#ff2222;padding:0.5rem;">!! TIMEOUT -- SYSTEM COMPROMISED</div>`;
                setTimeout(()=>{renderMG();renderThreats();},2000);
            }
        },1000);
    }

    function renderMG() {
        const mg=document.getElementById('sec-mg'); if(!mg)return;
        if(!activeMG){mg.innerHTML=`<div class="label" style="text-align:center;padding:0.75rem;">Select a threat to engage</div>`;return;}
        const pct=Math.round((activeMG.clicks/activeMG.req)*100);
        mg.innerHTML=`
          <div class="panel" style="border-color:#ff8800;margin:0;">
            <div class="panel-title" style="color:#ff8800;">${activeMG.type==='VIRUS'?'VIRUS CONTAINMENT':'MALFUNCTION REPAIR'}</div>
            <div class="stat-row"><span class="key">TIME</span><span class="val" id="mg-timer" style="color:#ff2222;">${activeMG.time}s</span></div>
            <div class="bar-track" style="margin-bottom:0.4rem;"><div class="bar-fill" id="mg-bar" style="width:${pct}%;"></div></div>
            <div id="mg-cnt" class="label" style="text-align:center;margin-bottom:0.6rem;">${activeMG.clicks} / ${activeMG.req}</div>
            <button id="mg-btn" class="btn btn-primary" style="width:100%;font-size:1.3rem;letter-spacing:3px;padding:8px;">
              ${activeMG.type==='VIRUS'?'PURGE VIRUS':'REPAIR SYSTEM'}
            </button>
          </div>`;
        document.getElementById('mg-btn')?.addEventListener('click',()=>{
            if(!activeMG)return;
            activeMG.clicks++;
            const p=Math.round((activeMG.clicks/activeMG.req)*100);
            const b=document.getElementById('mg-bar'); if(b)b.style.width=`${p}%`;
            const cnt=document.getElementById('mg-cnt'); if(cnt)cnt.textContent=`${activeMG.clicks} / ${activeMG.req}`;
            if(activeMG.clicks>=activeMG.req){
                clearInterval(mgInt); resolveThreat(activeMG.tid); SE.resolve(); activeMG=null;
                const mg2=document.getElementById('sec-mg'); if(mg2)mg2.innerHTML=`<div class="label" style="color:#14fdce;text-align:center;padding:0.75rem;">-- THREAT NEUTRALIZED --</div>`;
                setTimeout(()=>{renderThreats();renderMG();},1500);
            }
        });
    }

    function upd() {
        renderThreats();
        const nc=document.getElementById('sec-cnt'); if(nc){nc.textContent=GameState.security.threats.length;nc.style.color=GameState.security.threats.length>0?'#ff2222':'#14fdce';}
        const nt=document.getElementById('sec-next'); if(nt)nt.textContent=`${GameState.security.threatInterval-GameState.security.nextThreatTimer}s`;
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
                  <div class="stat-row"><span class="key">ACTIVE THREATS</span><span class="val" id="sec-cnt" style="color:${GameState.security.threats.length>0?'#ff2222':'#14fdce'}">${GameState.security.threats.length}</span></div>
                  <div class="stat-row"><span class="key">NEXT SCAN</span><span class="val label" id="sec-next">--</span></div>
                </div>

                <div class="panel">
                  <div class="panel-title">THREAT LOG</div>
                  <div id="sec-threats"><div class="label" style="padding:0.4rem 0;">-- NO ACTIVE THREATS --</div></div>
                </div>

                <div id="sec-mg" style="margin-top:0.6rem;">
                  <div class="label" style="text-align:center;padding:0.75rem;">Select a threat to engage</div>
                </div>

                <hr class="sep">
                <div class="label" style="line-height:2;">
                  <div>> VIRUS: click rapidly to purge from system</div>
                  <div>> MALFUNCTION: repair operations required</div>
                  <div>> Unresolved threats cause ongoing damage</div>
                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-security','SECURITY')}
                <div class="panel mini-stats">
                  <div class="panel-title">SPECS</div>
                  <p>SEC LVL<span>${GameState.security.level}</span></p>
                  <p>INTERVAL<span>${GameState.security.threatInterval}s</span></p>
                  <div class="label" style="margin-top:0.4rem;">Upgrade to reduce threat frequency.</div>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn=()=>upd(); threatFn=()=>{renderThreats();upd();};
            GameState.on('tick',tickFn); GameState.on('threat',threatFn); GameState.on('threatResolved',threatFn);
            renderThreats(); renderMG();
            viewer3d=mountDeptModel('canvas-security','security',{
                cz:3.2,
                animate:(model,scene,t)=>{
                    // Alert diamond spins
                    if(model.children[2]) model.children[2].rotation.y = t*0.003;

                    // Spawn red virus polygons based on threat count
                    const threats = GameState.security.threats.length;
                    const existing = scene.userData.virusNodes || [];

                    // Add new virus node if threat count grew
                    while(existing.length < threats * 3) {
                        const virusMat = new THREE.MeshBasicMaterial({
                            color: 0xff2222, wireframe: true, transparent: true, opacity: 0.75
                        });
                        const shapes = [
                            new THREE.OctahedronGeometry(0.08 + Math.random()*0.12, 0),
                            new THREE.TetrahedronGeometry(0.09 + Math.random()*0.1, 0),
                            new THREE.IcosahedronGeometry(0.06 + Math.random()*0.09, 0),
                        ];
                        const mesh = new THREE.Mesh(shapes[Math.floor(Math.random()*3)], virusMat);
                        // Orbit randomly around the scene
                        const r = 0.6 + Math.random() * 1.2;
                        const a = Math.random() * Math.PI * 2;
                        const vy = (Math.random() - 0.5) * 1.5;
                        mesh.position.set(Math.cos(a)*r, vy, Math.sin(a)*r);
                        mesh.userData.orbit = { r, a, speed: 0.0008 + Math.random()*0.001, vy };
                        scene.add(mesh);
                        existing.push(mesh);
                    }
                    // Remove excess when threats resolved
                    while(existing.length > threats * 3) {
                        const m = existing.pop();
                        scene.remove(m);
                    }
                    scene.userData.virusNodes = existing;

                    // Animate each virus: orbit + pulse
                    existing.forEach((m, i) => {
                        const o = m.userData.orbit;
                        o.a += o.speed * (1 + threats * 0.3);
                        m.position.x = Math.cos(o.a) * o.r;
                        m.position.z = Math.sin(o.a) * o.r;
                        m.position.y = o.vy + Math.sin(t * 0.001 + i) * 0.15;
                        m.rotation.x += 0.012;
                        m.rotation.y += 0.009;
                        // Pulse opacity with threat severity
                        m.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(t * 0.002 + i * 0.8));
                    });
                }
            });
        },

        onExit() {
            if(mgInt)clearInterval(mgInt); activeMG=null;
            ['tick','threat','threatResolved'].forEach(e=>{if(GameState._listeners[e])GameState._listeners[e]=GameState._listeners[e].filter(f=>f!==tickFn&&f!==threatFn);});
            viewer3d?.dispose();
        }
    };
}

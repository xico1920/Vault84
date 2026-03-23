import { GameState } from '../../core/GameState.js';
import { resolveThreat, repairSystem } from '../../core/GameLoop.js';
import { mountDeptModel, dept3DPanel } from '../../core/DeptLayout.js';
import { SE } from '../../core/SoundEngine.js';
import { virusMinigame, breachMinigame, malwareMinigame } from '../../core/SecurityMinigames.js';
import { getCameras, mountCameraFeed } from '../../core/CameraSystem.js';

export function createSecurityScreen() {
    let viewer3d=null, tickFn=null, threatFn=null;
    let activeMG=null, mgInterval=null, mgInstance=null;
    let activeCamIdx=0, cameraInstance=null;

    function renderThreats() {
        const c=document.getElementById('sec-threats'); if(!c) return;
        const threats=GameState.security.threats;
        if(!threats.length){ c.innerHTML=`<div style="font-size:0.72rem;color:#2a6a45;padding:4px 0;">-- NO ACTIVE THREATS --</div>`; return; }
        c.innerHTML=threats.map(t=>`
            <div style="border-left:2px solid ${t.color};padding:3px 6px;margin-bottom:3px;background:rgba(0,0,0,0.25);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.72rem;"><span style="color:${t.color};">[${t.type}]</span> ${t.target.toUpperCase()}</span>
                <span style="display:flex;gap:4px;align-items:center;">
                  <span style="color:${t.timeLeft<10?'#ff2222':'#ff8800'};font-size:0.68rem;" id="tt-${t.id}">${t.timeLeft}s</span>
                  <button class="btn btn-sm sec-engage" data-id="${t.id}" style="border-color:${t.color};color:${t.color};font-size:0.6rem;padding:1px 4px;">ENGAGE</button>
                </span>
              </div>
              <div style="background:#0d2018;height:2px;margin-top:3px;"><div id="tb-${t.id}" style="height:2px;background:${t.color};width:${Math.round(t.clicks/t.clicksReq*100)}%;"></div></div>
            </div>`).join('');
        c.querySelectorAll('.sec-engage').forEach(b=>b.addEventListener('click',()=>startMG(parseInt(b.dataset.id))));
    }

    function startMG(tid) {
        const t=GameState.security.threats.find(x=>x.id===tid); if(!t) return;
        if(activeMG?.tid===tid) return;
        if(mgInstance){mgInstance.destroy();mgInstance=null;}
        if(mgInterval){clearInterval(mgInterval);mgInterval=null;}
        activeMG={tid};

        // Signal that a minigame is active — disables keyboard nav shortcuts
        window._minigameActive = true;

        renderMGShell(t);
        const cv=document.getElementById('mg-canvas'); if(!cv) return;

        // Track whether onComplete fired before the threat disappeared
        let mgCompleted = false;

        const onProgress=pct=>{ t.clicks=Math.round(pct*t.clicksReq); const b=document.getElementById('mg-bar'); if(b)b.style.width=`${Math.round(pct*100)}%`; };

        const onComplete=()=>{
            mgCompleted = true;
            if(mgInstance){mgInstance.destroy();mgInstance=null;}
            if(mgInterval){clearInterval(mgInterval);mgInterval=null;}
            resolveThreat(tid); SE.resolve(); activeMG=null;
            window._minigameActive = false;
            const mg=document.getElementById('sec-mg');
            if(mg) mg.innerHTML=`<div style="text-align:center;padding:8px;border:1px solid #14fdce;color:#14fdce;font-size:0.8rem;letter-spacing:3px;">✓ NEUTRALIZED</div>`;
            setTimeout(()=>{renderThreats();renderMGIdle();},2000);
        };

        if(t.type==='VIRUS')   mgInstance=virusMinigame(cv,t,onProgress,onComplete);
        else if(t.type==='BREACH')  mgInstance=breachMinigame(cv,t,onProgress,onComplete);
        else if(t.type==='MALWARE') mgInstance=malwareMinigame(cv,t,onProgress,onComplete);

        mgInterval=setInterval(()=>{
            if(!activeMG) return;
            const threat=GameState.security.threats.find(x=>x.id===tid);

            if(!threat){
                // Threat is gone — either resolved (mgCompleted=true) or expired (failed)
                if(mgInstance){mgInstance.destroy();mgInstance=null;}
                clearInterval(mgInterval);mgInterval=null;
                activeMG=null;
                window._minigameActive = false;

                if(!mgCompleted){
                    // Minigame failed — threat expired while player was engaged
                    const mg=document.getElementById('sec-mg');
                    if(mg) mg.innerHTML=`
                        <div style="text-align:center;padding:10px 8px;border:1px solid #ff2222;background:rgba(10,0,0,0.6);">
                            <div style="color:#ff2222;font-size:0.8rem;letter-spacing:3px;margin-bottom:4px;">✗ CONTAINMENT FAILED</div>
                            <div style="color:#ff4444;font-size:0.65rem;letter-spacing:1px;">SYSTEM DAMAGE APPLIED — CHECK MAINTENANCE</div>
                        </div>`;
                    // Shake the game-content area for impact
                    const content=document.getElementById('game-content');
                    if(content){
                        content.classList.remove('threat-fail-flash');
                        void content.offsetWidth;
                        content.classList.add('threat-fail-flash');
                        setTimeout(()=>content.classList.remove('threat-fail-flash'),900);
                    }
                    SE.threat();
                }
                setTimeout(()=>{renderThreats();renderMGIdle();},2500);
                return;
            }

            const el=document.getElementById('mg-time');
            if(el){el.textContent=`${threat.timeLeft}s`;el.style.color=threat.timeLeft<8?'#ff2222':'#ff8800';}
        },300);
    }

    function renderMGShell(t) {
        const mg=document.getElementById('sec-mg'); if(!mg) return;
        const inst={VIRUS:'Click infected nodes.',BREACH:'Memorize + type code.',MALWARE:'Block packets.'}[t.type]||'';
        mg.innerHTML=`
            <div style="border:1px solid ${t.color};overflow:hidden;">
                <div style="padding:3px 8px;display:flex;justify-content:space-between;border-bottom:1px solid #0d3a20;font-size:0.68rem;">
                    <span style="color:${t.color};">[${t.type}] ${inst}</span>
                    <span id="mg-time" style="color:#ff8800;">${t.timeLeft}s</span>
                </div>
                <div style="padding:3px 8px 4px;border-bottom:1px solid #0d3a20;background:#0d2018;height:4px;">
                    <div id="mg-bar" style="height:4px;background:${t.color};width:0%;transition:width 0.1s;"></div>
                </div>
                <canvas id="mg-canvas" style="display:block;width:100%;height:155px;cursor:crosshair;"></canvas>
            </div>`;
    }

    function renderMGIdle() {
        const mg=document.getElementById('sec-mg'); if(!mg) return;
        mg.innerHTML=`<div style="font-size:0.68rem;color:#1a5a35;text-align:center;padding:6px;">// select a threat above to engage</div>`;
    }

    function mountCamera(idx) {
        if(cameraInstance){cameraInstance.destroy();cameraInstance=null;}
        const cv=document.getElementById('sec-cam-canvas'); if(!cv) return;
        activeCamIdx=idx;
        cameraInstance=mountCameraFeed(cv,idx,GameState);
        document.querySelectorAll('.cam-btn').forEach((b,i)=>{
            b.style.color=i===idx?'#14fdce':'#3d7755';
            b.style.borderBottom=`2px solid ${i===idx?'#14fdce':'transparent'}`;
            b.style.background=i===idx?'rgba(20,253,206,0.06)':'transparent';
        });
        const lbl=document.getElementById('sec-cam-label'); if(lbl) lbl.textContent=getCameras()[idx].label;
    }

    function renderRepair() {
        const el=document.getElementById('sec-repair'); if(!el) return;
        const sys=[
            {id:'reactor',label:'REACTOR',wear:GameState.reactor.wear,cost:80},
            {id:'mining',label:'MINING',wear:GameState.mining.wear,cost:40},
            {id:'refinery',label:'REFINERY',wear:GameState.refinery.wear,cost:55},
            {id:'water',label:'WATER',wear:GameState.water.wear,cost:45},
        ];
        el.innerHTML=sys.map(s=>{
            const wc=s.wear>=70?'#ff2222':s.wear>=40?'#ff8800':'#3ecb88';
            const can=GameState.cash>=s.cost;
            return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
                <span style="flex:1;font-size:0.68rem;color:#5ecba8;">${s.label}</span>
                <span style="color:${wc};font-size:0.68rem;min-width:26px;">${Math.round(s.wear)}%</span>
                <button class="btn sec-repair" data-sys="${s.id}" style="font-size:0.6rem;padding:1px 6px;border-color:${can?'#14fdce':'#1a4a2a'};color:${can?'#14fdce':'#1a4a2a'};${!can?'opacity:0.5;':''}" ${!can?'disabled':''}>FIX ${s.cost}$</button>
            </div>`;
        }).join('');
        el.querySelectorAll('.sec-repair').forEach(b=>b.addEventListener('click',()=>{if(repairSystem(b.dataset.sys))renderRepair();}));
    }

    function upd() {
        const nc=document.getElementById('sec-cnt'); if(nc){nc.textContent=GameState.security.threats.length;nc.style.color=GameState.security.threats.length>0?'#ff2222':'#14fdce';}
        const nt=document.getElementById('sec-next'); if(nt) nt.textContent=`${GameState.security.threatInterval-GameState.security.nextThreatTimer}s`;
        GameState.security.threats.forEach(t=>{
            const el=document.getElementById(`tt-${t.id}`); if(el){el.textContent=`${t.timeLeft}s`;el.style.color=t.timeLeft<10?'#ff2222':'#ff8800';}
            const bar=document.getElementById(`tb-${t.id}`); if(bar) bar.style.width=`${Math.round(t.clicks/t.clicksReq*100)}%`;
        });
        renderRepair();

        // Show failed threats count if any
        const fc=document.getElementById('sec-failed');
        if(fc) fc.textContent=GameState.session.threatsFailed||0;
    }

    const cams=getCameras();

    return {
        async render() {
            const cams=getCameras();
            return `
            <div class="dept-layout">
              <div class="dept-main">
                <h1>SECURITY</h1>
                <h2>VAULT DEFENSE SYSTEM</h2>

                <!-- Camera + Threat Activity side by side -->
                <div class="sec-split" style="display:flex;gap:0.75rem;align-items:flex-start;">

                  <!-- LEFT: Camera feed, fixed width -->
                  <div class="sec-cam-col" style="flex:0 0 42%;min-width:0;">
                    <div class="panel" style="padding:0;overflow:hidden;">
                      <div class="panel-title" style="padding:4px 10px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.72rem;">// CAM: <span id="sec-cam-label" style="color:#14fdce;">${cams[0].label}</span></span>
                        <span class="label" style="font-size:0.6rem;">● LIVE</span>
                      </div>
                      <div id="sec-cam-container" style="position:relative;background:#010401;">
                        <canvas id="sec-cam-canvas" style="display:block;width:100%;aspect-ratio:4/3;"></canvas>
                      </div>
                      <div style="display:flex;border-top:1px solid #0d3a20;">
                        ${cams.map((c,i)=>`<button class="cam-btn" data-i="${i}" style="flex:1;padding:3px 1px;font-family:'VT323',monospace;font-size:0.58rem;letter-spacing:1px;border:0;border-right:1px solid #0d3a20;background:${i===0?'rgba(20,253,206,0.06)':'transparent'};cursor:pointer;color:${i===0?'#14fdce':'#3d7755'};border-bottom:2px solid ${i===0?'#14fdce':'transparent'};">${c.id}</button>`).join('')}
                      </div>
                    </div>
                  </div>

                  <!-- RIGHT: Threat activity -->
                  <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0.5rem;">

                    <div class="panel">
                      <div class="panel-title" style="display:flex;justify-content:space-between;">
                        <span>THREAT ACTIVITY</span>
                        <span class="label" style="font-size:0.65rem;">ACTIVE: <span id="sec-cnt" style="color:${GameState.security.threats.length>0?'#ff2222':'#14fdce'};">${GameState.security.threats.length}</span> &nbsp; NEXT: <span id="sec-next">--</span></span>
                      </div>
                      <div id="sec-threats"></div>
                    </div>

                    <div id="sec-mg"></div>

                    <div style="font-size:0.62rem;color:#1a4a2a;margin-top:2px;">
                      <span style="color:#ff2222;">[V]</span> click nodes &nbsp;·&nbsp;
                      <span style="color:#ff8800;">[B]</span> memorize+type &nbsp;·&nbsp;
                      <span style="color:#d400ff;">[M]</span> block packets
                    </div>
                  </div>

                </div>
              </div>

              <div class="dept-sidebar">
                ${dept3DPanel('canvas-security','SECURITY')}
                <div class="panel mini-stats">
                  <div class="panel-title">MAINTENANCE</div>
                  <div id="sec-repair"></div>
                </div>
                <div class="panel mini-stats">
                  <div class="panel-title">SPECS</div>
                  <div class="stat-row"><span class="key">SEC LEVEL</span><span class="val">${GameState.workshop.upgrades.security.level}</span></div>
                  <div class="stat-row"><span class="key">INTERVAL</span><span class="val">${GameState.security.threatInterval}s</span></div>
                  <div class="stat-row"><span class="key">RESOLVED</span><span class="val" style="color:#14fdce;">${GameState.session.threatsResolved}</span></div>
                  <div class="stat-row"><span class="key">FAILED</span><span class="val" style="color:${(GameState.session.threatsFailed||0)>0?'#ff8800':'#3d9970'};"><span id="sec-failed">${GameState.session.threatsFailed||0}</span></span></div>
                  <div class="stat-row"><span class="key">STREAK</span><span class="val" style="color:#14fdce;">${GameState.session.consecutiveThreatsSolved||0}</span></div>
                </div>
              </div>
            </div>`;
        },

        async onRendered() {
            tickFn=()=>upd();
            threatFn=()=>{renderThreats();upd();};
            GameState.on('tick',tickFn);
            GameState.on('threat',threatFn);
            GameState.on('threatResolved',threatFn);
            GameState.on('threatFailed',threatFn);
            GameState.on('repair',()=>renderRepair());
            renderThreats(); renderMGIdle(); renderRepair();

            document.querySelectorAll('.cam-btn').forEach((b,i)=>{
                b.addEventListener('click',()=>mountCamera(i));
            });
            setTimeout(()=>mountCamera(0),80);

            viewer3d=mountDeptModel('canvas-security','security',{
                cz:3.2,
                animate:(model,scene,t)=>{
                    if(model.children[2]) model.children[2].rotation.y=t*0.003;
                    const threats=GameState.security.threats.length;
                    const existing=scene.userData.virusNodes||[];
                    const cols={VIRUS:0xff2222,BREACH:0xff8800,MALWARE:0xcc00ff};
                    while(existing.length<threats*3){
                        const tRef=GameState.security.threats[Math.floor(existing.length/3)]||GameState.security.threats[0];
                        const col=tRef?(cols[tRef.type]||0xff2222):0xff2222;
                        const mat=new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:0.75});
                        const shapes=[new THREE.OctahedronGeometry(0.08+Math.random()*0.12,0),new THREE.TetrahedronGeometry(0.09+Math.random()*0.1,0),new THREE.IcosahedronGeometry(0.06+Math.random()*0.09,0)];
                        const mesh=new THREE.Mesh(shapes[Math.floor(Math.random()*3)],mat);
                        const r2=0.6+Math.random()*1.2,a=Math.random()*Math.PI*2;
                        mesh.position.set(Math.cos(a)*r2,(Math.random()-0.5)*1.5,Math.sin(a)*r2);
                        mesh.userData.orbit={r:r2,a,speed:0.0008+Math.random()*0.001,vy:(Math.random()-0.5)*1.5};
                        scene.add(mesh);existing.push(mesh);
                    }
                    while(existing.length>threats*3){const m=existing.pop();scene.remove(m);}
                    scene.userData.virusNodes=existing;
                    existing.forEach((m,i)=>{
                        const o=m.userData.orbit;o.a+=o.speed*(1+threats*0.3);
                        m.position.x=Math.cos(o.a)*o.r;m.position.z=Math.sin(o.a)*o.r;
                        m.position.y=o.vy+Math.sin(t*0.001+i)*0.15;
                        m.rotation.x+=0.012;m.rotation.y+=0.009;
                        m.material.opacity=0.4+0.5*Math.abs(Math.sin(t*0.002+i*0.8));
                    });
                }
            });
        },

        onExit() {
            if(mgInstance){mgInstance.destroy();mgInstance=null;}
            if(mgInterval){clearInterval(mgInterval);mgInterval=null;}
            if(cameraInstance){cameraInstance.destroy();cameraInstance=null;}
            activeMG=null;
            window._minigameActive = false;
            ['tick','threat','threatResolved','threatFailed','repair'].forEach(e=>{
                if(GameState._listeners[e])GameState._listeners[e]=GameState._listeners[e].filter(f=>f!==tickFn&&f!==threatFn);
            });
            viewer3d?.dispose();
        }
    };
}

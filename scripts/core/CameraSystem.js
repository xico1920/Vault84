// CameraSystem.js — FNAF-style cameras, procedural textures, 4:3

export const CAMERAS = [
    { id: 'CAM-01', label: 'REACTOR CORE',  stateKey: 'reactor'  },
    { id: 'CAM-02', label: 'MINING SHAFT',  stateKey: 'mining'   },
    { id: 'CAM-03', label: 'ORE REFINERY',  stateKey: 'refinery' },
    { id: 'CAM-04', label: 'WATER PLANT',   stateKey: 'water'    },
    { id: 'CAM-05', label: 'CORRIDOR 7',    stateKey: null       },
];
export function getCameras() { return CAMERAS; }

// ── Procedural textures ───────────────────────────────────────────
function makeCheckerTex(dark='#181818', light='#242424', tileSize=32) {
    const cv=document.createElement('canvas'); cv.width=cv.height=256;
    const ctx=cv.getContext('2d');
    for(let y=0;y<256;y+=tileSize) for(let x=0;x<256;x+=tileSize){
        ctx.fillStyle=((x/tileSize+y/tileSize)%2===0)?dark:light;
        ctx.fillRect(x,y,tileSize,tileSize);
    }
    // grunge overlay
    for(let i=0;i<2000;i++){
        ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.4})`;
        ctx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2);
    }
    for(let i=0;i<6;i++){
        const g=ctx.createRadialGradient(Math.random()*256,Math.random()*256,0,Math.random()*256,Math.random()*256,25+Math.random()*35);
        g.addColorStop(0,`rgba(0,0,0,${0.3+Math.random()*0.4})`);
        g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
    }
    const t=new THREE.CanvasTexture(cv);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); return t;
}

function makeWallTex(base='#0c0c0c') {
    const cv=document.createElement('canvas'); cv.width=cv.height=256;
    const ctx=cv.getContext('2d');
    ctx.fillStyle=base; ctx.fillRect(0,0,256,256);
    for(let i=0;i<25;i++){
        const x=Math.random()*256;
        const g=ctx.createLinearGradient(x,0,x,256);
        g.addColorStop(0,'rgba(0,0,0,0)');
        g.addColorStop(0.5,`rgba(0,0,0,${0.15+Math.random()*0.3})`);
        g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=g; ctx.fillRect(x-1,0,1+Math.random()*2,256);
    }
    for(let i=0;i<4;i++){
        const y=Math.random()*256;
        ctx.strokeStyle=`rgba(0,0,0,${0.2+Math.random()*0.3})`;
        ctx.lineWidth=Math.random()*1.5;
        ctx.beginPath(); ctx.moveTo(0,y);
        for(let x=0;x<256;x+=10) ctx.lineTo(x,y+(Math.random()-0.5)*3);
        ctx.stroke();
    }
    for(let i=0;i<1500;i++){
        ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.25})`;
        ctx.fillRect(Math.random()*256,Math.random()*256,1,1);
    }
    const t=new THREE.CanvasTexture(cv);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,2); return t;
}

function makeMetalTex() {
    const cv=document.createElement('canvas'); cv.width=cv.height=256;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#1a1a1a'; ctx.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=1){
        const v=10+Math.random()*8;
        ctx.fillStyle=`rgb(${v},${v+2},${v})`;
        ctx.fillRect(0,y,256,1);
    }
    for(let x=48;x<256;x+=64) for(let y=48;y<256;y+=64){
        ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
        ctx.fillStyle='#252525'; ctx.fill();
        ctx.beginPath(); ctx.arc(x-1,y-1,2,0,Math.PI*2);
        ctx.fillStyle='#111'; ctx.fill();
    }
    for(let i=0;i<800;i++){
        ctx.fillStyle=`rgba(0,0,0,${Math.random()*0.2})`;
        ctx.fillRect(Math.random()*256,Math.random()*256,1,1);
    }
    const t=new THREE.CanvasTexture(cv);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); return t;
}

function makeRockTex() {
    const cv=document.createElement('canvas'); cv.width=cv.height=256;
    const ctx=cv.getContext('2d');
    ctx.fillStyle='#0e0e0e'; ctx.fillRect(0,0,256,256);
    for(let i=0;i<4000;i++){
        const v=Math.random()*20;
        ctx.fillStyle=`rgb(${v},${v},${v})`;
        ctx.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,1+Math.random()*2);
    }
    for(let i=0;i<10;i++){
        ctx.strokeStyle=`rgba(0,0,0,${0.5+Math.random()*0.4})`;
        ctx.lineWidth=0.5+Math.random();
        ctx.beginPath(); ctx.moveTo(Math.random()*256,Math.random()*256);
        for(let j=0;j<3;j++) ctx.lineTo(Math.random()*256,Math.random()*256);
        ctx.stroke();
    }
    const t=new THREE.CanvasTexture(cv);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,4); return t;
}

// ── Material helpers ──────────────────────────────────────────────
function TM(tex, rough=0.88, metal=0.1) {
    return new THREE.MeshStandardMaterial({map:tex, roughness:rough, metalness:metal});
}
function CM(col, rough=0.85, metal=0.1, em=null, ei=0) {
    const m=new THREE.MeshStandardMaterial({color:col,roughness:rough,metalness:metal});
    if(em){m.emissive=new THREE.Color(em);m.emissiveIntensity=ei;}
    return m;
}
function mk(geo,mat,shadow=true){
    const m=new THREE.Mesh(geo,mat);
    if(shadow){m.castShadow=true;m.receiveShadow=true;} return m;
}
function B(w,h,d,mat){return mk(new THREE.BoxGeometry(w,h,d),mat);}
function Cy(rt,rb,h,s,mat){return mk(new THREE.CylinderGeometry(rt,rb,h,s),mat);}
function Sp(r,s,mat){return mk(new THREE.SphereGeometry(r,s,s),mat);}

function mkSpot(col,lm,angle,px,py,pz,tx,ty,tz){
    const l=new THREE.SpotLight(col,lm,22,angle,0.45,1.5);
    l.position.set(px,py,pz); l.castShadow=true;
    l.shadow.mapSize.width=l.shadow.mapSize.height=512;
    l.shadow.bias=-0.001;
    const t=new THREE.Object3D(); t.position.set(tx,ty,tz);
    return{l,t};
}

// ── CAM-01 REACTOR ────────────────────────────────────────────────
function buildReactor(scene) {
    const flT=makeCheckerTex('#222','#2e2e2e',30);
    const wT=makeWallTex('#141414');
    const mT=makeMetalTex();

    // Floor
    const fl=mk(new THREE.PlaneGeometry(14,14),TM(flT,0.9,0.05),false);
    fl.rotation.x=-Math.PI/2; fl.position.y=-3; fl.receiveShadow=true; scene.add(fl);
    // Walls
    [[-6,0,0,Math.PI/2],[6,0,0,-Math.PI/2],[0,0,-6,0],[0,0,6,Math.PI]].forEach(([x,y,z,ry])=>{
        const w=mk(new THREE.PlaneGeometry(14,8),TM(wT,0.92,0.05),false);
        w.position.set(x,y,z); w.rotation.y=ry; w.receiveShadow=true; scene.add(w);
    });

    // Reactor vessel
    const vessel=Cy(2,2,4.5,20,TM(mT,0.45,0.75)); vessel.position.set(0,0,0); scene.add(vessel);
    [-.8,0,.8].forEach(y=>{
        const ring=Cy(2.1,2.1,0.2,20,CM(0x303a30,0.3,0.8));
        ring.position.set(0,y,0); scene.add(ring);
    });
    const cap=Cy(2.3,2.3,0.4,20,CM(0x2a3a2a,0.35,0.7)); cap.position.set(0,2.5,0); scene.add(cap);
    const capTop=Cy(1.4,1.0,0.6,14,CM(0x223022,0.4,0.6)); capTop.position.set(0,2.9,0); scene.add(capTop);

    // Core glow
    const coreMat=CM(0x00ff88,0.15,0,0x00ff88,3.0);
    const core=Sp(0.6,14,coreMat); core.position.set(0,2.5,0); scene.add(core);

    // Rods
    for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2;
        const rod=Cy(0.09,0.09,4.8,6,TM(mT,0.45,0.6)); rod.position.set(Math.cos(a)*2.8,0,Math.sin(a)*2.8); scene.add(rod);
        const tip=Sp(0.1,6,CM(0x00ff88,0.15,0,0x00ff88,1.2)); tip.position.set(Math.cos(a)*2.8,2.4,Math.sin(a)*2.8); scene.add(tip);
    }
    // Pipe rings
    for(let y of [0.2,1.0]){
        const tor=new THREE.Mesh(new THREE.TorusGeometry(3.0,0.07,6,22),TM(mT,0.4,0.8));
        tor.rotation.x=Math.PI/2; tor.position.y=y; tor.castShadow=true; scene.add(tor);
    }
    // Caution floor stripes
    for(let i=-4;i<=4;i+=1.4){
        const s=mk(new THREE.PlaneGeometry(0.45,12),CM(i%2===0?0x2a2000:0x200000,0.95,0),false);
        s.rotation.x=-Math.PI/2; s.position.set(i,-2.98,0); scene.add(s);
    }
    // Control panel
    const panel=B(2.2,1.8,0.12,TM(mT,0.6,0.4)); panel.position.set(-5.4,0.3,-5.4); scene.add(panel);
    for(let j=0;j<4;j++){
        const btn=B(0.14,0.14,0.06,CM(j%2===0?0x00ff44:0xff4400,0.2,0,j%2===0?0x00ff44:0xff4400,0.8));
        btn.position.set(-5.4-0.28+j*0.22,0.3,-5.33); scene.add(btn);
    }

    // LIGHTS — bright enough to see everything
    const {l:s1,t:t1}=mkSpot(0xd0ffe8,600,0.35,0,5.5,0,0,0,0); scene.add(s1); scene.add(t1); s1.target=t1;
    const {l:s2,t:t2}=mkSpot(0xd0ffe8,300,0.45,-4,4,4,-2,0,0); scene.add(s2); scene.add(t2); s2.target=t2;
    const coreL=new THREE.PointLight(0x00ff88,25,9,1.5); coreL.position.set(0,3,0); scene.add(coreL);
    scene.add(new THREE.AmbientLight(0xffffff,0.3));

    return{core,coreMat,coreL};
}

// ── CAM-02 MINING ─────────────────────────────────────────────────
function buildMining(scene) {
    const rockT=makeRockTex(), mT=makeMetalTex(), flT=makeCheckerTex('#1a1a1a','#222',22);

    for(let i=0;i<8;i++){
        const z=-i*3.5;
        const fl=mk(new THREE.PlaneGeometry(5.4,3.7),TM(flT,0.96,0.02),false);
        fl.rotation.x=-Math.PI/2; fl.position.set(0,-2.5,z+1.85); fl.receiveShadow=true; scene.add(fl);
        const wl=mk(new THREE.PlaneGeometry(3.7,6),TM(rockT,0.97,0.01),false); wl.rotation.y=Math.PI/2; wl.position.set(-2.6,0.5,z+1.85); wl.receiveShadow=true; scene.add(wl);
        const wr=mk(new THREE.PlaneGeometry(3.7,6),TM(rockT,0.97,0.01),false); wr.rotation.y=-Math.PI/2; wr.position.set(2.6,0.5,z+1.85); wr.receiveShadow=true; scene.add(wr);
        const cl=mk(new THREE.PlaneGeometry(5.4,3.7),TM(rockT,0.97,0.01),false); cl.rotation.x=Math.PI/2; cl.position.set(0,3.0,z+1.85); scene.add(cl);
        // beams
        const lb=B(0.22,5.8,0.22,TM(mT,0.65,0.4)); lb.position.set(-2.3,0.4,z); scene.add(lb);
        const rb=B(0.22,5.8,0.22,TM(mT,0.65,0.4)); rb.position.set( 2.3,0.4,z); scene.add(rb);
        const top=B(4.9,0.18,0.18,TM(mT,0.6,0.5)); top.position.set(0,3.1,z); scene.add(top);
        if(i===7){
            const bk=mk(new THREE.PlaneGeometry(5.4,6),TM(rockT,0.97,0.01),false);
            bk.position.set(0,0.5,z-0.1); bk.receiveShadow=true; scene.add(bk);
        }
    }
    // Drill
    const drill=Cy(0.45,0.45,2.2,10,TM(mT,0.4,0.7)); drill.position.set(0,-0.5,-25); drill.rotation.x=Math.PI/2; scene.add(drill);
    const bit=Cy(0,0.45,1.4,10,CM(0x1e4028,0.3,0.8,0x00ff44,0.3)); bit.position.set(0,-0.5,-26.5); bit.rotation.x=Math.PI/2; scene.add(bit);

    // Bucket + cable
    const bucket=B(0.65,0.58,0.65,TM(mT,0.65,0.5)); bucket.position.set(1.1,0.5,-5); scene.add(bucket);
    const cable=B(0.04,5.2,0.04,CM(0x1a1a1a,0.3,0.7)); cable.position.set(1.1,3,-5); scene.add(cable);

    // Ore chunks
    [[-0.8,-2.3,-3],[0.5,-2.3,-7],[-1.0,-2.3,-11],[0.4,-2.3,-15]].forEach(([x,y,z])=>{
        const o=B(0.22+Math.random()*0.2,0.15,0.2,CM(0x1f1e00,0.9,0,0xd4c000,0.5));
        o.position.set(x,y,z); o.rotation.y=Math.random()*Math.PI; scene.add(o);
    });

    // Ceiling lights — isolated pools
    const lights=[];
    for(let z=0;z>=-21;z-=7){
        const fix=B(0.5,0.16,0.5,TM(mT,0.5,0.5)); fix.position.set(0,2.92,z); scene.add(fix);
        const cord=B(0.03,0.7,0.03,CM(0x111111)); cord.position.set(0,2.58,z); scene.add(cord);
        const bulb=Sp(0.14,6,CM(0xffffff,0.1,0,0xd8ffe8,2.5)); bulb.position.set(0,2.24,z); scene.add(bulb);
        const {l,t}=mkSpot(0xd8ffe8,320,0.45,0,2.25,z,0,-2.5,z);
        scene.add(l); scene.add(t); l.target=t; lights.push(l);
    }
    scene.add(new THREE.AmbientLight(0xffffff,0.18));
    return{bucket,cable,bit,lights};
}

// ── CAM-03 REFINERY ───────────────────────────────────────────────
function buildRefinery(scene) {
    const flT=makeCheckerTex('#1e1e1e','#282828',32), wT=makeWallTex('#111'), mT=makeMetalTex();

    const fl=mk(new THREE.PlaneGeometry(16,12),TM(flT,0.92,0.05),false);
    fl.rotation.x=-Math.PI/2; fl.position.y=-3; fl.receiveShadow=true; scene.add(fl);
    [[-7,0,0,Math.PI/2],[7,0,0,-Math.PI/2],[0,0,-5.5,0],[0,0,5.5,Math.PI]].forEach(([x,y,z,ry])=>{
        const w=mk(new THREE.PlaneGeometry(16,8),TM(wT,0.92,0.05),false);
        w.position.set(x,y,z); w.rotation.y=ry; w.receiveShadow=true; scene.add(w);
    });

    const furnaces=[];
    [-4.5,0,4.5].forEach((x,i)=>{
        const body=B(2.4,5,2,TM(makeWallTex('#0d1210'),0.8,0.1)); body.position.set(x,0.5,-4.4); scene.add(body);
        const doorMat=CM(0x2a0800,0.2,0,0xff5500,2.0);
        const door=B(1.1,1.1,0.12,doorMat); door.position.set(x,-0.1,-3.38); scene.add(door);
        const frame=B(1.32,1.32,0.08,TM(mT,0.35,0.8)); frame.position.set(x,-0.1,-3.34); scene.add(frame);
        const ch=Cy(0.26,0.3,3.2,8,TM(makeWallTex('#0c100e'),0.88,0.08)); ch.position.set(x,3.3,-4.4); scene.add(ch);
        furnaces.push({door,mat:doorMat,x});
    });
    const belt=B(14,0.15,0.85,TM(mT,0.88,0.25)); belt.position.set(0,-1.72,-0.4); scene.add(belt);
    const items=[];
    for(let i=0;i<7;i++){
        const itm=B(0.28,0.22,0.26,CM(0x1a1800,0.9,0,0xc0aa00,0.5));
        itm.position.set(-5.5+i*1.85,-1.58,-0.4); scene.add(itm); items.push(itm);
    }
    const gantry=B(14,0.25,0.25,TM(mT,0.4,0.7)); gantry.position.set(0,2.7,-2.5); scene.add(gantry);

    const {l:s1,t:t1}=mkSpot(0xfff0e0,500,0.48,-1,6,2,0,-2,-0.5); scene.add(s1); scene.add(t1); s1.target=t1;
    const {l:s2,t:t2}=mkSpot(0xfff0e0,300,0.4,4,5,-2,2,-1,-3); scene.add(s2); scene.add(t2); s2.target=t2;
    const fireLights=furnaces.map(({x})=>{
        const l=new THREE.PointLight(0xff4400,35,6,1.5); l.position.set(x,0.5,-2.7); scene.add(l); return l;
    });
    scene.add(new THREE.AmbientLight(0xffffff,0.22));
    return{furnaces,items,fireLights};
}

// ── CAM-04 WATER ──────────────────────────────────────────────────
function buildWater(scene) {
    const flT=makeCheckerTex('#1c1c1c','#262626',32), wT=makeWallTex('#111'), mT=makeMetalTex();

    const fl=mk(new THREE.PlaneGeometry(14,12),TM(flT,0.92,0.05),false);
    fl.rotation.x=-Math.PI/2; fl.position.y=-3; fl.receiveShadow=true; scene.add(fl);
    [[-6,0,0,Math.PI/2],[6,0,0,-Math.PI/2],[0,0,-5.5,0],[0,0,5.5,Math.PI]].forEach(([x,y,z,ry])=>{
        const w=mk(new THREE.PlaneGeometry(14,8),TM(wT,0.92,0.05),false);
        w.position.set(x,y,z); w.rotation.y=ry; w.receiveShadow=true; scene.add(w);
    });

    // Tanks — prominent
    [-3,3].forEach(x=>{
        const tank=Cy(1.7,1.7,5.5,16,TM(mT,0.5,0.65)); tank.position.set(x,0.25,-2.5); scene.add(tank);
        const cap=Cy(1.9,1.9,0.28,16,CM(0x2a3a2a,0.35,0.7)); cap.position.set(x,3.14,-2.5); scene.add(cap);
        for(let y=-1,s=0;y<=1;y+=0.65,s++){
            const band=Cy(1.72,1.72,0.09,16,CM(0x0a1610,0.5,0.3,0x00ff88,0.06));
            band.position.set(x,0.25+y,-2.5); scene.add(band);
        }
    });

    // Pump — central, large
    const pump=B(2.3,3.4,2.5,TM(mT,0.6,0.5)); pump.position.set(0,0.2,0.5); scene.add(pump);
    const pTop=B(1.9,0.5,2.1,CM(0x1e2e1e,0.4,0.7)); pTop.position.set(0,1.85,0.5); scene.add(pTop);
    const housing=Cy(0.9,0.9,0.55,14,CM(0x223022,0.35,0.8)); housing.position.set(0,0.9,1.28); housing.rotation.x=Math.PI/2; scene.add(housing);

    const rotorGroup=new THREE.Group();
    for(let i=0;i<4;i++){
        const blade=B(0.11,0.65,0.09,CM(0x00ff88,0.2,0.1,0x00ff44,0.8));
        blade.position.set(Math.cos(i/4*Math.PI*2)*0.38,Math.sin(i/4*Math.PI*2)*0.38,0);
        rotorGroup.add(blade);
    }
    rotorGroup.position.set(0,0.9,1.57); scene.add(rotorGroup);

    const pH=B(11,0.22,0.22,TM(mT,0.4,0.7)); pH.position.set(0,-0.5,-1.5); scene.add(pH);
    const pV=B(0.22,4.2,0.22,TM(mT,0.4,0.7)); pV.position.set(0,1.6,0.5); scene.add(pV);
    [-2.7,2.7].forEach(x=>{
        const j=Cy(0.28,0.28,0.5,8,TM(mT,0.4,0.7)); j.position.set(x,-0.5,-1.5); j.rotation.z=Math.PI/2; scene.add(j);
    });

    const droplets=[];
    for(let i=0;i<12;i++){
        const d=Sp(0.07,5,CM(0x80ffd0,0.1,0,0x00ffaa,0.9));
        d.position.set(-4.5+i*0.8,-0.5,-1.5); scene.add(d); droplets.push(d);
    }

    const {l:s1,t:t1}=mkSpot(0xd0ffe8,580,0.42,0,6.5,1,0,0,0.5); scene.add(s1); scene.add(t1); s1.target=t1;
    const {l:s2,t:t2}=mkSpot(0xd0ffe8,280,0.5,-4,4,4,-1,0,0); scene.add(s2); scene.add(t2); s2.target=t2;
    const pumpL=new THREE.PointLight(0x00ff88,18,6,1.5); pumpL.position.set(0,2,1.5); scene.add(pumpL);
    scene.add(new THREE.AmbientLight(0xffffff,0.25));
    return{rotorGroup,droplets,pumpL};
}

// ── CAM-05 CORRIDOR ───────────────────────────────────────────────
function buildCorridor(scene) {
    const flT=makeCheckerTex('#1c1c1c','#282828',26), wT=makeWallTex('#0d0d0d'), mT=makeMetalTex(), L=30;

    const fl=mk(new THREE.PlaneGeometry(5.5,L),TM(flT,0.92,0.04),false);
    fl.rotation.x=-Math.PI/2; fl.position.set(0,-2.2,-(L/2)+2); fl.receiveShadow=true; scene.add(fl);
    const cl=mk(new THREE.PlaneGeometry(5.5,L),TM(makeWallTex('#060606'),0.97,0),false);
    cl.rotation.x=Math.PI/2; cl.position.set(0,3.5,-(L/2)+2); scene.add(cl);
    const lw=mk(new THREE.PlaneGeometry(L,6),TM(wT,0.93,0.03),false); lw.rotation.y=Math.PI/2; lw.position.set(-2.65,0.6,-(L/2)+2); lw.receiveShadow=true; scene.add(lw);
    const rw=mk(new THREE.PlaneGeometry(L,6),TM(wT,0.93,0.03),false); rw.rotation.y=-Math.PI/2; rw.position.set(2.65,0.6,-(L/2)+2); rw.receiveShadow=true; scene.add(rw);

    for(let z=-2;z>=-28;z-=5){
        const lb=B(0.24,6,0.24,TM(mT,0.7,0.3)); lb.position.set(-2.5,0.8,z); scene.add(lb);
        const rb=B(0.24,6,0.24,TM(mT,0.7,0.3)); rb.position.set( 2.5,0.8,z); scene.add(rb);
        const top=B(5.3,0.2,0.2,TM(mT,0.6,0.4)); top.position.set(0,3.7,z); scene.add(top);
    }

    // Far door
    const frame=B(2.5,4.8,0.3,TM(mT,0.5,0.5)); frame.position.set(0,0.2,-28); scene.add(frame);
    const door=B(2.1,4.4,0.12,CM(0x0a1010,0.7,0.2,0x00ff44,0.05)); door.position.set(0,0.2,-27.9); scene.add(door);

    // Figure
    const figM=CM(0x0a0a0a,0.9,0.1,0x00ff44,0.03);
    const figGrp=new THREE.Group();
    const head=Sp(0.22,8,figM); head.position.set(0,1.68,0); figGrp.add(head);
    const torso=B(0.46,0.95,0.28,figM); torso.position.set(0,0.85,0); figGrp.add(torso);
    const hips=B(0.4,0.32,0.26,figM); hips.position.set(0,0.26,0); figGrp.add(hips);
    [-0.13,0.13].forEach(x=>{
        const leg=B(0.17,0.82,0.21,figM); leg.position.set(x,-0.26,0); figGrp.add(leg);
        const arm=B(0.14,0.78,0.19,figM); arm.position.set(x*2.5,0.76,0); figGrp.add(arm);
    });
    figGrp.position.set(0,-2.2,-6); scene.add(figGrp);

    // Ceiling lights — pools of isolation
    const spots=[];
    for(let z=0;z>=-24;z-=7){
        const fix=B(0.52,0.17,0.52,TM(mT,0.5,0.5)); fix.position.set(0,3.56,z); scene.add(fix);
        const cord=B(0.03,0.72,0.03,CM(0x111111)); cord.position.set(0,3.2,z); scene.add(cord);
        const bulb=Sp(0.14,6,CM(0xffffff,0.1,0,0xd8ffe8,2.8)); bulb.position.set(0,2.86,z); scene.add(bulb);
        const {l,t}=mkSpot(0xd8ffe8,380,0.42,0,2.88,z,0,-2.2,z);
        scene.add(l); scene.add(t); l.target=t; spots.push({l,z});
    }
    scene.add(new THREE.AmbientLight(0xffffff,0.1));
    return{figGrp,spots};
}

// ── Mount ─────────────────────────────────────────────────────────
export function mountCameraFeed(canvas, camIndex) {
    const cam=CAMERAS[camIndex%CAMERAS.length];
    let raf,t=0,destroyed=false;

    const cont=canvas.parentElement;
    const W=cont?.offsetWidth||400;
    const H=Math.round(W*(3/4));
    canvas.width=W; canvas.height=H;

    const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setSize(W,H,false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    renderer.setClearColor(0x020702);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    renderer.physicallyCorrectLights=true;

    const scene=new THREE.Scene();
    scene.fog=new THREE.FogExp2(0x020702,0.042);

    const camera=new THREE.PerspectiveCamera(58,W/H,0.1,45);

    const angles=[
        {pos:[4.2,3.5,5.2], look:[-0.3,0.2,0]},   // reactor
        {pos:[0,2.4,3.0],   look:[0,-1.2,-10]},    // mining
        {pos:[5.2,3,4.2],   look:[-1,-0.8,-1.5]},  // refinery
        {pos:[4.5,3.2,4.5], look:[-0.8,0,-1.2]},   // water
        {pos:[2.1,1.7,1.5], look:[0,-0.6,-10]},    // corridor
    ];
    const a=angles[camIndex%angles.length];
    camera.position.set(...a.pos);
    camera.lookAt(new THREE.Vector3(...a.look));

    let objs={};
    if      (cam.stateKey==='reactor')  objs=buildReactor(scene);
    else if (cam.stateKey==='mining')   objs=buildMining(scene);
    else if (cam.stateKey==='refinery') objs=buildRefinery(scene);
    else if (cam.stateKey==='water')    objs=buildWater(scene);
    else                                objs=buildCorridor(scene);

    const overlay=document.createElement('canvas');
    overlay.width=W; overlay.height=H;
    overlay.style.cssText=`position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;`;
    if(cont) cont.appendChild(overlay);
    const oc=overlay.getContext('2d');

    // Grain
    const gCv=document.createElement('canvas'); gCv.width=gCv.height=128;
    const gCtx=gCv.getContext('2d');
    function refreshGrain(){
        const id=gCtx.createImageData(128,128);
        for(let i=0;i<id.data.length;i+=4){
            const v=Math.random()<0.4?Math.floor(Math.random()*40):0;
            id.data[i]=Math.round(v*0.04);id.data[i+1]=Math.round(v*0.45);id.data[i+2]=Math.round(v*0.18);id.data[i+3]=v*2.5;
        }
        gCtx.putImageData(id,0,0);
    }
    refreshGrain();

    function isOnline(){
        const gs=window._GameState; if(!gs) return true;
        if(cam.stateKey==='reactor')  return gs.reactor?.online??true;
        if(cam.stateKey==='mining')   return gs.mining?.online??true;
        if(cam.stateKey==='refinery') return gs.refinery?.online??true;
        if(cam.stateKey==='water')    return gs.water?.pumpOnline??true;
        return true;
    }

    function animateScene(t){
        const gs=window._GameState, on=isOnline();
        // Reactor
        if(objs.core){
            const temp=gs?.reactor?.temperature||200, heat=Math.min(1,temp/1800);
            const p=0.7+Math.sin(t*0.06)*0.5;
            objs.coreMat.emissiveIntensity=0.8+heat*2.5*p;
            objs.coreMat.emissive.setHex(temp>1200?0xff1100:0x00ff88);
            if(objs.coreL){objs.coreL.color.setHex(temp>1200?0xff3300:0x00ff88);objs.coreL.intensity=18+p*14;}
        }
        // Mining
        if(objs.bucket){
            objs.bucket.position.y=0.5+Math.sin(t*0.013*Math.PI*2)*1.4;
            objs.cable.position.y=objs.bucket.position.y+2.7;
            objs.cable.scale.y=0.4+Math.abs(Math.sin(t*0.013*Math.PI*2))*1.3;
            if(objs.bit&&on){const r=gs?.mining?.ratePerTick||0;objs.bit.rotation.z+=0.04*(1+r*0.3);}
            objs.lights?.forEach(l=>{if(on&&Math.random()<0.005){l.intensity=50;setTimeout(()=>l.intensity=320,85);}});
        }
        // Refinery
        if(objs.items){
            const r=gs?.refinery?.ratePerTick||0, s=on?0.016+r*0.01:0;
            objs.items.forEach(i=>{i.position.x+=s;if(i.position.x>6.7)i.position.x=-6.7;});
            objs.fireLights?.forEach((l,i)=>{l.intensity=on?28+Math.sin(t*0.08+i*1.5)*18:0.5;});
            objs.furnaces?.forEach(({mat},i)=>{mat.emissiveIntensity=on?1.4+Math.sin(t*0.07+i*2.1)*1.0:0.05;});
        }
        // Water
        if(objs.rotorGroup){
            const s=on?0.07+(gs?.water?.upgradeLevel||1)*0.025:0.004;
            objs.rotorGroup.rotation.z+=s;
            objs.droplets?.forEach(d=>{if(on){d.position.x+=0.06;if(d.position.x>4.5)d.position.x=-4.5;}});
            if(objs.pumpL)objs.pumpL.intensity=on?14+Math.sin(t*0.08)*6:0.5;
        }
        // Corridor
        if(objs.figGrp){
            objs.figGrp.position.z=-6-(t*0.017%22);
            if(objs.figGrp.position.z<-26)objs.figGrp.position.z=-6;
            objs.figGrp.position.y=-2.2+Math.abs(Math.sin(t*0.22))*0.05;
            objs.spots?.forEach(({l})=>{if(Math.random()<0.003){l.intensity=60;setTimeout(()=>l.intensity=380,65);}});
        }
    }

    function drawHUD(on){
        oc.clearRect(0,0,W,H);
        if(!on){
            const id=oc.createImageData(W,H);
            for(let i=0;i<id.data.length;i+=4){
                const v=Math.random()<0.4?Math.floor(Math.random()*45):0;
                id.data[i]=Math.round(v*0.03);id.data[i+1]=Math.round(v*0.4);id.data[i+2]=Math.round(v*0.15);id.data[i+3]=200;
            }
            oc.putImageData(id,0,0);
            oc.fillStyle='rgba(0,0,0,0.4)'; oc.fillRect(0,0,W,H);
            oc.font=`bold ${Math.round(H*0.13)}px VT323,monospace`;
            oc.fillStyle='rgba(255,28,28,0.95)'; oc.textAlign='center';
            oc.fillText('NO SIGNAL',W/2,H/2+4);
            oc.font=`${Math.round(H*0.07)}px VT323,monospace`;
            oc.fillStyle='rgba(255,28,28,0.5)';
            oc.fillText('FEED LOST',W/2,H/2+H*0.14); oc.textAlign='left';
        }
        if(t%3===0) refreshGrain();
        const pat=oc.createPattern(gCv,'repeat');
        if(pat){oc.fillStyle=pat;oc.globalAlpha=0.18;oc.fillRect(0,0,W,H);oc.globalAlpha=1;}
        for(let y=0;y<H;y+=2){oc.fillStyle='rgba(0,0,0,0.14)';oc.fillRect(0,y,W,1);}
        const vg=oc.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.min(W,H)*0.82);
        vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,3,1,0.55)');
        oc.fillStyle=vg; oc.fillRect(0,0,W,H);
        if(Math.random()<0.007){oc.fillStyle=`rgba(20,253,206,${Math.random()*0.13})`;oc.fillRect(0,Math.floor(Math.random()*H),W,1+Math.floor(Math.random()*2));}
        // HUD text — fixed small size
        const fs=12;
        oc.font=`${fs}px VT323,monospace`;
        const now=new Date();
        const ts=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        const ds=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        oc.fillStyle='rgba(20,253,206,0.9)'; oc.fillText(cam.id,5,fs+4);
        oc.fillStyle='rgba(20,253,206,0.58)'; oc.fillText(cam.label,5,fs*2+5);
        oc.textAlign='right';
        oc.fillStyle='rgba(20,253,206,0.82)'; oc.fillText(ts,W-5,fs+4);
        oc.fillStyle='rgba(20,253,206,0.44)'; oc.fillText(ds,W-5,fs*2+5);
        oc.textAlign='left';
        oc.fillStyle='rgba(20,253,206,0.28)'; oc.font='10px VT323,monospace';
        oc.fillText('VAULT 84 // VOLTEC SECURITY',5,H-5);
        if(on&&Math.floor(t/28)%2===0){
            oc.fillStyle='#ff2222'; oc.beginPath(); oc.arc(W-16,H-11,4,0,Math.PI*2); oc.fill();
            oc.fillStyle='rgba(255,34,34,0.85)'; oc.font='10px VT323,monospace';
            oc.textAlign='right'; oc.fillText('● REC',W-4,H-5); oc.textAlign='left';
        }
        const br=10; oc.strokeStyle='rgba(20,253,206,0.5)'; oc.lineWidth=1.5;
        [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([x,y,sx,sy])=>{
            oc.beginPath(); oc.moveTo(x+sx*br,y); oc.lineTo(x,y); oc.lineTo(x,y+sy*br); oc.stroke();
        });
    }

    function loop(){
        if(destroyed)return; t++;
        const on=isOnline();
        if(on)animateScene(t);
        renderer.render(scene,camera);
        drawHUD(on);
        raf=requestAnimationFrame(loop);
    }
    loop();

    return{cam,destroy(){destroyed=true;cancelAnimationFrame(raf);renderer.dispose();overlay?.remove();}};
}

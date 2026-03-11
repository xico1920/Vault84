// ProceduralModels.js
// Modelos 3D lowpoly gerados proceduralmente com Three.js para cada departamento.
// Sem ficheiros externos — tudo geometria primitiva composta.

function wireMat(color = 0x14fdce, opacity = 0.85) {
    return new THREE.MeshBasicMaterial({
        color, wireframe: true, transparent: true, opacity, side: THREE.DoubleSide
    });
}

function solidMat(color = 0x031e11) {
    return new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
}

function addMesh(scene, geo, mat, x=0, y=0, z=0, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    scene.add(m);
    return m;
}

// ── REACTOR CORE ──────────────────────────────────────────────────────────────
export function buildReactor(scene) {
    const group = new THREE.Group();
    const mat = wireMat(0x14fdce, 0.9);
    const dimMat = wireMat(0x0a7a50, 0.5);

    // Core sphere (icosahedron = lowpoly)
    group.add(Object.assign(new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat)));

    // Outer ring 1
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.04, 4, 16), mat);
    ring1.rotation.x = Math.PI / 2;
    group.add(ring1);

    // Outer ring 2 (tilted)
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.04, 4, 16), dimMat);
    ring2.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // 4 vertical pillars
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 4), dimMat);
        pillar.position.set(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0);
        group.add(pillar);
    }

    // Top/bottom caps
    const capMat = wireMat(0x14fdce, 0.5);
    const capT = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 6), capMat);
    capT.position.y = 1.0;
    group.add(capT);
    const capB = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 6), capMat);
    capB.position.y = -1.0;
    capB.rotation.z = Math.PI;
    group.add(capB);

    scene.add(group);
    return group;
}

// ── MINING SHAFT ──────────────────────────────────────────────────────────────
export function buildMiningShaft(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.45);

    // Shaft opening (octagonal tube section)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.0, 8, 1, true), mat);
    shaft.position.y = -0.2;
    group.add(shaft);

    // Support frame top
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 4, 8), mat);
    frame.position.y = 0.8;
    frame.rotation.x = Math.PI / 2;
    group.add(frame);

    // A-frame supports (2 diagonal beams each side)
    for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 2; i++) {
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 4), dimMat);
            beam.position.set(s * 0.55, 0.1, (i - 0.5) * 0.4);
            beam.rotation.z = s * 0.4;
            group.add(beam);
        }
    }

    // Drill bit at bottom
    const drill = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 6), mat);
    drill.position.y = -1.25;
    drill.rotation.z = Math.PI;
    group.add(drill);

    // Ore chunks floating around
    [-0.9, 0.9].forEach((xp, i) => {
        const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), wireMat(0xd4e800, 0.7));
        ore.position.set(xp, -0.3 + i * 0.3, 0.6);
        group.add(ore);
    });

    scene.add(group);
    return group;
}

// ── ORE REFINERY ──────────────────────────────────────────────────────────────
export function buildRefinery(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.45);
    const hotMat = wireMat(0xff8800, 0.6);

    // Main furnace body (box)
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.7), mat);
    body.position.y = 0.0;
    group.add(body);

    // Chimney stacks
    [[-0.25, 0], [0.25, 0]].forEach(([xp, _]) => {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 6), dimMat);
        stack.position.set(xp, 1.0, 0);
        group.add(stack);
        // smoke ring
        const smoke = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 4, 8), wireMat(0x14fdce, 0.3));
        smoke.position.set(xp, 1.55, 0);
        smoke.rotation.x = Math.PI / 2;
        group.add(smoke);
    });

    // Furnace door (hot)
    const door = new THREE.Mesh(new THREE.CircleGeometry(0.22, 8), hotMat);
    door.position.set(0, 0.0, 0.36);
    group.add(door);

    // Input conveyor
    const conv = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.25), dimMat);
    conv.position.set(-0.9, -0.3, 0);
    conv.rotation.z = 0.3;
    group.add(conv);

    // Output tray
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.25), wireMat(0xd4e800, 0.6));
    tray.position.set(0.85, -0.55, 0);
    tray.rotation.z = -0.2;
    group.add(tray);

    // Base platform
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.9), dimMat);
    base.position.y = -0.76;
    group.add(base);

    scene.add(group);
    return group;
}

// ── WATER TREATMENT ───────────────────────────────────────────────────────────
export function buildWaterTreatment(scene) {
    const group = new THREE.Group();
    const mat     = wireMat(0x14fdce, 0.85);
    const dimMat  = wireMat(0x0a7a50, 0.45);
    const blueMat = wireMat(0x00aaff, 0.55);

    // Main tank (cylinder)
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 10, 1, true), mat);
    tank.position.y = 0.1;
    group.add(tank);

    // Tank caps
    const capT = new THREE.Mesh(new THREE.CircleGeometry(0.7, 10), dimMat);
    capT.position.y = 0.8;
    capT.rotation.x = -Math.PI / 2;
    group.add(capT);

    // Water level inside (blue torus near bottom)
    const water = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 4, 10), blueMat);
    water.position.y = -0.2;
    water.rotation.x = Math.PI / 2;
    group.add(water);

    // Pump on side
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), dimMat);
    pump.position.set(0.9, -0.3, 0);
    group.add(pump);

    // Pipes
    const pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6), mat);
    pipeH.rotation.z = Math.PI / 2;
    pipeH.position.set(0.57, -0.3, 0);
    group.add(pipeH);

    const pipeV = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), mat);
    pipeV.position.set(-0.85, 0.0, 0);
    group.add(pipeV);

    const pipeOut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), mat);
    pipeOut.rotation.z = Math.PI / 2;
    pipeOut.position.set(-1.1, -0.6, 0);
    group.add(pipeOut);

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.9), dimMat);
    base.position.y = -0.75;
    group.add(base);

    scene.add(group);
    return group;
}

// ── SSM (SMART STORAGE) ───────────────────────────────────────────────────────
export function buildSSM(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.45);
    const oreMat = wireMat(0xd4e800, 0.65);

    // Server rack / shelving unit
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.5), dimMat);
    group.add(rack);

    // Shelf dividers
    for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.45), mat);
        shelf.position.y = -0.7 + i * 0.5;
        group.add(shelf);
    }

    // Ore blocks on shelves (3 per shelf, 2 shelves)
    [[0, -0.55], [1, -0.05]].forEach(([si, sy]) => {
        for (let xi = 0; xi < 3; xi++) {
            const ore = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.3), xi < 2 ? oreMat : mat);
            ore.position.set(-0.45 + xi * 0.45, sy, 0.08);
            group.add(ore);
        }
    });

    // Side frame columns
    [-0.82, 0.82].forEach(xp => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.85, 0.08), mat);
        col.position.set(xp, 0, 0.24);
        group.add(col);
    });

    scene.add(group);
    return group;
}

// ── SECURITY ──────────────────────────────────────────────────────────────────
export function buildSecurity(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.45);
    const redMat = wireMat(0xff2222, 0.6);

    // Main terminal screen (angled)
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.08), mat);
    screen.rotation.x = -0.25;
    screen.position.y = 0.3;
    group.add(screen);

    // Screen scanline (inner rectangle)
    const inner = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.01), dimMat);
    inner.rotation.x = -0.25;
    inner.position.set(0, 0.3, 0.045);
    group.add(inner);

    // Alert indicator (red diamond)
    const alert = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), redMat);
    alert.position.set(0.7, 0.8, 0);
    group.add(alert);

    // Keyboard/console base
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.5), dimMat);
    keyboard.rotation.x = 0.15;
    keyboard.position.set(0, -0.25, 0.25);
    group.add(keyboard);

    // Stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), dimMat);
    stand.position.y = -0.4;
    group.add(stand);

    // Base plate
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.5), mat);
    base.position.y = -0.72;
    group.add(base);

    // Camera/sensor orb on top
    const sensor = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), wireMat(0xff8800, 0.7));
    sensor.position.set(-0.5, 0.8, 0.05);
    group.add(sensor);

    group.userData.virusNodes = []; // will be filled by mountDeptModel
    scene.add(group);
    return group;
}

// ── WORKSHOP ──────────────────────────────────────────────────────────────────
export function buildWorkshop(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.45);
    const hotMat = wireMat(0xff8800, 0.55);

    // Workbench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.7), mat);
    bench.position.y = -0.1;
    group.add(bench);

    // Bench legs
    [[-0.8, -0.32], [0.8, -0.32], [-0.8, 0.32], [0.8, 0.32]].forEach(([xp, zp]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 4), dimMat);
        leg.position.set(xp, -0.52, zp);
        group.add(leg);
    });

    // Tool rack on back
    const rack = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.8, 0.06), dimMat);
    rack.position.set(0, 0.45, -0.33);
    group.add(rack);

    // Tools hanging (simple shapes)
    const wrench = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 4, 8), mat);
    wrench.position.set(-0.5, 0.5, -0.3);
    group.add(wrench);

    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), mat);
    hammer.position.set(-0.1, 0.45, -0.3);
    group.add(hammer);

    // Object being worked on (gear-ish shape)
    const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8), hotMat);
    gear.position.set(0.4, -0.02, 0.05);
    gear.rotation.x = Math.PI / 2;
    group.add(gear);

    // Sparks (small icosa)
    const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), hotMat);
    spark.position.set(0.55, 0.1, 0.1);
    group.add(spark);

    scene.add(group);
    return group;
}

// ── STATUS (VAULT OVERVIEW) ───────────────────────────────────────────────────
export function buildVaultOverview(scene) {
    const group  = new THREE.Group();
    const bright = wireMat(0x14fdce, 0.90);
    const mid    = wireMat(0x0dbb98, 0.65);
    const dim    = wireMat(0x0a7a50, 0.40);
    const accent = wireMat(0x1affee, 1.00);

    // ── Tunnel wall — square frame receding into distance ─────
    for (let i = 0; i < 4; i++) {
        const depth = -i * 0.28;
        const size  = 2.5 + i * 0.06;
        const ring  = new THREE.Mesh(new THREE.TorusGeometry(size * 0.5, 0.04, 4, 4), dim);
        ring.rotation.z = Math.PI / 4; // rotate square 45° → diamond→ square
        ring.rotation.x = 0;
        ring.position.z = depth;
        group.add(ring);
    }

    // ── Wall mount frame — thick rect bolted to tunnel ────────
    const wallFrame = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 2.6, 0.12),
        dim
    );
    wallFrame.position.z = -0.30;
    // Cut out the center — simulate with just the border using 4 bars
    ['h','h','v','v'].forEach((dir, i) => {
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(dir==='h' ? 2.6 : 0.14, dir==='h' ? 0.14 : 2.6, 0.10),
            mid
        );
        bar.position.set(
            dir==='v' ? (i===2 ? -1.23 : 1.23) : 0,
            dir==='h' ? (i===0 ? -1.23 : 1.23) : 0,
            -0.28
        );
        group.add(bar);
    });

    // Bolts at corners of wall frame
    for (let i = 0; i < 4; i++) {
        const bx = (i % 2 === 0 ? -1 : 1) * 1.1;
        const by = (i < 2 ? -1 : 1) * 1.1;
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6), mid);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(bx, by, -0.24);
        group.add(bolt);
    }

    // ── Door body — thick cylinder, like a bank vault ─────────
    const doorBody = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.32, 64),
        mid
    );
    doorBody.rotation.x = Math.PI / 2;
    doorBody.position.z = -0.02;
    group.add(doorBody);

    // Door face — slightly forward
    const doorFace = new THREE.Mesh(
        new THREE.CylinderGeometry(1.02, 1.02, 0.04, 64),
        bright
    );
    doorFace.rotation.x = Math.PI / 2;
    doorFace.position.z = 0.17;
    group.add(doorFace);

    // ── Locking bolt ring — 8 thick rectangular bolts ─────────
    // These are the bolts that slide out and lock into the wall
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const bolt = new THREE.Mesh(
            new THREE.BoxGeometry(0.10, 0.28, 0.20),
            bright
        );
        bolt.position.set(
            Math.cos(a) * 1.12,
            Math.sin(a) * 1.12,
            0.0
        );
        bolt.rotation.z = a;
        group.add(bolt);
    }

    // ── Outer gear ring — teeth around the door edge ──────────
    for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const tooth = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.14, 0.10),
            mid
        );
        tooth.position.set(Math.cos(a) * 1.14, Math.sin(a) * 1.14, 0.10);
        tooth.rotation.z = a;
        group.add(tooth);
    }

    // ── Inner structural rings ─────────────────────────────────
    [0.82, 0.60, 0.40].forEach((r, i) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.025, 6, 48),
            i === 0 ? bright : dim
        );
        ring.position.z = 0.18;
        group.add(ring);
    });

    // ── Radial spokes — 6 structural ribs ─────────────────────
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.78, 0.04),
            dim
        );
        spoke.position.set(0, 0, 0.18);
        spoke.rotation.z = a;
        group.add(spoke);
    }

    // ── Central wheel / handle ─────────────────────────────────
    // Hub disc
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), bright);
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.23;
    group.add(hub);

    // Handle spokes (4) — like a ship wheel
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.30, 0.045), accent);
        handle.position.set(0, 0, 0.24);
        handle.rotation.z = a;
        group.add(handle);
        // Handle grip at end
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 6), accent);
        grip.rotation.x = Math.PI / 2;
        grip.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.24);
        group.add(grip);
    }

    // Hub center cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8), accent);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.27;
    group.add(cap);

    // ── "84" engraved on door face ─────────────────────────────
    // Simple pixel-style digits using small boxes
    const px = wireMat(0x1affee, 0.95);
    function dot(x, y) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.03), px);
        d.position.set(x, y, 0.20);
        group.add(d);
    }
    // "8" — 3×5 pixel grid approx, left digit
    const eightPixels = [
        [0,1],[1,1],       // top
        [0,0],      [1,0], // mid gaps
        [0,-1],[1,-1],     // middle bar... simplified:
    ];
    // Simplified "8" using outline boxes
    [[-0.31, 0.19],[-0.21,0.19],[-0.31,0.00],[-0.21,0.00],[-0.31,-0.19],[-0.21,-0.19],
     [-0.31,0.09],[-0.31,-0.09],[-0.21,0.09],[-0.21,-0.09]
    ].forEach(([x,y]) => dot(x,y));

    // "4"
    [[-0.02,0.19],[-0.02,0.00],[0.08,0.00],[0.08,0.19],[0.08,-0.19],[0.08,-0.09]
    ].forEach(([x,y]) => dot(x,y));

    // Store wheel ref for animation
    group.userData.wheel = hub;
    group.userData.wheelParts = group.children.filter(c => c.position.z > 0.20);

    scene.add(group);
    return group;
}

// ── SETTINGS — fixed gear mesh, all in XZ plane ───────────────────────────────
export function buildSettings(scene) {
    const group = new THREE.Group();
    const mat    = wireMat(0x14fdce, 0.85);
    const dimMat = wireMat(0x0a7a50, 0.55);

    // Gears are vertical discs in the XY plane — cylinder axis along Z
    function makeGear(radius, teeth, thickness, cx, cy) {
        const g = new THREE.Group();
        // Disc body — vertical, axis along Z
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 28), mat);
        disc.rotation.x = Math.PI / 2; // stand upright
        g.add(disc);
        // Teeth around the XY perimeter
        for (let i = 0; i < teeth; i++) {
            const a = (i / teeth) * Math.PI * 2;
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.22, radius * 0.26, thickness * 1.1), mat);
            tooth.position.set(Math.cos(a) * (radius + radius * 0.11), Math.sin(a) * (radius + radius * 0.11), 0);
            tooth.rotation.z = a;
            g.add(tooth);
        }
        // Center hub
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, thickness * 1.4, 8), dimMat);
        hub.rotation.x = Math.PI / 2;
        g.add(hub);
        g.position.set(cx, cy, 0);
        return g;
    }

    const big   = makeGear(0.72, 12, 0.14,  0,    0);
    const small = makeGear(0.32, 7,  0.12,  1.06, 0.62);

    group.userData.bigGear   = big;
    group.userData.smallGear = small;
    group.add(big);
    group.add(small);
    // No tilt — gears face camera straight on

    scene.add(group);
    return group;
}

// ── FACTORY ───────────────────────────────────────────────────────────────────
// Retorna a função de build correta para cada departamento
export function getModelBuilder(department) {
    const map = {
        status:           buildVaultOverview,
        reactorcore:      buildReactor,
        miningshaft:      buildMiningShaft,
        orerefinery:      buildRefinery,
        watertreatment:   buildWaterTreatment,
        smartstorageunit: buildSSM,
        security:         buildSecurity,
        workshop:         buildWorkshop,
        settings:         buildSettings,
    };
    return map[department] || buildVaultOverview;
}

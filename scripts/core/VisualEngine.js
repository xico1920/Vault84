// VisualEngine.js — canvas animations for all visual elements

// ── OSCILLOSCOPE ─────────────────────────────────────────────────
export function mountOscilloscope(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    let raf, history = new Array(120).fill(0), t = 0, destroyed = false;

    function resize() {
        cv.width  = cv.offsetWidth  || 200;
        cv.height = cv.offsetHeight || 40;
    }
    resize();

    function draw(power, maxPower, upgradeLevel) {
        if (destroyed) return;
        resize();
        const W = cv.width, H = cv.height;
        const norm = maxPower > 0 ? Math.min(1, power / maxPower) : 0;
        const lvl  = upgradeLevel || 1;

        // Push new sample — noise amplitude scales with upgrade level
        const noise = (Math.random() - 0.5) * (0.02 + lvl * 0.015);
        history.push(Math.max(0, Math.min(1, norm + noise)));
        if (history.length > W) history.shift();

        ctx.clearRect(0, 0, W, H);

        // Background grid
        ctx.strokeStyle = 'rgba(20,253,206,0.06)';
        ctx.lineWidth = 1;
        for (let y = 0; y <= 4; y++) {
            ctx.beginPath(); ctx.moveTo(0, (y/4)*H); ctx.lineTo(W, (y/4)*H); ctx.stroke();
        }
        for (let x = 0; x <= 8; x++) {
            ctx.beginPath(); ctx.moveTo((x/8)*W, 0); ctx.lineTo((x/8)*W, H); ctx.stroke();
        }

        // Signal line — always UI green
        const col = '#14fdce';
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = col;
        ctx.shadowBlur = 4;
        history.forEach((v, i) => {
            const x = (i / history.length) * W;
            const y = H - v * (H * 0.85) - H * 0.05;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flatline effect when offline
        if (norm === 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(20,253,206,0.3)';
            ctx.lineWidth = 1;
            ctx.shadowColor = '#14fdce';
            ctx.shadowBlur = 2;
            ctx.moveTo(0, H/2); ctx.lineTo(W, H/2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function loop() {
        if (destroyed) return;
        t++;
        const r = window._GameState?.reactor;
        const power   = r ? r.powerGW * r.efficiency : 0;
        const maxP    = r ? r.powerGW : 1;
        const lvl     = r ? r.upgradeLevel : 1;
        draw(power, maxP, lvl);
        raf = setTimeout(() => requestAnimationFrame(loop), 100); // ~10fps
    }
    loop();

    return { destroy() { destroyed = true; clearTimeout(raf); } };
}

// ── MINING SHAFT VISUALIZER — maze with moving squares ──────────
export function mountMiningVisualizer(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    let raf, destroyed = false;

    const COLS = 20, ROWS = 13, CELL = 14;
    const W = COLS * CELL, H = ROWS * CELL;
    cv.width = W; cv.height = H;
    cv.style.width = '100%'; cv.style.height = 'auto';

    // Build tunnel maze — 1 = tunnel, 0 = rock
    const grid = Array.from({length: ROWS}, () => new Array(COLS).fill(0));

    // Carve horizontal and vertical corridors
    const hLines = [2, 5, 8, 11];
    const vLines = [2, 6, 10, 14, 18];
    hLines.forEach(r => { for (let c = 0; c < COLS; c++) grid[r][c] = 1; });
    vLines.forEach(c => { for (let r = 0; r < ROWS; r++) grid[r][c] = 1; });
    // Entry shaft on left, exit on right
    for (let r = 0; r < ROWS; r++) { grid[r][0] = 1; grid[r][COLS-1] = 1; }

    // Precompute all tunnel cells and their valid neighbors
    function neighbors(r, c) {
        return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
            .filter(([nr,nc]) => nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&grid[nr][nc]===1);
    }

    // Particles — small squares navigating the maze
        const particles = [];

    function spawnParticle(speed = 0.05) {
        const startCells = hLines.map(r => ({r, c: 0}));
        const s = startCells[Math.floor(Math.random() * startCells.length)];
        particles.push({
            r: s.r, c: s.c,
            pr: s.r, pc: s.c,
            progress: 0,
            speed: speed * (0.8 + Math.random() * 0.4),
            targetR: s.r, targetC: s.c + 1,
            trail: [],
            life: 1.0,
            size: Math.random() > 0.5 ? 3 : 2,
        });
    }

    function stepParticle(p) {
        p.progress += p.speed;
        if (p.progress >= 1) {
            p.progress -= 1;
            p.pr = p.r; p.pc = p.c;
            p.r  = p.targetR; p.c = p.targetC;

            // Trail
            p.trail.unshift({r: p.pr, c: p.pc});
            if (p.trail.length > 4) p.trail.pop();

            // Reached right edge → die
            if (p.c >= COLS - 1) { p.life = 0; return; }

            // Choose next cell — prefer going right, avoid going back
            const ns = neighbors(p.r, p.c).filter(([nr,nc]) => !(nr===p.pr&&nc===p.pc));
            if (ns.length === 0) { p.life = 0; return; }
            const weighted = [];
            ns.forEach(([nr,nc]) => {
                const w = nc > p.c ? 3 : 1;
                for (let i = 0; i < w; i++) weighted.push([nr,nc]);
            });
            const [nr,nc] = weighted[Math.floor(Math.random() * weighted.length)];
            p.targetR = nr; p.targetC = nc;
        }
    }

    function draw() {
        if (destroyed) return;

        const active   = window._GameState?.mining?.online && (window._GameState?.reactor?.efficiency || 0) > 0;
        const rate     = window._GameState?.mining?.ratePerTick || 0;
        const level    = window._GameState?.mining?.upgradeLevel || 1;
        const eff      = window._GameState?.reactor?.efficiency  || 0;
        const intensity = active ? Math.min(1, (eff * level) / 5) : 0;
        const maxP      = Math.round(4 + intensity * 24);   // 4 → 28 particles
        const spawnRate = 0.02 + intensity * 0.18;           // slow trickle → flood
        const speed     = 0.025 + intensity * 0.075;         // slow → fast

        ctx.fillStyle = '#020f07';
        ctx.fillRect(0, 0, W, H);

        // Draw rock/tunnel grid
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] === 0) {
                    ctx.fillStyle = '#040f08';
                    ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
                    // Rock texture dots
                    ctx.fillStyle = 'rgba(20,253,206,0.04)';
                    if ((r*COLS+c) % 7 === 0) ctx.fillRect(c*CELL+4, r*CELL+4, 2, 2);
                    if ((r*COLS+c) % 11 === 0) ctx.fillRect(c*CELL+9, r*CELL+2, 1, 1);
                } else {
                    // Tunnel — dim floor
                    ctx.fillStyle = 'rgba(20,253,206,0.03)';
                    ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
                }
            }
        }

        // Tunnel walls outline
        ctx.strokeStyle = 'rgba(20,253,206,0.12)';
        ctx.lineWidth = 0.5;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] === 1) {
                    ctx.strokeRect(c*CELL+0.5, r*CELL+0.5, CELL-1, CELL-1);
                }
            }
        }

        // Spawn particles
        if (active && particles.length < maxP && Math.random() < spawnRate) {
            spawnParticle(speed);
        }

        // Update + draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            if (!active) { p.life -= 0.02; }
            if (p.life <= 0) { particles.splice(i, 1); continue; }

            stepParticle(p);

            // Eased progress for smooth motion
            const t = p.progress < 0.5
                ? 2 * p.progress * p.progress
                : 1 - Math.pow(-2 * p.progress + 2, 2) / 2;

            // Pixel position — lerp from current cell toward target
            const fromX = p.c  * CELL + CELL / 2;
            const fromY = p.r  * CELL + CELL / 2;
            const toX   = p.targetC * CELL + CELL / 2;
            const toY   = p.targetR * CELL + CELL / 2;
            const px    = fromX + (toX - fromX) * t;
            const py    = fromY + (toY - fromY) * t;

            // Draw trail as fading dots along the path
            p.trail.forEach((tr, ti) => {
                const a = (1 - (ti + 1) / (p.trail.length + 1)) * 0.3 * p.life;
                ctx.fillStyle = `rgba(20,253,206,${a})`;
                ctx.fillRect(
                    tr.c * CELL + (CELL - p.size) / 2,
                    tr.r * CELL + (CELL - p.size) / 2,
                    p.size, p.size
                );
            });

            // Draw particle
            ctx.fillStyle = `rgba(20,253,206,${p.life})`;
            ctx.shadowColor = '#14fdce';
            ctx.shadowBlur = 5;
            ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
            ctx.shadowBlur = 0;
        }

        // Labels
        ctx.fillStyle = 'rgba(20,253,206,0.3)';
        ctx.font = '8px VT323, monospace';
        ctx.fillText('ENTRY', 1, H - 3);
        ctx.textAlign = 'right';
        ctx.fillText('EXIT', W - 1, H - 3);
        ctx.textAlign = 'left';

        if (!active) {
            ctx.fillStyle = 'rgba(2,15,7,0.6)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(20,253,206,0.4)';
            ctx.font = '11px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('[ SHAFT OFFLINE ]', W/2, H/2);
            ctx.textAlign = 'left';
        }

        raf = requestAnimationFrame(draw);
    }
    draw();

    return { destroy() { destroyed = true; cancelAnimationFrame(raf); } };
}

// ── REACTOR HEATMAP ───────────────────────────────────────────────
export function mountReactorHeatmap(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    let raf, t = 0, destroyed = false;

    const COLS = 16, ROWS = 10;
    cv.width  = COLS * 20;
    cv.height = ROWS * 20;
    cv.style.width = '100%'; cv.style.height = 'auto';

    // Grid of fuel rods with individual heat values
    const cells = Array.from({length: ROWS}, (_, r) =>
        Array.from({length: COLS}, (_, c) => ({
            heat: 0.2 + Math.random() * 0.3,
            base: 0.2 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2,
            isFuel: Math.random() > 0.15,
        }))
    );

    function tempToColor(norm, alpha = 1) {
        // Only UI green #14fdce — intensity scales with temperature
        const intensity = 0.08 + norm * 0.92;
        return `rgba(${Math.round(20 * intensity)},${Math.round(253 * intensity)},${Math.round(206 * intensity)},${alpha})`;
    }

    function draw() {
        if (destroyed) return;
        t++;

        const r      = window._GameState?.reactor;
        const temp   = r?.temperature  || 200;
        const online = r?.online       ?? true;
        const maxT   = 1800;
        const normT  = Math.min(1, temp / maxT);

        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = '#010a04';
        ctx.fillRect(0, 0, cv.width, cv.height);

        const CW = cv.width / COLS, CH = cv.height / ROWS;

        cells.forEach((row, ri) => {
            row.forEach((cell, ci) => {
                if (!cell.isFuel) {
                    // Control rod — always dark
                    ctx.fillStyle = '#0a1a0f';
                    ctx.fillRect(ci*CW+1, ri*CH+1, CW-2, CH-2);
                    ctx.fillStyle = 'rgba(20,253,206,0.15)';
                    ctx.fillRect(ci*CW+CW/2-1, ri*CH+2, 2, CH-4);
                    return;
                }

                // Animate cell heat toward global temp + local variation
                cell.phase += 0.03;
                const localVar  = Math.sin(cell.phase) * 0.06;
                const target    = online ? normT * cell.base * 2.5 + localVar : 0.05;
                cell.heat += (target - cell.heat) * 0.08;
                cell.heat  = Math.max(0, Math.min(1, cell.heat));

                const col   = tempToColor(cell.heat);
                const glow  = tempToColor(cell.heat, 0.3);

                ctx.fillStyle = glow;
                ctx.fillRect(ci*CW, ri*CH, CW, CH);
                ctx.fillStyle = col;
                ctx.fillRect(ci*CW+2, ri*CH+2, CW-4, CH-4);

                // Pulsing core glow for hot cells
                if (cell.heat > 0.6) {
                    ctx.fillStyle = tempToColor(cell.heat, (cell.heat - 0.6) * 0.5 * (0.8 + Math.sin(cell.phase*2)*0.2));
                    ctx.fillRect(ci*CW+4, ri*CH+4, CW-8, CH-8);
                }
            });
        });

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c*CW, 0); ctx.lineTo(c*CW, cv.height); ctx.stroke(); }
        for (let r2 = 0; r2 <= ROWS; r2++) { ctx.beginPath(); ctx.moveTo(0, r2*CH); ctx.lineTo(cv.width, r2*CH); ctx.stroke(); }

        // Offline overlay
        if (!online) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.fillStyle = '#3d9970';
            ctx.font = `${Math.round(CW*1.4)}px VT323, monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('REACTOR OFFLINE', cv.width/2, cv.height/2);
            ctx.textAlign = 'left';
        }

        // Critical flash
        if (normT > 0.85 && online && Math.sin(t * 0.2) > 0.7) {
            ctx.fillStyle = 'rgba(255,34,34,0.08)';
            ctx.fillRect(0, 0, cv.width, cv.height);
        }

        raf = requestAnimationFrame(draw);
    }
    draw();

    return { destroy() { destroyed = true; cancelAnimationFrame(raf); } };
}

// ── VAULT MAP ─────────────────────────────────────────────────────
export function mountVaultMap(canvasId) {
    const cv = document.getElementById(canvasId);
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    let raf, t = 0, destroyed = false;

    const W = 400, H = 260;
    cv.width = W; cv.height = H;
    cv.style.width = '100%'; cv.style.height = 'auto';

    // Room layout — [x, y, w, h, label, stateKey]
    const rooms = [
        { x: 10,  y: 60,  w: 70, h: 50, label: 'REACTOR',  key: 'reactor',  col: () => window._GameState?.reactor?.online  ? '#14fdce' : '#555' },
        { x: 100, y: 10,  w: 70, h: 50, label: 'WATER',    key: 'water',    col: () => window._GameState?.water?.pumpOnline ? '#14fdce' : '#555' },
        { x: 190, y: 10,  w: 70, h: 50, label: 'MINING',   key: 'mining',   col: () => window._GameState?.mining?.online    ? '#d4e800' : '#555' },
        { x: 280, y: 10,  w: 70, h: 50, label: 'REFINERY', key: 'refinery', col: () => window._GameState?.refinery?.online  ? '#ff8800' : '#555' },
        { x: 100, y: 100, w: 70, h: 50, label: 'SECURITY', key: 'security', col: () => (window._GameState?.security?.threats?.length || 0) > 0 ? '#ff2222' : '#14fdce' },
        { x: 190, y: 100, w: 70, h: 50, label: 'WORKSHOP', key: 'workshop', col: () => '#14fdce' },
        { x: 280, y: 100, w: 70, h: 50, label: 'STORAGE',  key: 'ssm',      col: () => '#14fdce' },
        { x: 150, y: 185, w: 100,h: 50, label: 'CONTROL',  key: 'control',  col: () => '#14fdce' },
    ];

    // Corridors between rooms [from_index, to_index]
    const corridors = [
        [0, 1], [1, 2], [2, 3],
        [1, 4], [2, 5], [3, 6],
        [4, 7], [5, 7], [6, 7],
    ];

    // Flow particles along corridors
    const flowParticles = corridors.map(([a, b]) => ({
        a, b, progress: Math.random(), speed: 0.003 + Math.random() * 0.004
    }));

    function roomCenter(r) {
        return { x: r.x + r.w/2, y: r.y + r.h/2 };
    }

    function draw() {
        if (destroyed) return;
        t++;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#020f07';
        ctx.fillRect(0, 0, W, H);

        // Draw corridors
        corridors.forEach(([ai, bi]) => {
            const ra = rooms[ai], rb = rooms[bi];
            const ca = roomCenter(ra), cb = roomCenter(rb);
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(20,253,206,0.15)';
            ctx.lineWidth = 4;
            ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y);
            ctx.stroke();
        });

        // Flow particles
        flowParticles.forEach(p => {
            const ra = rooms[p.a], rb = rooms[p.b];
            const ca = roomCenter(ra), cb = roomCenter(rb);
            const active = ra.col() !== '#555' && rb.col() !== '#555';

            if (active) {
                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;
            }

            const px = ca.x + (cb.x - ca.x) * p.progress;
            const py = ca.y + (cb.y - ca.y) * p.progress;
            const col = active ? ra.col() : 'rgba(80,80,80,0.3)';

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = active ? 6 : 0;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw rooms
        rooms.forEach((r, i) => {
            const col   = r.col();
            const pulse = 0.7 + Math.sin(t * 0.05 + i) * 0.3;

            // Room background
            ctx.fillStyle = `rgba(2,15,7,0.9)`;
            ctx.fillRect(r.x, r.y, r.w, r.h);

            // Room border
            ctx.strokeStyle = col === '#555' ? '#1a3a22' : col;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = col === '#555' ? 0.4 : pulse;
            ctx.strokeRect(r.x, r.y, r.w, r.h);
            ctx.globalAlpha = 1;

            // Status dot
            ctx.beginPath();
            ctx.arc(r.x + r.w - 8, r.y + 8, 3, 0, Math.PI * 2);
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = col !== '#555' ? 6 : 0;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = col === '#555' ? '#2a5a33' : col;
            ctx.font = '9px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(r.label, r.x + r.w/2, r.y + r.h/2 + 3);
            ctx.textAlign = 'left';
        });

        // Vault header
        ctx.fillStyle = 'rgba(20,253,206,0.4)';
        ctx.font = '11px VT323, monospace';
        ctx.fillText('VAULT 84 — FACILITY MAP', 10, H - 8);

        // Threat count
        const threats = window._GameState?.security?.threats?.length || 0;
        if (threats > 0) {
            ctx.fillStyle = Math.sin(t*0.15) > 0 ? '#ff2222' : 'transparent';
            ctx.font = '11px VT323, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`⚠ ${threats} THREAT${threats > 1 ? 'S' : ''}`, W - 10, H - 8);
            ctx.textAlign = 'left';
        }

        raf = requestAnimationFrame(draw);
    }
    draw();

    return { destroy() { destroyed = true; cancelAnimationFrame(raf); } };
}

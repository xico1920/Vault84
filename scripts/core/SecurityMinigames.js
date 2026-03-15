// SecurityMinigames.js — Three canvas-based minigames for each threat type

// ── VIRUS: Click infected nodes in a network graph ───────────────
export function virusMinigame(canvas, threat, onProgress, onComplete) {
    const W = canvas.width  = canvas.offsetWidth  || 300;
    const H = canvas.height = canvas.offsetHeight || 220;
    const ctx = canvas.getContext('2d');
    let raf, destroyed = false;

    const NODE_COUNT = 6 + threat.severity * 2;
    const INFECTED   = Math.ceil(NODE_COUNT * 0.4);

    // Build nodes
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: 30 + Math.random() * (W - 60),
        y: 30 + Math.random() * (H - 60),
        vx: (Math.random() - 0.5) * 0.15,  // much slower movement
        vy: (Math.random() - 0.5) * 0.15,
        infected: i < INFECTED,
        purged: false,
        pulse: Math.random() * Math.PI * 2,
        r: 10 + Math.random() * 5,
    }));

    // Edges — connect nearby nodes
    const edges = [];
    nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
            if (j <= i) return;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 120) edges.push([i, j]);
        });
    });

    let purgedCount = 0;
    const required = INFECTED;

    function draw() {
        if (destroyed) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#020f07';
        ctx.fillRect(0, 0, W, H);

        // Move nodes
        nodes.forEach(n => {
            n.pulse += 0.06;
            n.x += n.vx; n.y += n.vy;
            if (n.x < n.r || n.x > W - n.r) n.vx *= -1;
            if (n.y < n.r || n.y > H - n.r) n.vy *= -1;
        });

        // Edges
        edges.forEach(([i, j]) => {
            const a = nodes[i], b = nodes[j];
            const col = (a.infected && !a.purged) || (b.infected && !b.purged)
                ? `rgba(255,34,34,0.25)` : `rgba(20,253,206,0.12)`;
            ctx.beginPath();
            ctx.strokeStyle = col;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });

        // Nodes
        nodes.forEach(n => {
            if (n.purged) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(20,253,206,0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // checkmark
                ctx.strokeStyle = 'rgba(20,253,206,0.4)';
                ctx.beginPath();
                ctx.moveTo(n.x - 4, n.y); ctx.lineTo(n.x - 1, n.y + 3); ctx.lineTo(n.x + 5, n.y - 4);
                ctx.stroke();
                return;
            }
            const glow = 0.6 + Math.sin(n.pulse) * 0.4;
            if (n.infected) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,34,34,${glow * 0.15})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,34,34,${glow * 0.8})`;
                ctx.fill();
                ctx.strokeStyle = '#ff2222';
                ctx.lineWidth = 2;
                ctx.stroke();
                // virus icon — X
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(n.x - 4, n.y - 4); ctx.lineTo(n.x + 4, n.y + 4);
                ctx.moveTo(n.x + 4, n.y - 4); ctx.lineTo(n.x - 4, n.y + 4);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(20,253,206,${0.1 + glow * 0.1})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(20,253,206,${0.4 + glow * 0.3})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });

        // Label
        ctx.fillStyle = 'rgba(20,253,206,0.4)';
        ctx.font = '10px VT323, monospace';
        ctx.fillText(`PURGE INFECTED NODES [${purgedCount}/${required}]`, 6, H - 6);

        raf = requestAnimationFrame(draw);
    }

    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width);
        const my = (e.clientY - rect.top)  * (H / rect.height);
        nodes.forEach(n => {
            if (!n.infected || n.purged) return;
            if (Math.hypot(mx - n.x, my - n.y) < n.r + 4) {
                n.purged = true;
                purgedCount++;
                onProgress(purgedCount / required);
                if (purgedCount >= required) { setTimeout(onComplete, 300); }
            }
        });
    };

    draw();
    return { destroy() { destroyed = true; cancelAnimationFrame(raf); canvas.onclick = null; } };
}

// ── BREACH: Type the code sequence before it disappears ──────────
export function breachMinigame(canvas, threat, onProgress, onComplete) {
    const W = canvas.width  = canvas.offsetWidth  || 300;
    const H = canvas.height = canvas.offsetHeight || 220;
    const ctx = canvas.getContext('2d');
    let raf, destroyed = false;

    const ROUNDS   = 3 + threat.severity;
    const CHARS    = 'ABCDEF0123456789';
    const SEQ_LEN  = 3 + threat.severity;
    const SHOW_MS  = Math.max(3000, 6000 - threat.severity * 500); // much more time

    let round = 0, solved = 0;
    let sequence = '', typed = '', phase = 'show'; // show | type | flash
    let phaseTimer = 0, flashCol = null, flashTimer = 0;

    function newRound() {
        sequence = Array.from({ length: SEQ_LEN }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
        typed = '';
        phase = 'show';
        phaseTimer = Date.now() + SHOW_MS;
    }
    newRound();

    function draw() {
        if (destroyed) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#020f07';
        ctx.fillRect(0, 0, W, H);

        // Grid background
        for (let x = 0; x < W; x += 20) {
            ctx.strokeStyle = 'rgba(20,253,206,0.04)';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const now = Date.now();

        if (phase === 'show') {
            const remaining = Math.max(0, phaseTimer - now);
            const frac = remaining / SHOW_MS;
            // Timer bar
            ctx.fillStyle = `rgba(20,253,206,${0.3 + frac * 0.4})`;
            ctx.fillRect(0, H - 6, W * frac, 6);

            ctx.font = 'bold 42px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(20,253,206,${0.6 + frac * 0.4})`;
            ctx.shadowColor = '#14fdce';
            ctx.shadowBlur  = 12 * frac;
            ctx.fillText(sequence, W / 2, H / 2 + 14);
            ctx.shadowBlur = 0;

            ctx.font = '11px VT323, monospace';
            ctx.fillStyle = 'rgba(20,253,206,0.4)';
            ctx.fillText('MEMORIZE THE CODE', W / 2, H / 2 - 30);

            if (remaining <= 0) { phase = 'type'; }

        } else if (phase === 'type') {
            ctx.font = '11px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,136,0,0.7)';
            ctx.fillText('ENTER THE CODE', W / 2, H / 2 - 40);

            // Show typed chars
            ctx.font = 'bold 42px VT323, monospace';
            const display = typed.padEnd(SEQ_LEN, '_');
            for (let i = 0; i < SEQ_LEN; i++) {
                const correct = typed[i] === sequence[i];
                const filled  = i < typed.length;
                ctx.fillStyle = filled ? (correct ? '#14fdce' : '#ff2222') : 'rgba(20,253,206,0.2)';
                const cx = W / 2 - (SEQ_LEN * 26) / 2 + i * 26 + 13;
                ctx.fillText(display[i], cx, H / 2 + 14);
            }

            // Keyboard hint
            ctx.font = '10px VT323, monospace';
            ctx.fillStyle = 'rgba(20,253,206,0.25)';
            ctx.fillText('USE KEYBOARD', W / 2, H - 12);

        } else if (phase === 'flash') {
            flashTimer--;
            ctx.font = 'bold 28px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = flashCol;
            ctx.fillText(flashCol === '#14fdce' ? '✓ CODE ACCEPTED' : '✗ CODE REJECTED', W / 2, H / 2 + 10);
            if (flashTimer <= 0) { newRound(); }
        }

        // Round indicator
        ctx.font = '10px VT323, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(20,253,206,0.3)';
        ctx.fillText(`SEQUENCE ${round + 1}/${ROUNDS}`, 8, 16);

        ctx.textAlign = 'left';
        raf = requestAnimationFrame(draw);
    }

    // Keyboard handler
    const onKey = (e) => {
        if (destroyed || phase !== 'type') return;
        const k = e.key.toUpperCase();
        if (k.length === 1 && CHARS.includes(k)) {
            typed += k;
            if (typed.length === SEQ_LEN) {
                if (typed === sequence) {
                    solved++;
                    onProgress(solved / ROUNDS);
                    flashCol = '#14fdce';
                    if (solved >= ROUNDS) { setTimeout(onComplete, 500); }
                } else {
                    flashCol = '#ff2222';
                }
                phase = 'flash'; flashTimer = 30; round++;
            }
        } else if (e.key === 'Backspace') {
            typed = typed.slice(0, -1);
        }
    };
    window.addEventListener('keydown', onKey);

    draw();
    return {
        destroy() {
            destroyed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('keydown', onKey);
        }
    };
}

// ── MALWARE: Block incoming packets on a firewall line ───────────
export function malwareMinigame(canvas, threat, onProgress, onComplete) {
    const W = canvas.width  = canvas.offsetWidth  || 300;
    const H = canvas.height = canvas.offsetHeight || 220;
    const ctx = canvas.getContext('2d');
    let raf, destroyed = false;

    const FIREWALL_Y = H - 40;
    const BLOCK_W    = 36, BLOCK_H = 12;
    const REQUIRED   = 8 + threat.severity * 4;

    let blocked = 0, missed = 0;
    let shield = { x: W / 2, w: 70 - threat.severity * 4, targeting: false };

    const packets = [];
    let spawnTimer = 0;
    const SPAWN_INTERVAL = Math.max(45, 100 - threat.severity * 10);
    const BASE_SPEED     = 0.35 + threat.severity * 0.15;

    function spawnPacket() {
        const types = ['data', 'virus', 'probe'];
        const type  = types[Math.floor(Math.random() * types.length)];
        packets.push({
            x: 20 + Math.random() * (W - 40),
            y: -10,
            vy: BASE_SPEED * (0.8 + Math.random() * 0.4),
            type,
            col: type === 'virus' ? '#ff2222' : type === 'probe' ? '#ff8800' : '#d400ff',
            w: BLOCK_W, h: BLOCK_H,
            blocked: false,
        });
    }

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        shield.x = (e.clientX - rect.left) * (W / rect.width);
    };
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        shield.x = (e.clientX - rect.left) * (W / rect.width);
    };
    // Touch support
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        shield.x = (e.touches[0].clientX - rect.left) * (W / rect.width);
    };

    function draw() {
        if (destroyed) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#020f07';
        ctx.fillRect(0, 0, W, H);

        // Background grid
        for (let x = 0; x < W; x += 24) {
            ctx.strokeStyle = 'rgba(20,253,206,0.04)';
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }

        // Firewall line
        ctx.strokeStyle = 'rgba(20,253,206,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(0, FIREWALL_Y); ctx.lineTo(W, FIREWALL_Y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(20,253,206,0.15)';
        ctx.font = '8px VT323, monospace';
        ctx.fillText('FIREWALL', 4, FIREWALL_Y - 4);

        // Spawn
        spawnTimer++;
        if (spawnTimer >= SPAWN_INTERVAL) { spawnTimer = 0; spawnPacket(); }

        // Update + draw packets
        for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.y += p.vy;

            // Check shield collision
            if (!p.blocked && p.y + p.h >= FIREWALL_Y && p.y <= FIREWALL_Y + 8) {
                const sx = shield.x - shield.w / 2;
                if (p.x + p.w / 2 > sx && p.x - p.w / 2 < sx + shield.w) {
                    p.blocked = true;
                    blocked++;
                    onProgress(blocked / REQUIRED);
                    packets.splice(i, 1);
                    if (blocked >= REQUIRED) { setTimeout(onComplete, 400); }
                    continue;
                }
            }

            // Missed — packet passed firewall
            if (p.y > H + 20) {
                missed++;
                packets.splice(i, 1);
                continue;
            }

            // Draw packet
            const glow = 0.6 + Math.sin(p.y * 0.1) * 0.4;
            ctx.fillStyle = p.col.replace(')', `,${glow * 0.7})`).replace('rgb', 'rgba');
            ctx.shadowColor = p.col;
            ctx.shadowBlur  = 6;
            ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
            ctx.shadowBlur = 0;

            // Packet label
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '8px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(p.type.toUpperCase(), p.x, p.y + 3);
            ctx.textAlign = 'left';
        }

        // Shield
        const sx = shield.x - shield.w / 2;
        ctx.fillStyle = 'rgba(20,253,206,0.15)';
        ctx.fillRect(sx, FIREWALL_Y, shield.w, 10);
        ctx.strokeStyle = '#14fdce';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#14fdce';
        ctx.shadowBlur  = 8;
        ctx.strokeRect(sx, FIREWALL_Y, shield.w, 10);
        ctx.shadowBlur = 0;

        // Stats
        ctx.font = '10px VT323, monospace';
        ctx.fillStyle = '#14fdce';
        ctx.fillText(`BLOCKED: ${blocked}/${REQUIRED}`, 6, 16);
        if (missed > 0) {
            ctx.fillStyle = '#ff2222';
            ctx.textAlign = 'right';
            ctx.fillText(`BREACHED: ${missed}`, W - 6, 16);
            ctx.textAlign = 'left';
        }

        raf = requestAnimationFrame(draw);
    }

    draw();
    return {
        destroy() {
            destroyed = true;
            cancelAnimationFrame(raf);
            canvas.onmousemove = null;
            canvas.onclick = null;
            canvas.ontouchmove = null;
        }
    };
}

// NotificationSystem.js — single unified toast system, bottom of CRT

let container = null;
const _throttle = {};
let _gameActive = false; // gate — no notifications until game screen is loaded

export function enableNotifications() { _gameActive = true; }
export function disableNotifications() { _gameActive = false; }

function getContainer() {
    if (container && document.contains(container)) return container;
    container = document.createElement('div');
    container.id = 'notif-container';
    container.style.cssText = `
        position:absolute;
        left:12px;right:12px;bottom:100px;
        z-index:200;
        display:flex;
        flex-direction:column-reverse;
        align-items:flex-start;
        gap:4px;
        pointer-events:none;
    `;

    function reposition() {
        const log = document.querySelector('.event-log-bar');
        const logH = log ? (log.offsetHeight || 92) : 92;
        container.style.bottom = (logH + 8) + 'px';
        container.style.paddingBottom = '0';
    }
    setInterval(reposition, 250);
    reposition();

    const game = document.querySelector('.game');
    if (game) game.appendChild(container);
    return container;
}

export function showNotification(msg, type = 'info', duration = 3500, throttleKey = null) {
    if (!_gameActive) return; // don't show before game is loaded
    // Throttle — same key won't fire more than once per `duration`ms
    if (throttleKey) {
        const now = Date.now();
        if (_throttle[throttleKey] && now - _throttle[throttleKey] < duration) return;
        _throttle[throttleKey] = now;
    }

    const c = getContainer(); if (!c) return;

    const colors = {
        info:    { border: '#14fdce', text: '#14fdce', bg: 'rgba(2,15,7,0.95)'  },
        warn:    { border: '#ff8800', text: '#ff8800', bg: 'rgba(8,4,0,0.95)'   },
        crit:    { border: '#ff2222', text: '#ff2222', bg: 'rgba(10,0,0,0.95)'  },
        ok:      { border: '#14fdce', text: '#5ecba8', bg: 'rgba(2,15,7,0.95)'  },
        achieve: { border: '#d4e800', text: '#d4e800', bg: 'rgba(6,6,0,0.95)'   },
    };
    const col = colors[type] || colors.info;

    // Deduplicate by message text
    for (const el of c.querySelectorAll('.notif-item')) {
        if (el.dataset.msg === msg) return;
    }

    const n = document.createElement('div');
    n.className = 'notif-item';
    n.dataset.msg = msg;
    n.style.cssText = `
        border:1px solid ${col.border};
        border-left:3px solid ${col.border};
        background:${col.bg};
        color:${col.text};
        font-family:'VT323',monospace;
        font-size:0.72rem;
        letter-spacing:1px;
        padding:3px 12px;
        opacity:0;
        transform:translateY(6px);
        transition:opacity 0.2s,transform 0.2s;
        pointer-events:auto;
        cursor:pointer;
        white-space:nowrap;
        max-width:400px;
        text-align:center;
    `;
    n.textContent = msg.replace(/\n/g, '  //  ');
    n.onclick = () => dismiss(n);
    c.appendChild(n);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        n.style.opacity = '1';
        n.style.transform = 'translateY(0)';
    }));

    const t = setTimeout(() => dismiss(n), duration);
    n._dt = t;

    function dismiss(el) {
        clearTimeout(el._dt);
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(() => el.remove(), 220);
    }
}

// Typed helpers — all with throttle keys to prevent spam
export function notifyThreat(threat) {
    const icons = { VIRUS: '⚠ VIRUS', BREACH: '⚠ BREACH', MALWARE: '⚠ MALWARE' };
    showNotification(`${icons[threat.type]||'⚠ THREAT'} — ${threat.target.toUpperCase()} SEV ${threat.severity} — GO TO SECURITY`, 'crit', 8000, `threat-${threat.id}`);
}

export function notifyAchievement(a) {
    showNotification(`${a.icon} ACHIEVEMENT UNLOCKED: ${a.label}`, 'achieve', 5000, `ach-${a.id}`);
}

export function notifyReactorCritical(temp) {
    showNotification(`☢ REACTOR CRITICAL — ${temp}°C — CHECK WATER PUMP`, 'crit', 6000, 'reactor-crit');
}

export function notifyAlert(msg) {
    // Replaces the old alert-banner — throttled per unique message
    const key = 'alert-' + msg.substring(0, 30);
    showNotification(msg, 'warn', 4000, key);
}

// DeptLayout.js
// Helper para layout consistente em todos os departamentos:
// [dados à esquerda] [preview 3D lowpoly à direita]

import { getModelBuilder } from './ProceduralModels.js';

/**
 * Cria um canvas 3D procedural para um departamento.
 * Chama-se em onRendered() depois do DOM estar pronto.
 *
 * @param {string} canvasId  - id do <canvas>
 * @param {string} dept      - chave do departamento (ex: 'reactorcore')
 * @param {object} opts      - opções extra para a câmera/animação
 */
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 600;

export function mountDeptModel(canvasId, dept, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return null;

    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x020f07);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(opts.cx || 0, opts.cy || 0.2, opts.cz || 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'low-power' });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

    // Build procedural model
    const builder = getModelBuilder(dept);
    const model   = builder(scene);

    const ambLight = new THREE.AmbientLight(0x14fdce, 0.3);
    scene.add(ambLight);

    // Interaction
    let isDragging = false, lastX = 0, lastY = 0, lastInteract = Date.now();

    // Mouse
    canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; lastInteract = Date.now(); });
    canvas.addEventListener('mouseup',   () => { isDragging = false; lastInteract = Date.now(); });
    canvas.addEventListener('mousemove', e => {
        if (!isDragging || !model) return;
        model.rotation.y += (e.clientX - lastX) * 0.007;
        model.rotation.x += (e.clientY - lastY) * 0.007;
        lastX = e.clientX; lastY = e.clientY; lastInteract = Date.now();
    });
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        camera.position.z = Math.max(1.5, Math.min(8, camera.position.z + e.deltaY * 0.008));
        lastInteract = Date.now();
    }, { passive: false });

    // Touch
    canvas.addEventListener('touchstart', e => {
        isDragging = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; lastInteract = Date.now();
        e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { isDragging = false; lastInteract = Date.now(); });
    canvas.addEventListener('touchmove', e => {
        if (!isDragging || !model) return;
        model.rotation.y += (e.touches[0].clientX - lastX) * 0.007;
        model.rotation.x += (e.touches[0].clientY - lastY) * 0.007;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; lastInteract = Date.now();
        e.preventDefault();
    }, { passive: false });

    // Resize
    const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(() => requestAnimationFrame(resize));
    ro.observe(canvas);
    resize();

    // Frame throttle: 30fps on mobile, uncapped on desktop
    const frameInterval = isMobile ? 1000 / 30 : 0;
    let animId, lastFrame = 0;

    const animate = (now = 0) => {
        animId = requestAnimationFrame(animate);
        if (frameInterval && now - lastFrame < frameInterval) return;
        lastFrame = now;
        if (model) {
            const idle = Date.now() - lastInteract > 3000 && !isDragging;
            if (idle) {
                model.rotation.y += isMobile ? 0.004 : 0.006;
                model.rotation.x *= 0.97;
            }
            if (opts.animate) opts.animate(model, scene, Date.now());
        }
        renderer.render(scene, camera);
    };

    const onVisChange = () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            lastFrame = 0;
            animate();
        }
    };
    document.addEventListener('visibilitychange', onVisChange);

    animate();

    return {
        dispose: () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVisChange);
            renderer.dispose();
        },
        model
    };
}

/**
 * Gera o HTML do painel 3D à direita (coluna lateral consistente).
 * @param {string} canvasId  - id do canvas
 * @param {string} label     - label exibida abaixo do canvas
 */
export function dept3DPanel(canvasId, label) {
    const hint = isMobile ? 'DRAG' : 'DRAG &middot; SCROLL';
    return `
        <div class="dept-3d-panel">
            <canvas id="${canvasId}" class="dept-canvas"></canvas>
            <p class="dept-canvas-label">${label}</p>
            <p class="dept-canvas-hint">${hint}</p>
        </div>
    `;
}

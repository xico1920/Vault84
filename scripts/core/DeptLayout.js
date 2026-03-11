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
export function mountDeptModel(canvasId, dept, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === 'undefined') return null;

    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x020f07);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(opts.cx || 0, opts.cy || 0.2, opts.cz || 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Build procedural model
    const builder = getModelBuilder(dept);
    const model   = builder(scene);

    // Subtle ambient + directional light for solid faces (if any)
    // (wireframe ignores light, but good for future solid mode)
    const ambLight = new THREE.AmbientLight(0x14fdce, 0.3);
    scene.add(ambLight);

    // Interaction
    let isDragging = false, lastX = 0, lastY = 0, lastInteract = Date.now();

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

    let animId;
    const animate = () => {
        animId = requestAnimationFrame(animate);
        if (model) {
            const idle = Date.now() - lastInteract > 3000 && !isDragging;
            if (idle) {
                model.rotation.y += 0.006;
                // Gently return x tilt to 0
                model.rotation.x *= 0.97;
            }
            // Custom per-dept animation
            if (opts.animate) opts.animate(model, scene, Date.now());
        }
        renderer.render(scene, camera);
    };
    animate();

    return {
        dispose: () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
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
    return `
        <div class="dept-3d-panel">
            <canvas id="${canvasId}" class="dept-canvas"></canvas>
            <p class="dept-canvas-label">${label}</p>
            <p class="dept-canvas-hint">DRAG &middot; SCROLL</p>
        </div>
    `;
}

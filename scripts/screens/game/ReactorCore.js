// scripts/screens/game/ReactorCore.js
// ReactorCore atualizado para carregar o teu modelo 3D

import { ModelViewer } from '../../core/ModelViewer.js';

export function createReactorCoreScreen() {
    let modelViewer = null;
    const canvasId = 'reactorCanvas';

    return {
        async render() {
            return `
                <div class="reactor-core-container grid grid-cols-12 gap-4">
                    <!-- Info do Reactor -->
                    <div class="reactor-content col-span-12 md:col-span-8">
                        <h1>REACTOR CORE</h1>
                        <p>STATUS: <span style="color: #14fdce;">ONLINE</span></p>
                        <p>POWER OUTPUT: <span style="color: #14fdce;">2.4 GW</span></p>
                        <p>CORE TEMPERATURE: <span style="color: #14fdce;">850°C</span></p>
                        <p>COOLANT FLOW: <span style="color: #14fdce;">NOMINAL</span></p>
                        <p>RADIATION LEVELS: <span style="color: #14fdce;">SAFE</span></p>
                    </div>

                    <!-- Canvas 3D do Reactor + Controlos -->
                    <div class="col-span-12 md:col-span-4">
                        <!-- Modelo 3D -->
                        <div style="border: 2px solid #14fdce; border-radius: 8px; padding: 10px; background: rgba(3, 30, 17, 0.8);">
                            <canvas id="${canvasId}" style="width: 100%; height: 300px; display: block; border-radius: 4px;"></canvas>
                        </div>
                        
                        <!-- Controlos -->
                        <div class="mt-3">
                            <button id="toggleWireframe" style="background: transparent; border: 1px solid #14fdce; color: #14fdce; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%; font-family: 'VT323', monospace;">
                                TOGGLE SOLID/WIREFRAME
                            </button>
                        </div>
                        
                        <!-- Info dos controlos -->
                        <div class="mt-3 p-3" style="border: 1px solid #14fdce; border-radius: 6px; background: rgba(3, 30, 17, 0.3);">
                            <p style="margin: 0 0 8px 0; text-align: center; color: #14fdce;"><strong>INTERACTION:</strong></p>
                            <p style="margin: 0 0 4px 0; font-size: 14px;">• <strong>Drag:</strong> Rotate reactor core</p>
                            <p style="margin: 0 0 4px 0; font-size: 14px;">• <strong>Scroll:</strong> Zoom in/out</p>
                            <p style="margin: 0; font-size: 14px;">• <strong>Idle:</strong> Auto-return (4s)</p>
                        </div>
                    </div>
                </div>
            `;
        },

        async onRendered() {
            modelViewer = new ModelViewer();
            
            requestAnimationFrame(async () => {
                try {
                    const modelPath = 'assets/3D/reactorcore.glb';
                    
                    await modelViewer.initViewer(canvasId, modelPath, {
                        fov: 60,
                        cameraX: 0,
                        cameraY: 0,
                        cameraZ: 4,
                        
                        // Animação pulsante suave
                        customAnimation: (model, scene) => {
                            const time = Date.now() * 0.001;
                            const pulse = 1.0 + Math.sin(time * 2) * 0.03;
                            model.scale.setScalar(pulse);
                        }
                    });

                    // Event listener para o botão wireframe
                    document.getElementById('toggleWireframe')?.addEventListener('click', () => {
                        modelViewer.toggleWireframe(canvasId);
                    });

                    // Resize observer
                    const resizeObserver = new ResizeObserver(() => {
                        modelViewer.resize(canvasId);
                    });
                    
                    const canvas = document.getElementById(canvasId);
                    if (canvas) {
                        resizeObserver.observe(canvas);
                    }

                } catch (error) {
                    console.error('Erro ao inicializar o modelo 3D:', error);
                }
            });
        },

        onExit() {
            if (modelViewer) {
                modelViewer.dispose(canvasId);
                modelViewer = null;
            }
        }
    };
}
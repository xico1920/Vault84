// scripts/core/ModelViewer.js
// Visualizador simples para modelos 3D em wireframe verde - FIXED RESIZE ISSUE

export class ModelViewer {
    constructor() {
        this.viewers = new Map();
    }

    // Inicializa um viewer num canvas
    async initViewer(canvasId, modelPath, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas ${canvasId} not found!`);
            return null;
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x031e11); // Verde escuro do terminal

        // Camera - valores iniciais serão recalculados no resize
        const camera = new THREE.PerspectiveCamera(
            options.fov || 75,
            1, // Será atualizado no primeiro resize
            0.1,
            1000
        );
        
        // Posição inicial da câmera
        const initialCameraPos = {
            x: options.cameraX || 0,
            y: options.cameraY || 0,
            z: options.cameraZ || 5
        };
        
        camera.position.set(initialCameraPos.x, initialCameraPos.y, initialCameraPos.z);
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        // Configuração inicial do renderer - será atualizada no resize
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controles de interação - SIMPLES
        const controls = {
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            rotationSpeed: 0.005,
            autoRotate: true,
            isReturningToCenter: false,
            targetRotationX: 0, // Só guardamos o X inicial
            returnSpeed: 0.05,
            lastInteractionTime: Date.now(),
            interactionDelay: 4000
        };

        // Material wireframe verde matrix-style
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x14fdce,          // Verde fosforescente
            wireframe: true,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        let model = null;

        // Carregar modelo
        try {
            if (modelPath.endsWith('.glb') || modelPath.endsWith('.gltf')) {
                // GLB/GLTF Loader
                const loader = new THREE.GLTFLoader();
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(modelPath, resolve, undefined, reject);
                });
                model = gltf.scene;
            } else if (modelPath.endsWith('.obj')) {
                // OBJ Loader
                const loader = new THREE.OBJLoader();
                model = await new Promise((resolve, reject) => {
                    loader.load(modelPath, resolve, undefined, reject);
                });
            }

            if (model) {
                // Aplica material wireframe a todos os meshes
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.material = wireframeMaterial;
                    }
                });

                // Só aplica escala se especificada, mantém centro de massa original
                if (options.modelScale) {
                    model.scale.setScalar(options.modelScale);
                }

                // Centralizar o modelo na origem
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center); // Move o modelo para que seu centro fique na origem

                // Guarda só a rotação X inicial
                controls.targetRotationX = model.rotation.x;

                scene.add(model);
            }
        } catch (error) {
            console.error('Erro ao carregar modelo:', error);
            // Criar um cubo de fallback
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            model = new THREE.Mesh(geometry, wireframeMaterial);
            scene.add(model);
        }

        // Função de resize melhorada
        const handleResize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Atualiza o aspect ratio da câmera
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            // Atualiza o tamanho do renderer
            renderer.setSize(width, height, false); // false evita mudanças no CSS
            
            // Re-renderiza para aplicar as mudanças imediatamente
            renderer.render(scene, camera);
        };

        // Event listeners
        canvas.addEventListener('mousedown', (e) => {
            controls.mouseDown = true;
            controls.mouseX = e.clientX;
            controls.mouseY = e.clientY;
            controls.autoRotate = false; // Para a auto-rotação
            controls.isReturningToCenter = false;
            controls.lastInteractionTime = Date.now();
        });

        canvas.addEventListener('mouseup', () => {
            controls.mouseDown = false;
            controls.lastInteractionTime = Date.now(); // Atualiza quando solta o mouse
            // Não inicia o retorno imediatamente - vai ser controlado no loop de animação
        });

        canvas.addEventListener('mousemove', (e) => {
            if (controls.mouseDown && model) {
                const deltaX = e.clientX - controls.mouseX;
                const deltaY = e.clientY - controls.mouseY;
                
                model.rotation.y += deltaX * controls.rotationSpeed;
                model.rotation.x += deltaY * controls.rotationSpeed;
                
                controls.mouseX = e.clientX;
                controls.mouseY = e.clientY;
                controls.lastInteractionTime = Date.now(); // Atualiza durante o movimento
            }
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.01;
            camera.position.z = Math.max(1, Math.min(10, camera.position.z));
            controls.lastInteractionTime = Date.now(); // Atualiza no zoom também
        });

        // ResizeObserver para detectar mudanças no tamanho do canvas
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // Usa um pequeno delay para garantir que o layout foi aplicado
                requestAnimationFrame(handleResize);
            }
        });
        resizeObserver.observe(canvas);

        // Resize inicial
        handleResize();

        // Animation loop
        let animationId;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            if (model) {
                const currentTime = Date.now();
                const timeSinceLastInteraction = currentTime - controls.lastInteractionTime;
                
                // Verifica se deve iniciar o retorno
                if (timeSinceLastInteraction > controls.interactionDelay && 
                    !controls.isReturningToCenter && 
                    !controls.mouseDown && 
                    !controls.autoRotate) {
                    controls.isReturningToCenter = true;
                }
                
                // Se está a voltar ao centro
                if (controls.isReturningToCenter) {
                    let deltaX = controls.targetRotationX - model.rotation.x;
                    deltaX = ((deltaX + Math.PI) % (Math.PI * 2)) - Math.PI;
                    
                    model.rotation.x += deltaX * controls.returnSpeed;
                    
                    if (Math.abs(deltaX) < 0.01) {
                        model.rotation.x = controls.targetRotationX;
                        controls.isReturningToCenter = false;
                        controls.autoRotate = true; // Reativar auto-rotação
                    }
                }
                
                // AUTO-ROTAÇÃO SEMPRE ATIVA (exceto durante interação manual)
                if (controls.autoRotate && !controls.mouseDown && !controls.isReturningToCenter) {
                    model.rotation.y += 0.007; // Mais lenta: 2/3 de 0.01
                }
            }

            // Animações customizadas
            if (options.customAnimation && model) {
                options.customAnimation(model, scene);
            }

            renderer.render(scene, camera);
        };

        animate();

        // Armazena o viewer
        const viewerData = {
            scene,
            camera,
            renderer,
            model,
            controls,
            animationId,
            canvas,
            resizeObserver,
            handleResize,
            initialCameraPos
        };

        this.viewers.set(canvasId, viewerData);

        return viewerData;
    }

    // Define a rotação alvo para onde o modelo deve voltar (por padrão usa a inicial)
    setTargetRotation(canvasId, x = null, y = null) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;
        
        // Se não especificar x/y, usa a rotação inicial
        if (viewer.controls.initialRotation) {
            viewer.controls.targetRotation.x = x !== null ? x : viewer.controls.initialRotation.x;
            viewer.controls.targetRotation.y = y !== null ? y : viewer.controls.initialRotation.y;
        }
    }

    // Força o retorno à rotação inicial
    returnToCenter(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;
        
        // Volta para a rotação inicial
        if (viewer.controls.initialRotation) {
            viewer.controls.targetRotation.x = viewer.controls.initialRotation.x;
            viewer.controls.targetRotation.y = viewer.controls.initialRotation.y;
            viewer.controls.isReturningToCenter = true;
            viewer.controls.autoRotate = false;
        }
    }

    // Resize handler público (mantido para compatibilidade)
    resize(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;
        
        // Chama a função de resize interna
        viewer.handleResize();
    }

    // Reset camera position (útil após resize em dispositivos móveis)
    resetCameraPosition(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;

        const { camera, initialCameraPos } = viewer;
        camera.position.set(initialCameraPos.x, initialCameraPos.y, initialCameraPos.z);
        camera.lookAt(0, 0, 0);
    }

    // Cleanup
    dispose(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;

        const { renderer, animationId, resizeObserver } = viewer;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
        
        if (renderer) {
            renderer.dispose();
        }

        this.viewers.delete(canvasId);
    }

    // Muda material para wireframe/solid
    toggleWireframe(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer || !viewer.model) return;

        viewer.model.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
    }

    // Muda a cor do material
    setColor(canvasId, color) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer || !viewer.model) return;

        viewer.model.traverse((child) => {
            if (child.isMesh) {
                child.material.color.setHex(color);
            }
        });
    }
}
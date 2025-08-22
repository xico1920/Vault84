// scripts/core/modelViewer.js
// Visualizador simples para modelos 3D em wireframe verde

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

        // Camera
        const camera = new THREE.PerspectiveCamera(
            options.fov || 75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        
        // Posição da câmera ajustada para melhor centramento
        camera.position.set(
            options.cameraX || 0,
            options.cameraY || 0,
            options.cameraZ || 5
        );
        
        // Garante que a câmera está a olhar para o centro
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
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
            canvas
        };

        this.viewers.set(canvasId, viewerData);

        return viewerData;
    }

    // Define a rotação alvo para onde o modelo deve voltar (por padrão usa a inicial)
    setTargetRotation(canvasId, x = null, y = null) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;
        
        // Se não especificar x/y, usa a rotação inicial
        viewer.controls.targetRotation.x = x !== null ? x : viewer.controls.initialRotation.x;
        viewer.controls.targetRotation.y = y !== null ? y : viewer.controls.initialRotation.y;
    }

    // Força o retorno à rotação inicial
    returnToCenter(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;
        
        // Volta para a rotação inicial
        viewer.controls.targetRotation.x = viewer.controls.initialRotation.x;
        viewer.controls.targetRotation.y = viewer.controls.initialRotation.y;
        viewer.controls.isReturningToCenter = true;
        viewer.controls.autoRotate = false;
    }

    // Resize handler
    resize(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;

        const { canvas, camera, renderer } = viewer;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    // Cleanup
    dispose(canvasId) {
        const viewer = this.viewers.get(canvasId);
        if (!viewer) return;

        const { renderer, animationId } = viewer;
        
        if (animationId) {
            cancelAnimationFrame(animationId);
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
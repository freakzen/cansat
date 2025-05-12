document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('cansatContainer');
    if (!container) return;

    // Track if we've already initialized
    let isInitialized = false;
    let cansatModel = null;
    let scene, camera, renderer;

    async function loadConfig(path) {
        try {
            const response = await fetch(path);
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${path}:`, error);
            return null;
        }
    }

    function cleanupScene() {
        if (cansatModel && scene) {
            scene.remove(cansatModel);
            cansatModel = null;
        }
    }

    function showErrorCube() {
        cleanupScene();
        
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            wireframe: true 
        });
        cansatModel = new THREE.Mesh(geometry, material);
        scene.add(cansatModel);
    }

    async function initCanSatVisualization() {
        // Prevent multiple initializations
        if (isInitialized) return;
        isInitialized = true;

        const [gyroConfig, csvFields] = await Promise.all([
            loadConfig('/static/config/gyroscopeModel.json'),
            loadConfig('/static/config/csvFields.json')
        ]);

        // === Setup Three.js ===
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212);

        camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        camera.position.z = 3;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.innerHTML = ''; // Clear container
        container.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Load model
        if (gyroConfig?.enabled) {
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath('/static/models/');
            
            try {
                const materials = await new Promise((resolve, reject) => {
                    mtlLoader.load(gyroConfig.materialPath, resolve, undefined, reject);
                });
                materials.preload();

                const objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath('/static/models/');
                
                const object = await new Promise((resolve, reject) => {
                    objLoader.load(gyroConfig.modelPath, resolve, undefined, reject);
                });

                cleanupScene();
                
                // Center and scale model
                const bbox = new THREE.Box3().setFromObject(object);
                const center = bbox.getCenter(new THREE.Vector3());
                object.position.sub(center);
                object.scale.set(0.15, 0.15, 0.15);

                cansatModel = object;
                scene.add(cansatModel);

            } catch (error) {
                console.error("Model loading failed:", error);
                showErrorCube();
            }
        } else {
            showErrorCube();
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();

        // Handle window resize
        window.addEventListener('resize', function () {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    // Gyro data updates
    function updateGyroData() {
        fetch('/api/system-status')
            .then(response => response.json())
            .then(data => {
                if (data.MPU6050 && cansatModel) {
                    document.getElementById('gyroX').textContent = data.MPU6050.gyro_x || '--';
                    document.getElementById('gyroY').textContent = data.MPU6050.gyro_y || '--';
                    document.getElementById('gyroZ').textContent = data.MPU6050.gyro_z || '--';

                    const euler = new THREE.Euler(
                        THREE.MathUtils.degToRad(data.MPU6050.gyro_z || 0),
                        THREE.MathUtils.degToRad(data.MPU6050.gyro_x || 0),
                        THREE.MathUtils.degToRad(data.MPU6050.gyro_y || 0),
                        'ZXY'
                    );
                    cansatModel.quaternion.setFromEuler(euler);
                }
            })
            .catch(err => console.error("Error fetching gyro data:", err));
    }

    // Initialize and set up periodic updates
    initCanSatVisualization();
    setInterval(updateGyroData, 1000);
});
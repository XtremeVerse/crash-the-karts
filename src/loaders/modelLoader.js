import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { urlForCar, urlForCharacter } from '../assetsIndex.js';

const modelCache = new Map();

async function loadModel(url) {
    if (modelCache.has(url)) {
        return modelCache.get(url).clone();
    }

    const loader = new GLTFLoader();
    try {
        const gltf = await loader.loadAsync(url);
        const model = gltf.scene;
        model.traverse(n => {
            if (n.isMesh) {
                n.castShadow = true;
                n.receiveShadow = true;
            }
        });
        modelCache.set(url, model);
        return model.clone();
    } catch (error) {
        console.error(`[ModelLoader] Failed to load model from ${url}`, error);
        return null;
    }
}

function setMaterialColorRecursive(obj, bodyColor, rimColor, neon) {
    obj.traverse(child => {
        if (child.isMesh) {
            const mat = child.material.clone(); // Clone material to avoid cross-talk
            if ('color' in mat) {
                const name = (child.name || '').toLowerCase();
                if (name.includes('rim') || name.includes('wheel')) {
                    mat.color = new THREE.Color(rimColor);
                } else {
                    mat.color = new THREE.Color(bodyColor);
                }
                if ('emissive' in mat && neon) {
                    mat.emissive = new THREE.Color(bodyColor);
                    mat.emissiveIntensity = 0.5;
                }
            }
            child.material = mat;
        }
    });
}

async function probeUrl(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' }); // Use HEAD for efficiency
        return res.ok;
    } catch (e) {
        return false;
    }
}

function autoFitToSize(root, target = 2.0, liftToFloor = true) {
    const box = new THREE.Box3().setFromObject(root);
    if (!box.isEmpty()) {
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = target / maxDim;
        root.scale.setScalar(scale);
        root.updateMatrixWorld(true);
        if (liftToFloor) {
            const box2 = new THREE.Box3().setFromObject(root);
            const minY = box2.min.y;
            if (isFinite(minY)) {
                root.position.y -= minY;
            }
        }
    }
}

export class ModelLoader {
    static async loadCar(name, { bodyColor = 'red', rimColor = 'white', neon = false } = {}) {
        const registryUrl = urlForCar(name);
        const candidateUrls = [
            registryUrl,
            `/placeholder/cars/${name}.glb`,
            `/cars/${name}.glb`
        ].filter(Boolean);

        let pickedUrl = null;
        for (const u of candidateUrls) {
            if (await probeUrl(u)) {
                pickedUrl = u;
                break;
            }
        }

        const group = new THREE.Group();

        if (pickedUrl) {
            const model = await loadModel(pickedUrl);
            if (model) {
                setMaterialColorRecursive(model, bodyColor, rimColor, neon);
                autoFitToSize(model, 2.0, true);
                group.add(model);
            } else {
                pickedUrl = null; // Fallback if model loading fails
            }
        }

        if (!pickedUrl) {
            console.warn('[ModelLoader] Car GLB not found, using fallback for', name);
            const fallback = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), new THREE.MeshPhongMaterial({ color: bodyColor }));
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16), new THREE.MeshPhongMaterial({ color: rimColor }));
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(0.6, -0.1, 0.7);
            const wheel2 = wheel.clone(); wheel2.position.z = -0.7;
            const wheel3 = wheel.clone(); wheel3.position.set(-0.6, -0.1, 0.7);
            const wheel4 = wheel.clone(); wheel4.position.set(-0.6, -0.1, -0.7);
            group.add(fallback, wheel, wheel2, wheel3, wheel4);
        }

        return group;
    }

    static async loadCharacter(name) {
        const registryUrl = urlForCharacter(name);
        const candidateUrls = [
            registryUrl,
            `/placeholder/characters/${name}.glb`,
            `/characters/${name}.glb`,
            `/placeholder/charaters/${name}.glb`,
            `/charaters/${name}.glb`
        ].filter(Boolean);

        let pickedUrl = null;
        for (const u of candidateUrls) {
            if (await probeUrl(u)) {
                pickedUrl = u;
                break;
            }
        }

        const group = new THREE.Group();

        if (pickedUrl) {
            const model = await loadModel(pickedUrl);
            if (model) {
                autoFitToSize(model, 1.2, true);
                group.add(model);
            } else {
                pickedUrl = null; // Fallback
            }
        }

        if (!pickedUrl) {
            console.warn('[ModelLoader] Character GLB not found, using fallback for', name);
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 'white' }));
            sphere.position.set(0, 0.5, 0);
            group.add(sphere);
        }

        return group;
    }
}

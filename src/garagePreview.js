import * as THREE from 'three';

export class GaragePreview {
    constructor(containerEl) {
        this.containerEl = containerEl;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, containerEl.clientWidth / containerEl.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        containerEl.innerHTML = '';
        containerEl.appendChild(this.renderer.domElement);
        this.root = new THREE.Group();
        this.scene.add(this.root);
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const spot = new THREE.SpotLight(0xffffff, 1);
        spot.position.set(5, 10, 5);
        spot.castShadow = true;
        this.scene.add(spot);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshPhongMaterial({ color: 0x222222 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 1, 0);
        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        window.addEventListener('resize', () => this.onResize());
    }
    onResize() {
        const w = this.containerEl.clientWidth, h = this.containerEl.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
    show(modelGroup) {
        this.root.clear();
        if (modelGroup) {
            this.root.add(modelGroup);
        }
    }
    animate() {
        requestAnimationFrame(this.animate);
        if (this.root) this.root.rotation.y += 0.005;
        this.renderer.render(this.scene, this.camera);
    }
    dispose() {
        cancelAnimationFrame(this.animate);
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}

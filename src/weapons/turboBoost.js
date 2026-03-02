import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
export class TurboBoost {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'TurboBoost';
        this.consumesOnUse = false;
        this.duration = 3;
        this.active = false;
        this.loader = new GLTFLoader();
        this.flame = null;
        this.attachModel();
        this.original = null;
    }
    attachModel() {
        const path = '/src/assets/weapons/flame.glb';
        this.loader.load(path, gltf => {
            this.flame = gltf.scene;
            this.flame.visible = false;
            this.flame.position.set(0, 0.2, -1);
            this.owner.mesh.add(this.flame);
        }, undefined, () => {
            const m = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0x00aaff }));
            m.visible = false;
            m.position.set(0, 0.2, -1);
            this.flame = m;
            this.owner.mesh.add(m);
        });
    }
    use() {
        if (this.active) return;
        this.active = true;
        this.original = { maxSpeed: this.owner.maxSpeed, accel: this.owner.acceleration };
        this.owner.maxSpeed *= 2;
        this.owner.acceleration *= 1.8;
        if (this.flame) this.flame.visible = true;
    }
    update(dt) {
        if (!this.active) return;
        this.duration -= dt;
    }
    isFinished() { return this.active && this.duration <= 0; }
    cleanup() {
        if (!this.original) return;
        this.owner.maxSpeed = this.original.maxSpeed;
        this.owner.acceleration = this.original.accel;
        if (this.flame) this.flame.visible = false;
    }
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export class EnergyShield {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'EnergyShield';
        this.consumesOnUse = false;
        this.duration = 5;
        this.active = false;
        this.loader = new GLTFLoader();
        this.model = null;
        this.attachModel();
    }
    attachModel() {
        const path = '/src/assets/weapons/shield.glb';
        this.loader.load(path, gltf => {
            this.model = gltf.scene;
            this.model.visible = false;
            this.owner.mesh.add(this.model);
        }, undefined, () => {
            const s = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.3 }));
            s.visible = false;
            this.model = s;
            this.owner.mesh.add(s);
        });
    }
    use() {
        if (this.active) return;
        this.active = true;
        if (this.model) this.model.visible = true;
    }
    update(dt) {
        if (!this.active) return;
        this.duration -= dt;
    }
    modifyIncomingDamage(amount) {
        if (!this.active) return amount;
        return amount * 0.4;
    }
    isFinished() { return this.active && this.duration <= 0; }
    cleanup() { if (this.model) this.model.visible = false; }
}

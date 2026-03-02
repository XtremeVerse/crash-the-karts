import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export class RocketLauncher {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'RocketLauncher';
        this.consumesOnUse = true;
        this.model = null;
        this.loader = new GLTFLoader();
        this.attachModel();
    }
    attachModel() {
        const path = '/src/assets/weapons/rocket.glb';
        this.loader.load(path, gltf => {
            this.model = gltf.scene;
            this.model.scale.set(0.5, 0.5, 0.5);
            this.model.position.set(0, 0.3, 1);
            this.owner.mesh.add(this.model);
        }, undefined, () => {
            const m = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
            m.rotation.x = Math.PI / 2;
            m.position.set(0, 0.3, 1);
            this.model = m;
            this.owner.mesh.add(m);
        });
    }
    use() {
        if (!this.owner || !this.owner.mesh) return;
        let rocketMesh = null;
        if (this.model) {
            this.owner.mesh.remove(this.model);
            rocketMesh = this.model;
        } else {
            rocketMesh = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        }
        rocketMesh.position.copy(this.owner.mesh.position.clone());
        rocketMesh.quaternion.copy(this.owner.mesh.quaternion);
        this.game.scene.add(rocketMesh);
        const speed = 50;
        const damage = 40;
        const effect = {
            mesh: rocketMesh,
            done: false,
            update: (dt) => {
                const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(rocketMesh.quaternion);
                rocketMesh.position.addScaledVector(dir, speed * dt);
                for (const e of this.game.entities) {
                    if (e === this.owner) continue;
                    const d = e.mesh.position.distanceTo(rocketMesh.position);
                    if (d < 1.2) {
                        if (e.takeDamage) e.takeDamage(damage);
                        effect.done = true;
                        break;
                    }
                }
            }
        };
        this.game.effects.push(effect);
    }
    update(dt) {}
    isFinished() {
        return false;
    }
    cleanup() {
        if (this.model && this.model.parent) this.model.parent.remove(this.model);
    }
}

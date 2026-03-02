import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export class ProximityMine {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'ProximityMine';
        this.consumesOnUse = true;
        this.loader = new GLTFLoader();
        this.model = null;
        this.attachModel();
    }
    attachModel() {
        const path = '/src/assets/weapons/mine.glb';
        this.loader.load(path, gltf => {
            this.model = gltf.scene;
            this.model.scale.set(0.4, 0.4, 0.4);
            this.model.position.set(0, 0.2, -0.8);
            this.owner.mesh.add(this.model);
        }, undefined, () => {
            const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
            m.position.set(0, 0.2, -0.8);
            this.model = m;
            this.owner.mesh.add(m);
        });
    }
    use() {
        if (!this.model) return;
        this.owner.mesh.remove(this.model);
        this.model.position.copy(this.owner.mesh.position.clone());
        this.game.scene.add(this.model);
        const dmg = 50;
        const effect = {
            mesh: this.model,
            done: false,
            update: (dt) => {
                for (const e of this.game.entities) {
                    if (e === this.owner) continue;
                    const d = e.mesh.position.distanceTo(this.model.position);
                    if (d < 2) {
                        if (e.takeDamage) e.takeDamage(dmg);
                        effect.done = true;
                        break;
                    }
                }
            }
        };
        this.game.effects.push(effect);
    }
    update() {}
    isFinished() { return false; }
    cleanup() { if (this.model && this.model.parent) this.model.parent.remove(this.model); }
}

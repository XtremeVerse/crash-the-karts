import * as THREE from 'three';
export class ShockMine {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'ShockMine';
        this.placed = false;
        this.mine = null;
        this.consumesOnUse = true;
    }
    use() {
        if (this.placed) return;
        const g = new THREE.SphereGeometry(0.3, 12, 12);
        const m = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        this.mine = new THREE.Mesh(g, m);
        this.mine.position.copy(this.owner.mesh.position.clone());
        this.mine.position.y = 0.15;
        this.game.scene.add(this.mine);
        this.placed = true;
    }
    update(delta) {
        if (!this.mine) return;
        this.mine.material.color.offsetHSL(0.01, 0, 0);
        const targets = this.game.entities.filter(e => e !== this.owner);
        for (const t of targets) {
            const d = t.mesh.position.distanceTo(this.mine.position);
            if (d < 2) {
                t.takeDamage && t.takeDamage(35);
                const dir = t.mesh.position.clone().sub(this.mine.position).normalize();
                t.mesh.position.addScaledVector(dir, 1);
                this.game.scene.remove(this.mine);
                this.mine = null;
                break;
            }
        }
    }
    isFinished() {
        return this.placed && !this.mine;
    }
    cleanup() {
        if (this.mine) this.game.scene.remove(this.mine);
    }
}

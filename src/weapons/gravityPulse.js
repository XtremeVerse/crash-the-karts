import * as THREE from 'three';
export class GravityPulse {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'GravityPulse';
        this.duration = 0.6;
        this.r = 0;
        this.maxR = 8;
        this.active = false;
        const g = new THREE.RingGeometry(0.1, 0.12, 32);
        const m = new THREE.MeshBasicMaterial({ color: 0x9933ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        this.mesh = new THREE.Mesh(g, m);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.visible = false;
        this.game.scene.add(this.mesh);
        this.consumesOnUse = false;
    }
    use() {
        this.active = true;
        this.mesh.visible = true;
        this.mesh.position.copy(this.owner.mesh.position);
    }
    update(delta) {
        if (!this.active) return;
        this.duration -= delta;
        this.r = Math.min(this.maxR, this.r + delta * 20);
        this.mesh.scale.set(this.r, this.r, 1);
        this.game.entities.forEach(e => {
            if (e === this.owner) return;
            if (!e.mesh) return;
            const d = e.mesh.position.distanceTo(this.mesh.position);
            if (d < this.r && d < this.maxR) {
                const dir = this.mesh.position.clone().sub(e.mesh.position).normalize();
                e.mesh.position.addScaledVector(dir, 0.2);
                e.speed = (e.speed || 0) * 0.7;
                if (!e._gpSlowTimer || e._gpSlowTimer < 0) e._gpSlowTimer = 1.5;
            }
        });
        this.game.entities.forEach(e => {
            if (e._gpSlowTimer && e._gpSlowTimer > 0) {
                e._gpSlowTimer -= delta;
                e.speed = (e.speed || 0) * 0.9;
            }
        });
    }
    isFinished() {
        return this.duration <= 0;
    }
    cleanup() {
        this.game.scene.remove(this.mesh);
    }
}

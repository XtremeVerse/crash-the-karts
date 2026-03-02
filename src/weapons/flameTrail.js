import * as THREE from 'three';
export class FlameTrail {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'FlameTrail';
        this.duration = 5;
        this.active = false;
        this.trails = [];
        this.spawnTimer = 0;
        this.consumesOnUse = false;
    }
    use() {
        this.active = true;
    }
    update(delta) {
        if (!this.active) return;
        this.duration -= delta;
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
            const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 }));
            p.rotation.x = -Math.PI / 2;
            p.position.copy(this.owner.mesh.position.clone());
            p.position.y = 0.02;
            this.game.scene.add(p);
            this.trails.push({ mesh: p, time: 1 });
            this.spawnTimer = 0.1;
        }
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const t = this.trails[i];
            t.time -= delta;
            t.mesh.material.opacity = Math.max(0, t.time);
            if (t.time <= 0) {
                this.game.scene.remove(t.mesh);
                this.trails.splice(i, 1);
            } else {
                this.game.entities.forEach(e => {
                    if (e === this.owner) return;
                    if (!e.mesh) return;
                    if (e.mesh.position.distanceTo(t.mesh.position) < 1) {
                        e.takeDamage && e.takeDamage(10 * delta);
                    }
                });
            }
        }
    }
    isFinished() {
        return this.duration <= 0;
    }
    cleanup() {
        this.trails.forEach(t => this.game.scene.remove(t.mesh));
        this.trails = [];
    }
}

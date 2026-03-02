import * as THREE from 'three';
export class RapidBlaster {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'RapidBlaster';
        this.consumesOnUse = false;
        this.shots = 10;
    }
    use() {
        if (this.shots <= 0) return;
        this.shots--;
        const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        bullet.position.copy(this.owner.mesh.position.clone());
        bullet.quaternion.copy(this.owner.mesh.quaternion);
        this.game.scene.add(bullet);
        const speed = 60;
        const dmg = 8;
        const effect = {
            mesh: bullet,
            t: 1.5,
            done: false,
            update: (dt) => {
                const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(bullet.quaternion);
                bullet.position.addScaledVector(dir, speed * dt);
                this.game.entities.forEach(e => {
                    if (e === this.owner) return;
                    if (e.mesh.position.distanceTo(bullet.position) < 0.8) {
                        if (e.takeDamage) e.takeDamage(dmg);
                        effect.done = true;
                    }
                });
                effect.t -= dt;
                if (effect.t <= 0) effect.done = true;
            }
        };
        this.game.effects.push(effect);
    }
    update() {}
    isFinished() { return this.shots <= 0; }
    cleanup() {}
}

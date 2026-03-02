import * as THREE from 'three';
export class MirrorShield {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'MirrorShield';
        this.duration = 5;
        this.active = false;
        this.consumesOnUse = false;
        this.sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.3 }));
        this.sphere.visible = false;
        this.game.scene.add(this.sphere);
    }
    use() {
        if (this.active) return;
        this.active = true;
        this.sphere.visible = true;
        this.sphere.position.copy(this.owner.mesh.position);
    }
    update(delta) {
        if (!this.active) return;
        this.duration -= delta;
        this.sphere.position.copy(this.owner.mesh.position);
    }
    modifyIncomingDamage(amount, entity) {
        if (!this.active) return amount;
        const reduced = amount * 0.5;
        const reflected = amount * 0.5;
        const attacker = entity === this.owner ? null : null;
        if (this.owner === this.game.player) {
            this.game.bots.forEach(b => {
                if (b && b.mesh.position.distanceTo(this.owner.mesh.position) < 2.5) {
                    b.takeDamage(reflected);
                }
            });
        } else if (this.game.player && this.game.player.mesh.position.distanceTo(this.owner.mesh.position) < 2.5) {
            this.game.player.takeDamage(reflected);
        }
        return reduced;
    }
    isFinished() {
        return this.duration <= 0;
    }
    cleanup() {
        this.game.scene.remove(this.sphere);
    }
}

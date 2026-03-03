import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Mine extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Mine';
        this.damage = 50;
        this.triggerRadius = 4;
        this.mineMesh = null;
    }

    use() {
        const behindPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);
        behindPosition.sub(direction.multiplyScalar(2)); // Drop behind the car

        this.mineMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16),
            new THREE.MeshBasicMaterial({ color: 0x800000 })
        );
        this.mineMesh.position.copy(behindPosition);

        this.game.scene.add(this.mineMesh);
        this.game.effects.push(this);
        this.player.currentWeapon = null; // Fire and forget
    }

    update(delta) {
        if (!this.mineMesh) return;

        this.game.entities.forEach(entity => {
            if (entity !== this.player && entity.mesh.position.distanceTo(this.mineMesh.position) < this.triggerRadius) {
                this.explode();
            }
        });
    }

    explode() {
        this.game.entities.forEach(entity => {
            if (entity.mesh.position.distanceTo(this.mineMesh.position) < this.triggerRadius + 2) {
                entity.takeDamage(this.damage);
            }
        });

        const explosion = new THREE.Mesh(
            new THREE.SphereGeometry(this.triggerRadius + 1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.7 })
        );
        explosion.position.copy(this.mineMesh.position);
        this.game.scene.add(explosion);

        setTimeout(() => this.game.scene.remove(explosion), 700);

        this.destroy();
    }

    destroy() {
        if (this.mineMesh) {
            this.game.scene.remove(this.mineMesh);
            this.mineMesh = null;
            this.done = true;
        }
    }
}

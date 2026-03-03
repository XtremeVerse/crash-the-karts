
import * as THREE from 'three';

import { Weapon } from './baseWeapon.js';

export class HomingMissile extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Homing Missile';
        this.speed = 30;
        this.damage = 45;
        this.missileMesh = null;
        this.target = null;
    }

    use() {
        const startPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);
        startPosition.add(direction.multiplyScalar(2));

        this.missileMesh = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 1.2, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        this.missileMesh.position.copy(startPosition);
        this.missileMesh.quaternion.copy(this.player.mesh.quaternion);

        this.findTarget();
        this.game.scene.add(this.missileMesh);
        this.game.effects.push(this);
    }

    findTarget() {
        let closestDistance = Infinity;
        this.game.entities.forEach(entity => {
            if (entity !== this.player) {
                const distance = this.player.mesh.position.distanceTo(entity.mesh.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    this.target = entity;
                }
            }
        });
    }

    update(delta) {
        if (!this.missileMesh) return;

        if (this.target) {
            const directionToTarget = new THREE.Vector3().subVectors(this.target.mesh.position, this.missileMesh.position).normalize();
            this.missileMesh.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), directionToTarget), 0.1);
        }

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.missileMesh.quaternion);
        this.missileMesh.position.add(forward.multiplyScalar(this.speed * delta));

        if (this.missileMesh.position.length() > 250) {
            this.destroy();
            return;
        }

        this.game.entities.forEach(entity => {
            if (entity.mesh.position.distanceTo(this.missileMesh.position) < 2) {
                if (entity === this.target) {
                    entity.takeDamage(this.damage);
                    this.explode();
                } else if (entity !== this.player) {
                    entity.takeDamage(this.damage / 2); // Less damage for non-targets
                    this.explode();
                }
            }
        });
    }

    explode() {
        const explosion = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 })
        );
        explosion.position.copy(this.missileMesh.position);
        this.game.scene.add(explosion);

        setTimeout(() => this.game.scene.remove(explosion), 600);
        this.destroy();
    }

    destroy() {
        if (this.missileMesh) {
            this.game.scene.remove(this.missileMesh);
            this.missileMesh = null;
            this.done = true;
        }
    }
}

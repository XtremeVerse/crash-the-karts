






















import * as THREE from 'three';





import { Weapon } from './baseWeapon.js';

export class Rocket extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Rocket';
        this.speed = 50;
        this.damage = 40;
        this.rocketMesh = null;
    }

    use() {
        const startPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);

        startPosition.add(direction.multiplyScalar(2)); // Spawn in front of the car

        this.rocketMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 1, 8),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.rocketMesh.position.copy(startPosition);
        this.rocketMesh.quaternion.copy(this.player.mesh.quaternion);

        this.game.scene.add(this.rocketMesh);
        this.game.effects.push(this);
    }

    update(delta) {
        if (!this.rocketMesh) return;

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.rocketMesh.quaternion);
        this.rocketMesh.position.add(forward.multiplyScalar(this.speed * delta));

        // Simple world bounds check
        if (this.rocketMesh.position.length() > 200) {
            this.destroy();
            return;
        }

        // Check for collisions
        this.game.entities.forEach(entity => {
            if (entity !== this.player && entity.mesh.position.distanceTo(this.rocketMesh.position) < 2) {
                entity.takeDamage(this.damage);
                this.explode();
            }
        });
    }

    explode() {
        // Simple explosion effect
        const explosion = new THREE.Mesh(
            new THREE.SphereGeometry(3, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.5 })
        );
        explosion.position.copy(this.rocketMesh.position);
        this.game.scene.add(explosion);

        setTimeout(() => this.game.scene.remove(explosion), 500);

        this.destroy();
    }

    destroy() {
        if (this.rocketMesh) {
            this.game.scene.remove(this.rocketMesh);
            this.rocketMesh = null;
            this.done = true;
        }
    }
}

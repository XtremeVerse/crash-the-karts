import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Grenade extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Grenade';
        this.damage = 40;
        this.throwSpeed = 20;
        this.fuseTime = 2;
        this.grenadeMesh = null;
        this.velocity = new THREE.Vector3();
    }

    use() {
        const startPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);

        startPosition.add(direction.clone().multiplyScalar(2));
        this.velocity.copy(direction).multiplyScalar(this.throwSpeed);
        this.velocity.y += 10; // Add upward velocity

        this.grenadeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x006400 })
        );
        this.grenadeMesh.position.copy(startPosition);

        this.game.scene.add(this.grenadeMesh);
        this.game.effects.push(this);

        setTimeout(() => this.explode(), this.fuseTime * 1000);
        this.player.currentWeapon = null; // Fire and forget
    }

    update(delta) {
        if (!this.grenadeMesh) return;

        this.velocity.y -= 9.8 * delta; // Gravity
        this.grenadeMesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Bounce (simple version)
        if (this.grenadeMesh.position.y < 0.3) {
            this.grenadeMesh.position.y = 0.3;
            this.velocity.y *= -0.6;
        }
    }

    explode() {
        this.game.entities.forEach(entity => {
            if (entity.mesh.position.distanceTo(this.grenadeMesh.position) < 5) {
                entity.takeDamage(this.damage);
            }
        });

        const explosion = new THREE.Mesh(
            new THREE.SphereGeometry(5, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 })
        );
        explosion.position.copy(this.grenadeMesh.position);
        this.game.scene.add(explosion);

        setTimeout(() => this.game.scene.remove(explosion), 500);
        this.destroy();
    }

    destroy() {
        if (this.grenadeMesh) {
            this.game.scene.remove(this.grenadeMesh);
            this.grenadeMesh = null;
            this.done = true;
        }
    }
}

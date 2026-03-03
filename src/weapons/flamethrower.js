import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Flamethrower extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Flamethrower';
        this.damage = 10;
        this.range = 5;
        this.angle = Math.PI / 4; // 45 degrees
        this.duration = 3;
        this.isActive = false;
        this.particles = [];
    }

    use() {
        this.isActive = true;
        setTimeout(() => {
            this.isActive = false;
            this.player.currentWeapon = null;
        }, this.duration * 1000);
    }

    update(delta) {
        if (!this.isActive) {
            this.particles.forEach(p => this.game.scene.remove(p));
            this.particles = [];
            return;
        }

        // Damage enemies in cone
        const playerPos = this.player.mesh.position;
        const playerDir = new THREE.Vector3();
        this.player.mesh.getWorldDirection(playerDir);

        this.game.entities.forEach(entity => {
            if (entity !== this.player) {
                const toEntity = new THREE.Vector3().subVectors(entity.mesh.position, playerPos);
                if (toEntity.length() < this.range && toEntity.angleTo(playerDir) < this.angle / 2) {
                    entity.takeDamage(this.damage * delta);
                }
            }
        });

        // Visual effect
        this.spawnParticles(playerPos, playerDir);
        this.updateParticles(delta);
    }

    spawnParticles(position, direction) {
        for (let i = 0; i < 5; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.7 })
            );
            const spread = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).multiplyScalar(0.5);

            const particleDir = direction.clone().add(spread).normalize();
            particle.position.copy(position).add(particleDir.multiplyScalar(Math.random() * this.range));
            particle.userData.velocity = particleDir.multiplyScalar(2 + Math.random() * 3);
            particle.userData.life = Math.random() * 0.5;

            this.game.scene.add(particle);
            this.particles.push(particle);
        }
    }

    updateParticles(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.userData.life -= delta;
            if (p.userData.life <= 0) {
                this.game.scene.remove(p);
                this.particles.splice(i, 1);
            } else {
                p.position.add(p.userData.velocity.clone().multiplyScalar(delta));
            }
        }
    }

    destroy() {
        this.isActive = false;
        this.particles.forEach(p => this.game.scene.remove(p));
        this.particles = [];
        this.player.currentWeapon = null;
    }
}







import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class MachineGun extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Machine Gun';
        this.damage = 8;
        this.fireRate = 0.1;
        this.duration = 2;
        this.bulletSpeed = 100;
        this.fireTimer = 0;
        this.isActive = false;
    }

    use() {
        this.isActive = true;
        setTimeout(() => this.isActive = false, this.duration * 1000);
    }

    update(delta) {
        if (!this.isActive) return;

        this.fireTimer -= delta;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            this.spawnBullet();
        }
    }

    spawnBullet() {
        const startPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);
        startPosition.add(direction.multiplyScalar(2));

        const bullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        bullet.position.copy(startPosition);
        bullet.quaternion.copy(this.player.mesh.quaternion);

        this.game.scene.add(bullet);

        const bulletData = { mesh: bullet, life: 1 };
        const updateListener = (delta) => {
            const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(bullet.quaternion);
            bullet.position.add(forward.multiplyScalar(this.bulletSpeed * delta));
            bulletData.life -= delta;

            if (bulletData.life <= 0) {
                this.game.scene.remove(bullet);
                this.game.effects = this.game.effects.filter(e => e !== bulletData);
                return;
            }

            this.game.entities.forEach(entity => {
                if (entity !== this.player && entity.mesh.position.distanceTo(bullet.position) < 1) {
                    entity.takeDamage(this.damage);
                    this.game.scene.remove(bullet);
                    this.game.effects = this.game.effects.filter(e => e !== bulletData);
                }
            });
        };
        bulletData.update = updateListener;
        this.game.effects.push(bulletData);
    }

    destroy() {
        this.isActive = false;
        this.player.currentWeapon = null; // Mark as done
    }
}

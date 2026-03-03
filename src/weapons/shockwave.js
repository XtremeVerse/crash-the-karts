import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Shockwave extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Shockwave';
        this.radius = 15;
        this.force = 30;
    }

    use() {
        const playerPos = this.player.mesh.position;

        this.game.entities.forEach(entity => {
            if (entity !== this.player) {
                const toEntity = new THREE.Vector3().subVectors(entity.mesh.position, playerPos);
                if (toEntity.length() < this.radius) {
                    const forceDirection = toEntity.normalize();
                    entity.applyForce(forceDirection, this.force);
                }
            }
        });

        // Visual effect
        this.createShockwaveEffect(playerPos);

        this.player.currentWeapon = null;
    }

    createShockwaveEffect(position) {
        const geometry = new THREE.TorusGeometry(this.radius, 0.5, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const shockwave = new THREE.Mesh(geometry, material);
        shockwave.position.copy(position);
        shockwave.rotation.x = Math.PI / 2;
        this.game.scene.add(shockwave);

        let scale = 0.1;
        const animate = () => {
            scale += 0.1;
            shockwave.scale.set(scale, scale, scale);
            material.opacity -= 0.02;
            if (material.opacity <= 0) {
                this.game.scene.remove(shockwave);
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    destroy() {
        this.done = true;
    }
}

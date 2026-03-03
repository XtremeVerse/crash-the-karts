import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Railgun extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Railgun';
        this.damage = 45;
    }

    use() {
        const playerPos = this.player.mesh.position;
        const playerDir = new THREE.Vector3();
        this.player.mesh.getWorldDirection(playerDir);

        const raycaster = new THREE.Raycaster(playerPos, playerDir, 0, 500);

        const intersects = raycaster.intersectObjects(this.game.entities.map(e => e.mesh));

        let hitPoint = null;

        for (const intersect of intersects) {
            const entity = this.game.entities.find(e => e.mesh === intersect.object);
            if (entity && entity !== this.player) {
                entity.takeDamage(this.damage);
                hitPoint = intersect.point;
                break; // Stop at the first enemy hit
            }
        }

        // Visual effect for the laser beam
        this.createLaserBeam(playerPos, hitPoint || playerPos.clone().add(playerDir.multiplyScalar(500)));

        this.player.currentWeapon = null; // Instantaneous weapon
    }

    createLaserBeam(start, end) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        this.game.scene.add(line);

        setTimeout(() => this.game.scene.remove(line), 200);
    }

    destroy() {
        this.done = true;
    }
}

import * as THREE from 'three';
import { Weapon } from './baseWeapon.js';

export class Shield extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Shield';
        this.duration = 5;
        this.shieldMesh = null;
    }

    use() {
        this.player.isShielded = true;

        this.shieldMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 })
        );
        this.player.mesh.add(this.shieldMesh);

        setTimeout(() => this.destroy(), this.duration * 1000);
        this.player.currentWeapon = null;
    }

    destroy() {
        this.player.isShielded = false;
        if (this.shieldMesh) {
            this.player.mesh.remove(this.shieldMesh);
            this.shieldMesh = null;
        }
    }
}

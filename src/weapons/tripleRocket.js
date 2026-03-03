import * as THREE from 'three';
import { Rocket } from './rocket.js';

export class TripleRocket extends Rocket {
    constructor(player) {
        super(player);
        this.name = 'Triple Rocket';
    }

    use() {
        this.spawnRocket(0); // Center rocket
        this.spawnRocket(-15); // Left rocket
        this.spawnRocket(15);  // Right rocket
        this.player.currentWeapon = null;
    }

    spawnRocket(angle) {
        const startPosition = this.player.mesh.position.clone();
        const direction = new THREE.Vector3();
        this.player.mesh.getWorldDirection(direction);

        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(angle));
        direction.applyQuaternion(quaternion);

        startPosition.add(direction.clone().multiplyScalar(2));

        const rocketMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 1, 8),
            new THREE.MeshBasicMaterial({ color: 0xff8c00 })
        );

        rocketMesh.position.copy(startPosition);
        rocketMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

        this.game.scene.add(rocketMesh);

        const rocketInstance = {
            rocketMesh: rocketMesh,
            speed: this.speed,
            damage: this.damage,
            game: this.game,
            player: this.player,
            update: super.update.bind({ ...this, rocketMesh }),
            destroy: super.destroy.bind({ ...this, rocketMesh }),
        };

        this.game.effects.push(rocketInstance);
    }

    destroy() {
        this.done = true;
    }
}

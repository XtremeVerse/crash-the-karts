import { Weapon } from './baseWeapon.js';

export class SpeedBoost extends Weapon {
    constructor(player) {
        super(player);
        this.name = 'Speed Boost';
        this.duration = 3;
        this.boostFactor = 1.8;
    }

    use() {
        const originalSpeed = this.player.speed;
        this.player.speed *= this.boostFactor;

        // Add some visual effect if you have a particle system

        setTimeout(() => {
            this.player.speed = originalSpeed;
            this.destroy();
        }, this.duration * 1000);

        this.player.currentWeapon = null;
    }

    destroy() {
        this.done = true;
    }
}

export class SpeedOverdrive {
    constructor(game, owner) {
        this.game = game;
        this.owner = owner;
        this.name = 'SpeedOverdrive';
        this.duration = 4;
        this.active = false;
        this.consumesOnUse = false;
        this.original = null;
    }
    use() {
        if (this.active) return;
        this.active = true;
        this.original = { maxSpeed: this.owner.maxSpeed, accel: this.owner.acceleration, handling: this.owner.turnSpeed };
        this.owner.maxSpeed *= 2;
        this.owner.acceleration *= 1.8;
        this.owner.turnSpeed *= 0.9;
    }
    update(delta) {
        if (!this.active) return;
        this.duration -= delta;
    }
    isFinished() {
        return this.active && this.duration <= 0;
    }
    cleanup() {
        if (!this.original) return;
        this.owner.maxSpeed = this.original.maxSpeed;
        this.owner.acceleration = this.original.acceleration;
        this.owner.turnSpeed = this.original.handling;
    }
}

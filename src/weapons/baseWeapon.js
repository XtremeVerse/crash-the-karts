
export class Weapon {
    constructor(player) {
        this.player = player;
        this.game = player.game;
    }

    use() {
        // To be implemented by subclasses
    }

    update() {
        // To be implemented by subclasses
    }

    destroy() {
        // To be implemented by subclasses
    }
}

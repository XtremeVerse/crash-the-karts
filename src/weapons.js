import * as THREE from 'three';

export class Projectile {
    constructor(game, owner, type) {
        this.game = game;
        this.owner = owner;
        this.type = type;
        this.damage = type === 'rocket' ? 25 : 10;
        this.speed = type === 'rocket' ? 30 : 60;
        this.lifeTime = 3; // 3 seconds

        this.initMesh();
    }

    initMesh() {
        const geometry = this.type === 'rocket' ? new THREE.SphereGeometry(0.2) : new THREE.SphereGeometry(0.1);
        const material = new THREE.MeshBasicMaterial({ color: this.owner === this.game.player ? 0xffff00 : 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Start at owner position
        this.mesh.position.copy(this.owner.mesh.position);
        this.mesh.quaternion.copy(this.owner.mesh.quaternion);
        
        // Move forward a bit to not collide with owner
        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        this.mesh.position.addScaledVector(direction, 1.5);
    }

    update(delta) {
        const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        this.mesh.position.addScaledVector(direction, this.speed * delta);
        
        this.lifeTime -= delta;
        
        // Collision detection
        this.checkCollision();
    }

    checkCollision() {
        const raycaster = new THREE.Raycaster(this.mesh.position, new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion), 0, 1);
        const targets = this.game.entities.filter(e => e !== this.owner).map(e => e.mesh);
        const intersects = raycaster.intersectObjects(targets);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const target = this.game.entities.find(e => e.mesh === hitMesh);
            if (target) {
                target.takeDamage(this.damage);
                this.lifeTime = 0; // Destroy projectile
            }
        }
    }
}

export class WeaponSystem {
    constructor(game) {
        this.game = game;
        this.projectiles = [];
        this.shootCooldowns = new Map();
    }

    shoot(owner, type) {
        const lastShot = this.shootCooldowns.get(owner) || 0;
        const now = Date.now();
        const cooldown = type === 'rocket' ? 500 : 100;

        if (now - lastShot < cooldown) return;

        const projectile = new Projectile(this.game, owner, type);
        this.game.scene.add(projectile.mesh);
        this.projectiles.push(projectile);
        this.shootCooldowns.set(owner, now);
    }

    update(delta) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(delta);
            if (p.lifeTime <= 0) {
                this.game.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }
    }

    clearProjectiles() {
        this.projectiles.forEach(p => this.game.scene.remove(p.mesh));
        this.projectiles = [];
    }
}

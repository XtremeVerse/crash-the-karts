import * as THREE from 'three';
import { ModelLoader } from './loaders/modelLoader.js';
import { listCarNames, listCharacterNames } from './assetsIndex.js';

export class Player {
    constructor(game, stats) {
        this.game = game;
        this.stats = stats;
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.velocity = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeed = stats.speed;
        this.acceleration = stats.accel;
        this.handling = stats.handling;
        this.friction = 0.95;
        this.turnSpeed = stats.handling;
        this.currentWeapon = null;
        this.steer = 0;
        this.invincibleTimer = 0;

        this.keys = {};
        this.initControls();
        this.initMesh();
    }
    initControls() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }


    initMesh() {
        // Placeholder base group
        this.mesh = new THREE.Group();
        const placeholder = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), new THREE.MeshPhongMaterial({ color: this.game.store.selectedColor }));
        placeholder.castShadow = true;
        placeholder.receiveShadow = true;
        placeholder.position.y = 0.25;
        this.mesh.add(placeholder);
        this.radius = 0.9;
        // Resolve selected car/character to existing GLBs
        const cars = listCarNames();
        const chars = listCharacterNames();
        const chosenCar = cars.includes(this.game.store.selectedCar) ? this.game.store.selectedCar : (cars[0] || this.game.store.selectedCar);
        const chosenChar = chars.includes(this.game.store.selectedCharacter) ? this.game.store.selectedCharacter : (chars[0] || this.game.store.selectedCharacter);
        // Load selected car and character GLBs
        ModelLoader.loadCar(chosenCar, {
            bodyColor: this.game.store.selectedColor,
            rimColor: this.game.store.selectedRimColor || 'white',
            neon: !!this.game.store.neonEnabled
        }).then(group => {
            this.mesh.clear();
            group.position.y = 0.25;
            this.mesh.add(group);
        });
        ModelLoader.loadCharacter(chosenChar).then(group => {
            group.position.set(0, 0.5, 0);
            this.mesh.add(group);
        });
    }

    update(delta) {
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        if (this.keys['KeyW']) this.velocity.addScaledVector(forward, this.acceleration);
        if (this.keys['KeyS']) this.velocity.addScaledVector(forward, -this.acceleration);
        this.velocity.multiplyScalar(0.98);
        this.speed = this.velocity.length();
        const max = this.maxSpeed;
        if (this.speed > max) this.velocity.setLength(max);
        this.steer = 0;
        if (this.keys['KeyA']) {
            this.mesh.rotation.y += this.turnSpeed;
            this.steer = 1;
        } else if (this.keys['KeyD']) {
            this.mesh.rotation.y -= this.turnSpeed;
            this.steer = -1;
        }
        const desired = forward.clone().multiplyScalar(this.speed);
        this.velocity.lerp(desired, 0.1);
        this.mesh.position.addScaledVector(this.velocity, delta);

        if (this.keys['Space']) this.useWeapon();
        if (this.currentWeapon && this.currentWeapon.update) this.currentWeapon.update(delta);
        if (this.currentWeapon && this.currentWeapon.isFinished && this.currentWeapon.isFinished()) {
            this.currentWeapon.cleanup && this.currentWeapon.cleanup();
            this.currentWeapon = null;
        }
        if (this.invincibleTimer > 0) this.invincibleTimer -= delta;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        if (this.currentWeapon && this.currentWeapon.modifyIncomingDamage) {
            amount = this.currentWeapon.modifyIncomingDamage(amount, this);
        }
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
        this.game.updateHUD();
    }

    die() {
        this.game.matchDeaths++;
        this.health = this.maxHealth;
        this.mesh.position.set(0, 0.25, 0);
        this.speed = 0;
        this.velocity.set(0, 0, 0);
        this.invincibleTimer = 3;
    }

    giveWeapon(w) {
        if (!this.currentWeapon) this.currentWeapon = w;
    }
    useWeapon() {
        if (!this.currentWeapon) return;
        this.currentWeapon.use();
        if (this.currentWeapon.consumesOnUse) {
            this.currentWeapon.cleanup && this.currentWeapon.cleanup();
            this.currentWeapon = null;
        }
    }
}

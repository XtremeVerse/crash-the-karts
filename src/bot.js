import * as THREE from 'three';
import { ModelLoader } from './loaders/modelLoader.js';

export class Bot {
    constructor(game, id, isHard) {
        this.game = game;
        this.id = id;
        this.isHard = isHard;
        this.health = 100;
        this.maxHealth = 100;
        this.velocity = new THREE.Vector3();
        this.speed = 0;
        this.maxSpeed = isHard ? 18 : 16;
        this.acceleration = isHard ? 0.7 : 0.6;
        this.turnSpeed = isHard ? 0.09 : 0.08;
        this.state = 'idle';
        this.target = null;
        this.currentWeapon = null;
        this.cooldown = 0;
        this.recoverTimer = 0;
        this.initMesh();
    }
    initMesh() {
        this.mesh = new THREE.Group();
        const placeholder = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 2), new THREE.MeshPhongMaterial({ color: this.id % 2 === 0 ? 'blue' : 'green' }));
        placeholder.position.y = 0.25;
        this.mesh.add(placeholder);
        this.mesh.position.set(Math.random() * 20 - 10, 0.25, Math.random() * 20 - 10);
        this.radius = 0.9;
        import('./assetsIndex.js').then(mod => {
            const cars = mod.listCarNames();
            const chars = mod.listCharacterNames();
            const carName = cars[this.id % Math.max(1, cars.length)] || 'Balanced';
            const charName = chars[this.id % Math.max(1, chars.length)] || 'Driver2';
            const bodyColor = this.id % 2 === 0 ? 'blue' : 'green';
            ModelLoader.loadCar(carName, { bodyColor, rimColor: 'white', neon: false }).then(group => {
                this.mesh.clear();
                group.position.y = 0.25;
                this.mesh.add(group);
            });
            ModelLoader.loadCharacter(charName).then(group => {
                group.position.set(0, 0.5, 0);
                this.mesh.add(group);
            });
        });
    }
    update(delta) {
        this.updateAIState();
        this.handleMovement(delta);
        this.handleWeaponLogic(delta);
    }
    updateAIState() {
        if (!this.game.player) return;
        if (this.recoverTimer > 0) {
            this.state = 'recover';
            return;
        }
        if (!this.currentWeapon) {
            this.state = 'seek_box';
        } else {
            if (this.health < 30) {
                this.state = 'evade';
            } else {
                const d = this.mesh.position.distanceTo(this.game.player.mesh.position);
                this.state = d < 25 ? 'attack' : 'idle';
            }
        }
    }
    handleMovement(delta) {
        if (this.state === 'idle') {
            this.velocity.addScaledVector(new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion), this.acceleration * 0.5);
            this.mesh.rotation.y += Math.sin(Date.now() * 0.001 + this.id) * 0.005;
        } else if (this.state === 'attack') {
            const dir = new THREE.Vector3().subVectors(this.game.player.mesh.position, this.mesh.position).normalize();
            const targetRot = Math.atan2(dir.x, dir.z);
            const diff = targetRot - this.mesh.rotation.y;
            this.mesh.rotation.y += Math.sign(diff) * this.turnSpeed;
            this.velocity.addScaledVector(new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion), this.acceleration);
        } else if (this.state === 'evade') {
            const dir = new THREE.Vector3().subVectors(this.mesh.position, this.game.player.mesh.position).normalize();
            const targetRot = Math.atan2(dir.x, dir.z);
            const diff = targetRot - this.mesh.rotation.y;
            this.mesh.rotation.y += Math.sign(diff) * this.turnSpeed;
            this.velocity.addScaledVector(new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion), this.acceleration);
        } else if (this.state === 'seek_box') {
            const target = this.game.mystery.getNearestBoxPosition(this.mesh.position);
            if (target) {
                const dir = target.clone().sub(this.mesh.position).normalize();
                const rot = Math.atan2(dir.x, dir.z);
                const diff = rot - this.mesh.rotation.y;
                this.mesh.rotation.y += Math.sign(diff) * this.turnSpeed;
                this.velocity.addScaledVector(new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion), this.acceleration);
            }
        } else if (this.state === 'recover') {
            this.recoverTimer -= delta;
            this.velocity.multiplyScalar(0.9);
        }
        const bounds = this.game.mapManager.current?.bounds || 48;
        const pos = this.mesh.position;
        if (Math.abs(pos.x) > bounds - 5 || Math.abs(pos.z) > bounds - 5) {
            const steerBack = new THREE.Vector3(-pos.x, 0, -pos.z).normalize();
            const targetRot = Math.atan2(steerBack.x, steerBack.z);
            const diff = targetRot - this.mesh.rotation.y;
            this.mesh.rotation.y += Math.sign(diff) * this.turnSpeed;
        }
        this.velocity.multiplyScalar(0.99);
        this.speed = this.velocity.length();
        if (this.speed > this.maxSpeed) this.velocity.setLength(this.maxSpeed);
        this.mesh.position.addScaledVector(this.velocity, delta);
        if (this.cooldown > 0) this.cooldown -= delta;
    }
    handleWeaponLogic(delta) {
        if (!this.currentWeapon) return;
        if (this.currentWeapon.update) this.currentWeapon.update(delta);
        const nearEnemy = this.game.player && this.mesh.position.distanceTo(this.game.player.mesh.position) < 10;
        if (this.currentWeapon.name === 'MirrorShield') {
            if (this.health < 50 && this.cooldown <= 0) {
                this.useWeapon();
            }
        } else if (this.currentWeapon.name === 'SpeedOverdrive') {
            if (!nearEnemy && this.cooldown <= 0) {
                this.useWeapon();
            }
        } else {
            if (nearEnemy && this.cooldown <= 0) {
                this.useWeapon();
            }
        }
        if (this.currentWeapon && this.currentWeapon.isFinished && this.currentWeapon.isFinished()) {
            this.currentWeapon.cleanup && this.currentWeapon.cleanup();
            this.currentWeapon = null;
        }
    }
    giveWeapon(w) {
        if (!this.currentWeapon) this.currentWeapon = w;
    }
    useWeapon() {
        if (!this.currentWeapon) return;
        this.currentWeapon.use();
        this.cooldown = 1.5;
        if (this.currentWeapon.consumesOnUse) {
            this.currentWeapon.cleanup && this.currentWeapon.cleanup();
            this.currentWeapon = null;
        }
    }
    takeDamage(amount) {
        if (this.currentWeapon && this.currentWeapon.modifyIncomingDamage) {
            amount = this.currentWeapon.modifyIncomingDamage(amount, this);
        }
        this.health -= amount;
        if (this.health <= 0) this.die();
    }
    die() {
        this.game.matchKills++;
        this.game.matchScore += 10;
        this.health = this.maxHealth;
        this.mesh.position.set(Math.random() * 40 - 20, 0.25, Math.random() * 40 - 20);
        this.velocity.set(0, 0, 0);
        this.recoverTimer = 1.5;
    }
}

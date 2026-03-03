import * as THREE from 'three';
import * as Weapons from './weapons/index.js';

export class MysteryBoxManager {
    constructor(game) {
        this.game = game;
        this.boxes = [];
        this.respawnTimer = 0;
        this.lastWeaponName = null;
        this.pool = Object.keys(Weapons);
    }
    reset() {
        this.clear();
        this.spawn();
    }
    clear() {
        this.boxes.forEach(b => this.game.scene.remove(b));
        this.boxes = [];
        this.respawnTimer = 0;
    }
    spawn() {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshPhongMaterial({ color: 0xaa00ff, emissive: 0x440055, emissiveIntensity: 0.6 });
        const spawns = this.game.mapManager.current?.spawnPoints || [new THREE.Vector3(0, 0.25, 0)];
        for (let i = 0; i < 2; i++) {
            const mesh = new THREE.Mesh(geo, mat.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const p = spawns[Math.floor(Math.random() * spawns.length)];
            mesh.position.copy(p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 10, 0.5, (Math.random() - 0.5) * 10)));
            this.game.scene.add(mesh);
            this.boxes.push(mesh);
        }
    }
    update(delta) {
        if (!this.game.isMatchRunning) return;
        if (this.boxes.length > 0) {
            const t = Date.now() * 0.002;
            this.boxes.forEach(b => {
                b.rotation.y += 0.02;
                b.position.y = 0.5 + Math.sin(t) * 0.2;
            });
            this.checkPickup(this.game.player);
            this.game.bots.forEach(b => this.checkPickup(b));
        } else {
            if (this.respawnTimer > 0) {
                this.respawnTimer -= delta;
                if (this.respawnTimer <= 0) this.spawn();
            }
        }
    }
    checkPickup(entity) {
        if (!entity || this.boxes.length === 0) return;
        if (entity.currentWeapon) return;
        for (let i = 0; i < this.boxes.length; i++) {
            const b = this.boxes[i];
            const d = entity.mesh.position.distanceTo(b.position);
            if (d < 2) {
                const weapon = this.randomWeaponFor(entity);
                entity.giveWeapon(weapon);
                this.game.scene.remove(b);
                this.boxes.splice(i, 1);
                break;
            }
        }
        if (this.boxes.length === 0) this.respawnTimer = 8;
    }
    randomWeaponFor(owner) {
        let choices = this.pool.slice();
        if (this.lastWeaponName) {
            choices = choices.filter(n => n !== this.lastWeaponName);
        }
        const pick = choices[Math.floor(Math.random() * choices.length)];
        this.lastWeaponName = pick;

        if (Weapons[pick]) {
            return new Weapons[pick](owner);
        }
        // Fallback to a default weapon if something goes wrong
        return new Weapons.Rocket(owner);
    }

    getNearestBoxPosition(from) {
        if (this.boxes.length === 0) return null;
        let best = null;
        let bestD = Infinity;
        this.boxes.forEach(b => {
            const d = b.position.distanceTo(from);
            if (d < bestD) {
                bestD = d;
                best = b.position.clone();
            }
        });
        return best;
    }
}

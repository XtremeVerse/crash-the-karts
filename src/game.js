import * as THREE from 'three';
import { Player } from './player.js';
import { Bot } from './bot.js';
import { MapManager } from './maps/mapManager.js';
import { Store } from './store.js';
import { Settings } from './settings.js';
import { UI } from './ui.js';
import { CollisionSystem } from './collisionSystem.js';
import { MysteryBoxManager } from './mysteryBox.js';
import { GaragePreview } from './garagePreview.js';
import { ModelLoader } from './loaders/modelLoader.js';
import { listCarNames, listCharacterNames } from './assetsIndex.js';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.store = new Store();
        this.settings = new Settings();
        this.ui = new UI(this);
        this.mapManager = new MapManager(this);
        this.collisionSystem = new CollisionSystem(this);
        this.mystery = new MysteryBoxManager(this);
        this.entities = [];
        this.player = null;
        this.bots = [];
        this.isMatchRunning = false;
        this.matchTimeLeft = 0;
        this.matchScore = 0;
        this.matchKills = 0;
        this.matchDeaths = 0;
        this.effects = [];
        this.init();
    }
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = this.settings.quality !== 'low';
        this.container.appendChild(this.renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        this.animate();
        this.showLandingBackground();
        window.addEventListener('resize', () => this.onWindowResize());
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    showLandingBackground() {
        this.isMatchRunning = false;
        this.mapManager.loadMap('arena1');
        this.camera.position.set(30, 20, 30);
        this.camera.lookAt(0, 0, 0);
    }
    initMatch(mode) {
        this.clearScene();
        this.isMatchRunning = true;
        this.matchTimeLeft = 180;
        this.matchScore = 0;
        this.matchKills = 0;
        this.matchDeaths = 0;
        this.mapManager.loadMap('arena1');
        const playerStats = this.store.getCarStats();
        this.player = new Player(this, playerStats);
        this.scene.add(this.player.mesh);
        this.entities.push(this.player);
        let botCount = mode === 'hard' ? 3 : (mode === 'quick' ? 2 : 0);
        for (let i = 0; i < botCount; i++) {
            const bot = new Bot(this, i, mode === 'hard');
            this.scene.add(bot.mesh);
            this.bots.push(bot);
            this.entities.push(bot);
        }
        this.mystery.reset();
        this.timerInterval = setInterval(() => {
            if (this.matchTimeLeft > 0) {
                this.matchTimeLeft--;
                this.updateHUD();
            } else {
                this.endMatch();
            }
        }, 1000);
    }
    clearScene() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.entities.forEach(e => {
            if (e.mesh) this.scene.remove(e.mesh);
        });
        this.entities = [];
        this.bots = [];
        this.player = null;
        this.mystery.clear();
        this.mapManager.clearNonLights();
    }
    updateHUD() {
        const mins = Math.floor(this.matchTimeLeft / 60);
        const secs = this.matchTimeLeft % 60;
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        let weaponStr = '-';
        if (this.player && this.player.currentWeapon) {
            weaponStr = this.player.currentWeapon.name || '-';
            if (this.player.currentWeapon.name === 'RapidBlaster' && this.player.currentWeapon.shots != null) {
                weaponStr = `${weaponStr} (${this.player.currentWeapon.shots})`;
            }
        }
        this.ui.updateHUD({
            timer: timeStr,
            score: this.matchScore,
            health: this.player ? this.player.health : 0,
            ammo: weaponStr
        });
    }
    endMatch() {
        this.isMatchRunning = false;
        clearInterval(this.timerInterval);
        const coinsEarned = this.matchKills * 10 + Math.floor(this.matchScore / 10);
        this.store.addCoins(coinsEarned);
        this.ui.showEndScreen({
            winner: this.matchKills > 0 ? 'PLAYER' : 'BOTS',
            kills: this.matchKills,
            deaths: this.matchDeaths,
            coinsEarned: coinsEarned
        });
    }
    async showGaragePreview() {
        const canvas = document.getElementById('garage-preview-canvas');
        if (!canvas) return;
        this._garage = new GaragePreview(canvas);
        const cars = listCarNames();
        const chars = listCharacterNames();
        const chosenCar = cars.includes(this.store.selectedCar) ? this.store.selectedCar : (cars[0] || this.store.selectedCar);
        const chosenChar = chars.includes(this.store.selectedCharacter) ? this.store.selectedCharacter : (chars[0] || this.store.selectedCharacter);
        const car = await ModelLoader.loadCar(chosenCar, {
            bodyColor: this.store.selectedColor,
            rimColor: this.store.selectedRimColor || 'white',
            neon: !!this.store.neonEnabled
        });
        const driver = await ModelLoader.loadCharacter(chosenChar);
        const group = new THREE.Group();
        group.add(car);
        group.add(driver);
        driver.position.set(0, 0.5, 0);
        car.position.y = 0.25;
        this._garage.show(group);
    }
    hideGaragePreview() {
        if (this._garage) {
            this._garage.dispose();
            this._garage = null;
        }
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = 0.016;
        if (this.isMatchRunning) {
            this.entities.forEach(entity => entity.update(delta));
            this.collisionSystem.update(this.entities, delta);
            this.mystery.update(delta);
            for (let i = this.effects.length - 1; i >= 0; i--) {
                const e = this.effects[i];
                if (e.update) e.update(delta);
                if (e.done) {
                    if (e.mesh) this.scene.remove(e.mesh);
                    this.effects.splice(i, 1);
                }
            }
            this.updateCamera();
            this.updateHUD();
        } else {
            const time = Date.now() * 0.0005;
            this.camera.position.x = Math.sin(time) * 40;
            this.camera.position.z = Math.cos(time) * 40;
            this.camera.lookAt(0, 0, 0);
        }
        this.renderer.render(this.scene, this.camera);
    }
    updateCamera() {
        if (!this.player) return;
        const targetPos = new THREE.Vector3();
        this.player.mesh.getWorldPosition(targetPos);
        const offset = new THREE.Vector3(0, 5, -10);
        offset.applyQuaternion(this.player.mesh.quaternion);
        const cameraPos = targetPos.clone().add(offset);
        this.camera.position.lerp(cameraPos, 0.1);
        this.camera.lookAt(targetPos);
        const tilt = (this.player.steer || 0) * 0.05;
        this.camera.rotation.z = tilt;
    }
}

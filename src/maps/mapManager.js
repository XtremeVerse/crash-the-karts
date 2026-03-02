import * as THREE from 'three';

export class MapManager {
    constructor(game) {
        this.game = game;
        this.current = null;
    }
    loadMap(id) {
        this.clearNonLights();
        const arenaSize = 100;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(arenaSize, arenaSize), new THREE.MeshPhongMaterial({ color: 0x333333 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.game.scene.add(floor);
        const obstacleGeom = new THREE.BoxGeometry(4, 2, 4);
        const obstacleMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
        for (let i = 0; i < 10; i++) {
            const obstacle = new THREE.Mesh(obstacleGeom, obstacleMat);
            obstacle.position.set(Math.random() * 80 - 40, 1, Math.random() * 80 - 40);
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            this.game.scene.add(obstacle);
        }
        const wallGeom = new THREE.BoxGeometry(arenaSize, 10, 2);
        const wallMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const wallNorth = new THREE.Mesh(wallGeom, wallMat);
        wallNorth.position.set(0, 5, -arenaSize / 2);
        this.game.scene.add(wallNorth);
        const wallSouth = new THREE.Mesh(wallGeom, wallMat);
        wallSouth.position.set(0, 5, arenaSize / 2);
        this.game.scene.add(wallSouth);
        const wallEast = new THREE.Mesh(wallGeom, wallMat);
        wallEast.position.set(arenaSize / 2, 5, 0);
        wallEast.rotation.y = Math.PI / 2;
        this.game.scene.add(wallEast);
        const wallWest = new THREE.Mesh(wallGeom, wallMat);
        wallWest.position.set(-arenaSize / 2, 5, 0);
        wallWest.rotation.y = Math.PI / 2;
        this.game.scene.add(wallWest);
        const grid = new THREE.GridHelper(arenaSize, 20, 0x444444, 0x222222);
        grid.position.y = 0.01;
        this.game.scene.add(grid);
        this.current = {
            spawnPoints: [
                new THREE.Vector3(0, 0.25, 0),
                new THREE.Vector3(20, 0.25, 20),
                new THREE.Vector3(-20, 0.25, -20),
                new THREE.Vector3(20, 0.25, -20),
                new THREE.Vector3(-20, 0.25, 20)
            ],
            bounds: arenaSize / 2 - 2
        };
    }
    clearNonLights() {
        const toRemove = [];
        this.game.scene.traverse(obj => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.GridHelper) {
                toRemove.push(obj);
            }
        });
        toRemove.forEach(o => this.game.scene.remove(o));
    }
}

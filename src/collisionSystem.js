import * as THREE from 'three';
export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }
    update(entities, delta) {
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const a = entities[i];
                const b = entities[j];
                if (!a.mesh || !b.mesh) continue;
                const ra = a.radius || 1;
                const rb = b.radius || 1;
                const pa = a.mesh.position;
                const pb = b.mesh.position;
                const diff = pb.clone().sub(pa);
                const dist = diff.length();
                const sum = ra + rb;
                if (dist < sum && dist > 0) {
                    const overlap = sum - dist;
                    const n = diff.clone().divideScalar(dist);
                    pa.addScaledVector(n.clone().negate(), overlap * 0.5);
                    pb.addScaledVector(n, overlap * 0.5);
                    const va = a.velocity ? a.velocity.clone() : this.estimateVelocity(a);
                    const vb = b.velocity ? b.velocity.clone() : this.estimateVelocity(b);
                    const rv = vb.clone().sub(va);
                    const vn = rv.dot(n);
                    if (vn < 0) {
                        const restitution = 0.5;
                        const impulse = (-(1 + restitution) * vn) / 2;
                        const jn = n.clone().multiplyScalar(impulse);
                        if (a.velocity) a.velocity.add(jn.clone().negate());
                        if (b.velocity) b.velocity.add(jn);
                        if (a.speed != null) a.speed *= 0.9;
                        if (b.speed != null) b.speed *= 0.9;
                    }
                    const relSpeed = rv.length();
                    if (relSpeed > 12) {
                        if (a.takeDamage) a.takeDamage(10);
                        if (b.takeDamage) b.takeDamage(10);
                    }
                }
            }
        }
    }
    estimateVelocity(e) {
        const dir = e.mesh.getWorldDirection(new THREE.Vector3()).negate();
        const s = e.speed || 0;
        return dir.multiplyScalar(s);
    }
}

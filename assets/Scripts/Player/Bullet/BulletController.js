const Emitter = require("../Event/Emitter");
const BulletEventKey = require("../Event/EventKeys/BulletEventKey");

cc.Class({
    extends: cc.Component,

    properties: {
        bulletPrefab: cc.Prefab,
        bulletSpeed: 10,
        bullets: [],
        bulletIdCounter: 0,
    },

    spawnBullet(position, damage) {
        let bullet = cc.instantiate(this.bulletPrefab);
        let localPos = this.node.parent.convertToNodeSpaceAR(position);
        bullet.setPosition(localPos);
        this.node.addChild(bullet);

        bullet.getComponent('BulletItem').init(this.bulletIdCounter, this.bulletSpeed, damage);
        this.bullets.push(bullet);
        this.bulletIdCounter++;
    },

    removeBulletById(bulletId) {
        let indexToRemove = -1;
        for (let i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].getComponent('BulletItem').id === bulletId) {
                indexToRemove = i;
                break;
            }
        }

        if (indexToRemove >= 0) {
            this.bullets.splice(indexToRemove, 1);
        }
    },
    onLoad() {
        this.eventMap = {
            [BulletEventKey.REMOVE_BULLET]: this.removeBulletById.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    clearBullet() {
        this.bullets.forEach((bullet) => {
            bullet.destroy();
        });
        this.bullets = [];
        this.bulletIdCounter = 0;
    },

    onDestroy() {
        Emitter.instance.removeEventMap(this.eventMap);
    },
});

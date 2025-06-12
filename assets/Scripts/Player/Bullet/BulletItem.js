const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");

cc.Class({
    extends: cc.Component,

    properties: {
        id: 0,
        speed: 0,
        damage: 0,
    },


    init(id, speed, damage) {
        this.id = id;
        this.speed = speed;
        this.damage = damage;
    },

    checkOutOfscene() {
        const worldPosition = this.node.parent.convertToWorldSpaceAR(this.node.position);
        if (worldPosition.x + this.node.width / 2 > cc.winSize.width - 100) {
            this.onDestroyBullet();
        }
    },
    update(dt) {
        if (this.isPaused) return;
        this.node.x += this.speed * dt;
        this.checkOutOfscene();
    },

    pauseBattle() {
        this.isPaused = true;
        console.log("Resume bullet actions", this.node);
        this.node.pauseAllActions();
    },

    resumeBattle() {
        this.isPaused = false;
        this.node.resumeAllActions();
    },

    onDestroyBullet() {
        Emitter.instance.emit(BulletEventKey.REMOVE_BULLET, this.id);
        this.node.destroy();
    },
});

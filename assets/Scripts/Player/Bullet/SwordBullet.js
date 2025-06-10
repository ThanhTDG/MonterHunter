const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");
const BulletItem = require("./BulletItem");

cc.Class({
    extends: BulletItem,

    properties: {
        stopDistance: 0.6,
        stayDuration: 2,
        rotationSpeed: 1440,
        damageInterval: 1,
        damageTargets: [],
    },

    init(id, speed, damage) {
        this.id = id;
        this.speed = speed;
        this.damage = damage;
        this.staying = false;
        this.stayTime = 0;
        this.travelledDistance = 0;
        this.damageTargets = [];
    },

    update(dt) {
        this.node.angle += this.rotationSpeed * dt;

        if (!this.staying) {
            const movement = this.speed * dt;
            this.node.x += movement;
            this.travelledDistance += movement;

            if (this.travelledDistance >= cc.winSize.width * this.stopDistance) {
                this.startStaying();
            }
        } else {
            this.stayTime += dt;

            if (this.stayTime >= this.stayDuration) {
                this.onDestroyBullet();
            }
        }
    },

    onCollisionEnter(other, self) {
        if (other.node.group === "monster" && !this.damageTargets.includes(other.node)) {
            this.damageTargets.push(other.node);
        }
    },

    onCollisionExit(other, self) {
        const index = this.damageTargets.indexOf(other.node);
        if (index !== -1) {
            this.damageTargets.splice(index, 1);
        }
    },

    startStaying() {
        this.staying = true;
        this.stayTime = 0;
        this.schedule(this.applyDamage, this.damageInterval);
    },

    applyDamage() {
        this.damageTargets = this.damageTargets.filter(target => cc.isValid(target));

        this.damageTargets.forEach(targetNode => {
            Emitter.instance.emit(BulletEventKey.APPLY_DAMAGE, this.id, targetNode);
        });
    },

    onDestroyBullet() {
        this.unschedule(this.applyDamage);
        this.damageTargets = [];
        BulletItem.prototype.onDestroyBullet.call(this);
    },
});

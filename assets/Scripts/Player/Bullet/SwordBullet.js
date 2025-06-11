const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");
const BulletItem = require("./BulletItem");
const { EntityGroup } = require("../../Enum/EntityGroup");

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
        if (other.node.group !== EntityGroup.MONSTER || this.damageTargets.includes(other.node)) {
            return;
        }

        this.damageTargets.push(other.node);
        this.applyDamageImmediately(other.node);

        if (this.staying) {
            this.schedule(this.applyDamage, this.damageInterval);
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
            targetNode.getComponent('MonsterItem').takeDamageMonster(this.damage);
        });
    },

    applyDamageImmediately(targetNode) {
        if (cc.isValid(targetNode)) {
            targetNode.getComponent('MonsterItem').takeDamageMonster(this.damage);
        }
    },

    onDestroyBullet() {
        this.unschedule(this.applyDamage);
        this.damageTargets = [];
        BulletItem.prototype.onDestroyBullet.call(this);
    },
});

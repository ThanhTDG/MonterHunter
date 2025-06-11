const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");
const {EntityGroup} = require("../../Enum/EntityGroup");
cc.Class({
    extends: require('BulletItem'),

    properties: {


    },

    onCollisionEnter(other, self) {
        if (other.node.group === EntityGroup.MONSTER) {
            Emitter.instance.emit(BulletEventKey.REMOVE_BULLET, this.id);
            other.node.getComponent('MonsterItem').takeDamageMonster(this.damage);
            this.onDestroyBullet();
        }
    },

});

const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");
cc.Class({
    extends: require('BulletItem'),

    properties: {


    },

    onCollisionEnter(other, self) {
        if (other.node.group === 'monster') {
            cc.log('hit');
            Emitter.instance.emit(BulletEventKey.REMOVE_BULLET, this.id);
            other.node.getComponent('MonsterItem').takeDamageMonster(this.damage);
            this.onDestroyBullet();
        }
    },

});

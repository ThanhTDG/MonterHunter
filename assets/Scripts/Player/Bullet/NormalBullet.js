const { EntityGroup } = require("../../Enum/EntityGroup");
const Emitter = require("../../Event/Emitter");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");
cc.Class({
	extends: require("BulletItem"),

	properties: {},

	onCollisionEnter(other, self) {
		if (other.node.group === EntityGroup.MONSTER) {
			if (!this.node._processed) {
				this.node._processed = true;

				let monster = other.node.getComponent("MonsterItem");
				if (
					monster &&
					(!monster._hitByBullet || monster._hitByBullet !== this.id)
				) {
					monster._hitByBullet = this.id;
					monster.takeDamageMonster(this.damage);
					Emitter.instance.emit(BulletEventKey.REMOVE_BULLET, this.id);
					this.onDestroyBullet();
				}
			}
		}
	},
});

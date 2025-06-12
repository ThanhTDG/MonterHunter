const Emitter = require("../../Event/Emitter");
const { PAUSE_BATTLE, RESUME_BATTLE } = require("../../Event/EventKeys/BattleEventKey");
const BulletEventKey = require("../../Event/EventKeys/BulletEventKey");

cc.Class({
	extends: cc.Component,

	properties: {
		bulletPrefab: cc.Prefab,
		ultimateBullet: cc.Prefab,
		ultimateSpawnPos: cc.Node,
		bulletSpeed: 10,
		bullets: [],
		bulletIdCounter: 0,
	},

	onLoad() {
		this.eventMap = {
			[BulletEventKey.REMOVE_BULLET]: this.removeBulletById.bind(this),
			[PAUSE_BATTLE]: this.onPauseBattle.bind(this),
			[RESUME_BATTLE]: this.onResumeBattle.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	onPauseBattle() {
		this.bullets.forEach(bullet => {
			bullet.getComponent("BulletItem").pauseBattle();
		});
		this.node.pauseAllActions();

	},
	onResumeBattle() {
		this.bullets.forEach(bullet => {
			bullet.getComponent("BulletItem").resumeBattle();
		});
		this.node.resumeAllActions();

	},


	spawnBullet(position, damage) {
		let bullet = cc.instantiate(this.bulletPrefab);
		let localPos = this.node.parent.convertToNodeSpaceAR(position);
		bullet.setPosition(localPos);
		this.node.addChild(bullet);
		bullet
			.getComponent("BulletItem")
			.init(this.bulletIdCounter, this.bulletSpeed, damage);
		this.bullets.push(bullet);
		this.bulletIdCounter++;
	},

	spawnUltimateBullet(baseDamage) {
		let ultimate = cc.instantiate(this.ultimateBullet);
		let localPos = this.ultimateSpawnPos.position;
		ultimate.setPosition(localPos);
		this.node.addChild(ultimate);
		ultimate
			.getComponent("BulletItem")
			.init(this.bulletIdCounter, this.bulletSpeed, baseDamage * 2);
		this.bullets.push(ultimate);
		this.bulletIdCounter++;
	},

	removeBulletById(bulletId) {
		let indexToRemove = -1;
		for (let i = 0; i < this.bullets.length; i++) {
			if (this.bullets[i].getComponent("BulletItem").id === bulletId) {
				indexToRemove = i;
				break;
			}
		}

		if (indexToRemove >= 0) {
			this.bullets.splice(indexToRemove, 1);
		}
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

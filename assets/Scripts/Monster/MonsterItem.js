const MonsterEventKey = require("MonsterEventKey");
const Emitter = require("Emitter");
const StateMachine = require("javascript-state-machine");
const MonsterState = require("MonsterState");
const { EntityGroup } = require("../Enum/EntityGroup");

cc.Class({
	extends: cc.Component,

	properties: {
		healthBar: cc.ProgressBar,
		spriteNode: cc.Node,
		maxHealth: 70,
		currentHealth: 70,
		damage: 5,
		speed: 100,
	},

	onLoad() {
		this.lastAttackTime = 0;
		this.canAttack = false;
		this.attackCallback = null;
		this.hitOnlyTimer = null;

		this.attackPlayer = this.attackPlayer.bind(this);
	},

	init(monsterData) {
		this.level = monsterData.level || 1;
		this.maxHealth = monsterData.health || 70 * this.level;
		this.currentHealth = this.maxHealth;
		this.damage = monsterData.damage || 5;
		this.speed = monsterData.speed || 100 + this.level * 50;
		this.healthBar.progress = 1;

		this.initFSM();

		this.scheduleOnce(() => {
			if (this.fsm.can(MonsterState.Transition.START_MOVING)) {
				this.fsm[MonsterState.Transition.START_MOVING]();
			}
		}, 1.5);
	},

	initFSM() {
		this.fsm = new StateMachine({
			init: MonsterState.State.IDLE,
			transitions: [
				{
					name: MonsterState.Transition.START_MOVING,
					from: MonsterState.State.IDLE,
					to: MonsterState.State.MOVING,
				},
				{
					name: MonsterState.Transition.GET_HIT,
					from: MonsterState.State.MOVING,
					to: MonsterState.State.HIT,
				},
				{
					name: MonsterState.Transition.RESUME,
					from: MonsterState.State.HIT,
					to: MonsterState.State.MOVING,
				},
				{
					name: MonsterState.Transition.DIE,
					from: [MonsterState.State.MOVING, MonsterState.State.HIT],
					to: MonsterState.State.DEAD,
				},
			],
			methods: {
				onEnterMoving: () => this.startWalking(),
				onEnterHit: () => this.pauseWalking(),
				onEnterDead: () => this.handleDeath(),
			},
		});
	},

	startWalking() {
		let moveDistance = -cc.winSize.width - 600;
		let moveTime = Math.abs(moveDistance) / this.speed;

		this.moveTween = cc
			.tween(this.node)
			.by(moveTime, { x: moveDistance })
			.call(() => {
				if (this.fsm.can(MonsterState.Transition.DIE)) {
					this.fsm[MonsterState.Transition.DIE]();
				}
			})
			.start();

		this.bounceTween = cc
			.tween(this.node)
			.repeatForever(cc.tween().by(0.3, { y: 5 }).by(0.3, { y: -5 }))
			.start();
	},

	pauseWalking() {
		if (this.moveTween) {
			this.moveTween.stop();
			this.moveTween = null;
		}
		if (this.bounceTween) {
			this.bounceTween.stop();
			this.bounceTween = null;
		}
	},

	resumeWalking() {
		if (this.fsm.can(MonsterState.Transition.RESUME)) {
			this.fsm[MonsterState.Transition.RESUME]();
		}
		if (!this.bounceTween) {
			this.bounceTween = cc
				.tween(this.node)
				.repeatForever(cc.tween().by(0.3, { y: 5 }).by(0.3, { y: -5 }))
				.start();
		}
	},

	takeDamageMonster(amount) {
		if (this.fsm.is(MonsterState.State.DEAD)) return;

		this.currentHealth -= amount;
		this.healthBar.progress = this.currentHealth / this.maxHealth;
		
		const worldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
		Emitter.instance.emit(MonsterEventKey.TAKE_DAMAGE, worldPos, amount, 1);

		if (this.currentHealth <= 0) {
			if (this.fsm.can(MonsterState.Transition.DIE)) {
				this.fsm[MonsterState.Transition.DIE]();
			}
		} else {
			this.handleHitByBullet();
		}
	},

	handleHitByBullet() {
		this.flashRedEffect();

		if (this.canAttack) {
			if (this.fsm.can(MonsterState.Transition.GET_HIT)) {
				this.fsm[MonsterState.Transition.GET_HIT]();
			}
			return;
		}

		if (this.fsm.can(MonsterState.Transition.GET_HIT)) {
			this.fsm[MonsterState.Transition.GET_HIT]();

			if (this.hitOnlyTimer) {
				this.unschedule(this.hitOnlyTimer);
				this.hitOnlyTimer = null;
			}

			this.hitOnlyTimer = () => {
				this.resumeWalking();
				this.hitOnlyTimer = null;
			};
			this.scheduleOnce(this.hitOnlyTimer, 1);
		}
	},

	flashRedEffect() {
		cc.tween(this.spriteNode)
			.to(0.1, { color: cc.Color.RED })
			.to(0.1, { color: cc.Color.WHITE })
			.start();
	},

	handleDeath() {
		this.stopAttacking();

		Emitter.instance.emit(MonsterEventKey.MONSTER_DEAD, {
			id: this.id,
			type: this.type,
			level: this.level,
			pos: this.node.getPosition(),
		});

		if (this.moveTween) {
			this.moveTween.stop();
		}
		if (this.bounceTween) {
			this.bounceTween.stop();
		}

		cc.tween(this.node)
			.to(0.5, { opacity: 0, y: this.node.y + 50 })
			.call(() => {
				this.node.destroy();
			})
			.start();
	},

	attackPlayer() {
		if (!this.canAttack || this.fsm.is(MonsterState.State.DEAD)) return;

		Emitter.instance.emit(MonsterEventKey.PLAYER_ATTACKED, {
			monsterId: this.id,
			damage: this.damage,
			type: this.type,
		});

		cc.tween(this.node).to(0.1, { scale: 1.2 }).to(0.1, { scale: 1.0 }).start();
	},

	stopAttacking() {
		if (this.attackCallback) {
			this.unschedule(this.attackCallback);
			this.attackCallback = null;
		}
	},

	damagePlayer(playerNode) {
		let playerController = playerNode.getComponent("PlayerController");
		if (playerController) {
			playerController.takeDamage(this.damage);
		}
	},

	onCollisionEnter(other) {
		if (other.node.group === EntityGroup.BULLET) {
			if (!this._hitByBullet || this._hitByBullet !== other.node.id) {
				this._hitByBullet = other.node.id;
				this.handleHitByBullet();

			}
		}


		if (other.node.group === EntityGroup.PLAYER) {
			if (!this.canAttack) {
				this.canAttack = true;

				if (this.fsm.can(MonsterState.Transition.GET_HIT)) {
					this.fsm[MonsterState.Transition.GET_HIT]();
				}

				this.attackPlayer();
				this.damagePlayer(other.node);

				this.attackCallback = () => {
					if (!this.node || !other.node) return;
					this.attackPlayer();
					this.damagePlayer(other.node);
				};
				this.schedule(this.attackCallback, 1.3);
			}
		}

		if (other.node.group === EntityGroup.BOUNDARY) {
			this.stopAttacking();
			this.node.destroy();
			Emitter.instance.emit(MonsterEventKey.MONSTER_END, {
				id: this.id,
				type: this.type,
				level: this.level,
				pos: this.node.getPosition(),
			});
		}
	},

	onCollisionExit(other) {
		if (other.node.group === EntityGroup.PLAYER) {
			this.canAttack = false;
			this.stopAttacking();
			this.resumeWalking();
		}
	},
});

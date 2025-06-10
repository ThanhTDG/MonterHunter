const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
const StateMachine = require('javascript-state-machine');
const MonsterState = require('MonsterState');
const { EntityGroup } = require('../Enum/EntityGroup');

cc.Class({
    extends: cc.Component,

    properties: {
        healthBar: cc.ProgressBar,
        spriteNode: cc.Node,
        maxHealth: 100,
        currentHealth: 100,
        damage: 50,
    },

    onLoad() {
        this.lastAttackTime = 0;
        this.canAttack = false;
        this.attackCallback = null;
        this.hitOnlyTimer = null;

        this.attackPlayer = this.attackPlayer.bind(this);
    },

    init(level = 1) {
        this.maxHealth = 100 * level;
        this.currentHealth = this.maxHealth;
        this.healthBar.progress = 1;
        this.level = level;
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
                { name: MonsterState.Transition.START_MOVING, from: MonsterState.State.IDLE, to: MonsterState.State.MOVING },
                { name: MonsterState.Transition.GET_HIT, from: MonsterState.State.MOVING, to: MonsterState.State.HIT },
                { name: MonsterState.Transition.RESUME, from: MonsterState.State.HIT, to: MonsterState.State.MOVING },
                { name: MonsterState.Transition.DIE, from: [MonsterState.State.MOVING, MonsterState.State.HIT], to: MonsterState.State.DEAD }
            ],
            methods: {
                onEnterMoving: () => this.startWalking(),
                onEnterHit: () => this.pauseWalking(),
                onEnterDead: () => this.handleDeath(),
            }
        });
    },

    startWalking() {
        this.moveTween = cc.tween(this.node)
            .by(7, { x: -cc.winSize.width - 600 })
            .call(() => {
                if (this.fsm.can(MonsterState.Transition.DIE)) {
                    this.fsm[MonsterState.Transition.DIE]();
                }
            })
            .start();

        this.bounceTween = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.3, { y: 5 })
                    .by(0.3, { y: -5 })
            )
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
            this.bounceTween = cc.tween(this.node)
                .repeatForever(
                    cc.tween()
                        .by(0.3, { y: 5 })
                        .by(0.3, { y: -5 })
                )
                .start();
        }
    },

    takeDamageMonster(amount) {
        if (this.fsm.is(MonsterState.State.DEAD)) return;

        this.currentHealth -= amount;
        this.healthBar.progress = this.currentHealth / this.maxHealth;

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
            pos: this.node.getPosition()
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

        Emitter.instance.emit(MonsterEventKey.PLAYER_ATTACKED, { // sự kiện đánh player
            monsterId: this.id,
            damage: this.damage,
            type: this.type
        });

        cc.tween(this.node)
            .to(0.1, { scale: 1.2 })
            .to(0.1, { scale: 1.0 })
            .start();
    },

    stopAttacking() {
        if (this.attackCallback) {
            this.unschedule(this.attackCallback);
            this.attackCallback = null;
        }
    },

    onCollisionEnter(other) {
        if (other.node.group === EntityGroup.BULLET) {
            this.handleHitByBullet();
        }

        if (other.node.group === EntityGroup.PLAYER) {
            if (!this.canAttack) {
                this.canAttack = true;

                if (this.fsm.can(MonsterState.Transition.GET_HIT)) {
                    this.fsm[MonsterState.Transition.GET_HIT]();
                }

                this.attackPlayer();

                this.attackCallback = this.attackPlayer;
                this.schedule(this.attackCallback, 1.3);
            }
        }

        if (other.node.group === EntityGroup.BOUNDARY) {
            this.stopAttacking();
            this.node.destroy();
            Emitter.instance.emit(MonsterEventKey.MONSTER_END);
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

const StateMachine = require("javascript-state-machine");
const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const PlayerState = require('PlayerState');
const { PAUSE_BATTLE, RESUME_BATTLE } = require("../Event/EventKeys/BattleEventKey");

cc.Class({
    extends: cc.Component,

    properties: {
        spine: sp.Skeleton,
        bulletController: cc.Node,
        bulletPos: cc.Node,
        playerHp: cc.ProgressBar,
    },

    onLoad() {
        this.registerEvents();
        this.setupFSM();
    },


    registerEvents() {
        this.eventMap = {
            [PlayerEventKey.PLAYER_MOVE]: this.onPlayerMove.bind(this),
            [PlayerEventKey.INCREASE_SHOOT_SPEED]: this.onIncreaseShootSpeed.bind(this),
            [PlayerEventKey.ACTIVATE_ULTIMATE]: this.onUltimateActivated.bind(this),
            [PAUSE_BATTLE]: this.onPauseBattle.bind(this),
            [RESUME_BATTLE]: this.onResumeBattle.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    init(playerData, listLane) {
        cc.log(playerData);
        this.hp = playerData.hp;
        this.maxHp = playerData.hp;
        this.damage = playerData.damage;
        this.shootSpeed = playerData.shootSpeed;
        this.originalShootSpeed = playerData.shootSpeed;
        this.moveSpeed = playerData.moveSpeed;
        this.collider = this.getComponent(cc.Collider);


        this.setUpLane(listLane);
        this.updateHpBar();
    },
    onPauseBattle() {
        this.node.pauseAllActions();
        if (this.movingTween) {
            this.movingTween.stop();
            this.movingTween = null;
        }
        this.unschedule(this.shootingSchedule);
        this.spine.timeScale = 0;
        console.log("Battle paused", this.spine);

    },
    onResumeBattle() {
        this.node.resumeAllActions();

        if (this.fsm.state === PlayerState.State.MOVING) {
            this.moveToTarget();
        } else if (this.fsm.state === PlayerState.State.SHOOTING) {
            this.startShooting();
        }
        this.spine.timeScale = 1;
        if (this.fsm.state === PlayerState.State.SHOOTING) {
            this.schedule(this.shootingSchedule, this.shootSpeed);
        }
    },
    setupFSM() {
        this.fsm = new StateMachine({
            init: PlayerState.State.NULL,
            transitions: [
                { name: PlayerState.Transition.INITIALIZE, from: PlayerState.State.NULL, to: PlayerState.State.READY },
                { name: PlayerState.Transition.MOVE, from: [PlayerState.State.SHOOTING], to: PlayerState.State.MOVING },
                { name: PlayerState.Transition.STOP, from: [PlayerState.State.MOVING, PlayerState.State.SHOOTING], to: PlayerState.State.STOP },
                {
                    name: PlayerState.Transition.SHOOT, from:
                        [PlayerState.State.READY, PlayerState.State.MOVING, PlayerState.State.STOP],
                    to: PlayerState.State.SHOOTING
                },
                { name: PlayerState.Transition.DIE, from: '*', to: PlayerState.State.DEAD },
            ],
            methods: {
                onInitialize: () => this.playPortalAnimation(),
                onMove: () => this.moveToTarget(),
                onStop: () => this.stopActions(),
                onShoot: () => this.startShooting(),
                onDie: () => this.handleDeath(),
            },
        });

        this.fsm.initialize();
    },

    setUpLane(listLane) {
        this.listPlayerPos = listLane.map(laneWorldPos => {
            return this.node.parent.convertToNodeSpaceAR(cc.v2(230, laneWorldPos.y));
        });

        this.currentLaneIndex = Math.min(1, this.listPlayerPos.length - 1);
        this.node.setPosition(this.listPlayerPos[this.currentLaneIndex]);
    },

    playPortalAnimation() {
        if (this.spine) {
            this.spine.setAnimation(0, "portal", false);
            this.spine.setCompleteListener(null);
            this.spine.setCompleteListener((trackEntry) => {
                if (trackEntry.animation.name === "portal") {
                    this.fsm.shoot();
                    this.spine.setAnimation(0, "idle", true);
                    this.spine.setCompleteListener(null);
                }
            });
        }
    },

    onPlayerMove(direction) {
        if (!this.fsm.can("move")) {
            cc.log(`Cannot move. Current state: ${this.fsm.state}`);
            return;
        }

        if (direction === "up" && this.currentLaneIndex > 0) {
            this.unschedule(this.shootingSchedule);
            this.moveUp();
        } else if (direction === "down" && this.currentLaneIndex < this.listPlayerPos.length - 1) {
            this.unschedule(this.shootingSchedule);
            this.moveDown();
        }
    },


    moveUp() {
        if (this.currentLaneIndex <= 0) return;

        this.currentLaneIndex--;
        this.targetPos = this.listPlayerPos[this.currentLaneIndex];
        this.fsm.move();
    },

    moveDown() {
        if (this.currentLaneIndex >= this.listPlayerPos.length - 1) return;

        this.currentLaneIndex++;
        this.targetPos = this.listPlayerPos[this.currentLaneIndex];
        this.fsm.move();
    },

    moveToTarget() {
        if (!this.targetPos) return;

        let dist = this.node.position.sub(this.targetPos).mag();
        let duration = dist / this.moveSpeed;

        this.movingTween = cc.tween(this.node)
            .to(duration, { position: this.targetPos }, { easing: "smooth" })
            .call(() => {
                if (this.fsm.can('stop')) {
                    this.fsm.stop();
                }
                if (this.fsm.can('shoot')) {
                    this.fsm.shoot();
                    this.shootingSchedule();
                }
            })
            .start();
    },

    startShooting() {
        if (this.fsm.state !== PlayerState.State.SHOOTING) {
            cc.log("Cannot shoot in the current state.");
            return;
        }

        this.unschedule(this.shootingSchedule);
        this.shootingSchedule = () => {
            if (this.fsm.state === PlayerState.State.SHOOTING) {
                this.bulletController.getComponent('BulletController').spawnBullet(this.getCurrentBulletPosition(), this.damage);
                this.spine.setAnimation(1, "shoot", false);
            }
        };

        this.shootingSchedule();
        this.schedule(this.shootingSchedule, this.shootSpeed);
    },

    getCurrentBulletPosition() {
        return this.bulletPos.convertToWorldSpaceAR(cc.v2(0, 0));
    },

    stopActions() {
        this.unschedule(this.shootingSchedule);
    },

    spawnBullet() {
        this.bulletController.getComponent('BulletController').spawnBullet(this.getCurrentBulletPosition(), this.damage);
    },

    onUltimateActivated() {
        this.bulletController.getComponent('BulletController').spawnUltimateBullet(this.damage);
    },

    onIncreaseShootSpeed({ multiplier, duration }) {
        this.shootSpeed /= multiplier;

        this.unschedule(this.shootingSchedule);
        this.shootingSchedule = () => {
            this.bulletController.getComponent('BulletController').spawnBullet(this.getCurrentBulletPosition(), this.damage);
            this.spine.setAnimation(1, "shoot", false);
        };
        this.schedule(this.shootingSchedule, this.shootSpeed);

        this.scheduleOnce(() => {
            this.shootSpeed = this.originalShootSpeed;
            this.unschedule(this.shootingSchedule);
            this.schedule(this.shootingSchedule, this.shootSpeed);
        }, duration);
    },


    getCurrentHealth() {
        return this.hp;
    },

    updateHpBar() {
        if (this.playerHp) {
            this.playerHp.progress = this.hp / this.maxHp;
        }
    },

    takeDamage(amount) {
        if (this.fsm.state === PlayerState.State.DEAD) {
            cc.log("Cannot take damage. Player is already dead.");
            return;
        }
        this.hp = Math.max(0, this.hp - amount);
        this.updateHpBar();

        if (this.hp <= 0 && this.fsm.state !== PlayerState.State.DEAD) {
            this.fsm.die();
            this.collider.enabled = false;

        }
        const worldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        Emitter.instance.emit(PlayerEventKey.PLAYER_HURT, worldPos, amount, 1);
    },

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.updateHpBar();
    },

    handleDeath() {
        this.stopActions();

        if (this.movingTween) {
            this.movingTween.stop();
            this.movingTween = null;
        }

        if (this.spine) {
            this.spine.setAnimation(0, "death", false);

            this.spine.setCompleteListener((trackEntry) => {
                if (trackEntry.animation.name === "death") {
                    this.clear();
                    this.unscheduleAllCallbacks();
                    Emitter.instance.emit(PlayerEventKey.PLAYER_DEAD);
                    this.spine.setCompleteListener(null);
                }
            });
        }
    },

    clear() {
        this.hp = 0;
        this.damage = 0;
        this.shootSpeed = 0;
        this.originalShootSpeed = 0;
        this.moveSpeed = 0;
        this.listPlayerPos = [];
        this.currentLaneIndex = 0;
        this.targetPos = null;
        this.stopActions();
        this.collider.enabled = false;

        if (this.spine) {
            this.spine.clearTrack(0);
        }
    },

    onDestroy() {
        this.clear();
        this.fsm = null;;
        Emitter.instance.removeEventMap(this.eventMap);
        this.unschedule(this.spawnBullet);
    },
});

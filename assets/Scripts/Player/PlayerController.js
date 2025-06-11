const StateMachine = require("javascript-state-machine");
const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const PlayerState = require('PlayerState');

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
            [PlayerEventKey.PLAYER_INIT]: this.onInit.bind(this),
            [PlayerEventKey.PLAYER_MOVE]: this.onPlayerMove.bind(this),
            [PlayerEventKey.INCREASE_SHOOT_SPEED]: this.onIncreaseShootSpeed.bind(this),
            [PlayerEventKey.ACTIVATE_ULTIMATE]: this.onUltimateActivated.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    onInit({ playerData, listLane }) {
        this.hp = playerData.hp;
        this.maxHp = playerData.hp;
        this.damage = playerData.damage;
        this.shootSpeed = playerData.shootSpeed;
        this.originalShootSpeed = playerData.shootSpeed;
        this.moveSpeed = playerData.moveSpeed;

        this.setUpLane(listLane);
        this.updateHpBar();
    },

    setupFSM() {
        this.fsm = new StateMachine({
            init: PlayerState.State.NULL,
            transitions: [
                { name: PlayerState.Transition.INITIALIZE, from: PlayerState.State.NULL, to: PlayerState.State.READY },
                { name: PlayerState.Transition.MOVE, from: [PlayerState.State.SHOOTING], to: PlayerState.State.MOVING },
                { name: PlayerState.Transition.STOP, from: [PlayerState.State.MOVING, PlayerState.State.SHOOTING], to: PlayerState.State.STOP },
                { name: PlayerState.Transition.SHOOT, from: ['*'], to: PlayerState.State.SHOOTING },
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

        this.unschedule(this.shootingSchedule);
        direction === "up" ? this.moveUp() : this.moveDown();
    },

    moveUp() {
        if (this.currentLaneIndex > 0) {
            this.currentLaneIndex--;
            this.targetPos = this.listPlayerPos[this.currentLaneIndex];
            this.fsm.move();
        }
    },

    moveDown() {
        if (this.currentLaneIndex < this.listPlayerPos.length - 1) {
            this.currentLaneIndex++;
            this.targetPos = this.listPlayerPos[this.currentLaneIndex];
            this.fsm.move();
        }
    },

    moveToTarget() {
        if (!this.targetPos) return;

        let dist = this.node.position.sub(this.targetPos).mag();
        let duration = dist / this.moveSpeed;

        cc.tween(this.node)
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
        if (!this.fsm.can('shoot')) {
            cc.log("Player cannot shoot in the current state.");
            return;
        }
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
        this.hp = Math.max(0, this.hp - amount);
        this.updateHpBar();

        if (this.hp <= 0) {
            this.fsm.die();
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

        if (this.spine) {
            this.spine.setAnimation(0, "death", false);
            this.spine.setCompleteListener(() => {
                this.clear();
                Emitter.instance.emit(PlayerEventKey.PLAYER_DEAD);
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

        if (this.spine) {
            this.spine.clearTrack(0);
        }
    },

    onDestroy() {
        this.fsm = null;
        Emitter.instance.removeEventMap(this.eventMap);
        this.unschedule(this.spawnBullet);
    },
});

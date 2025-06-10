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
    },

    onLoad() {
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
        this.damage = playerData.damage;
        this.shootSpeed = playerData.shootSpeed;
        this.originalShootSpeed = playerData.shootSpeed;
        this.moveSpeed = playerData.moveSpeed;


        this.setUpLane(listLane);
        this.setupFSM();
    },

    getCurrentHealth(){
        return this.hp;
    },

    setupFSM() {
        this.fsm = new StateMachine({
            init: PlayerState.State.NULL,
            transitions: [
                { name: PlayerState.Transition.INITIALIZE, from: PlayerState.State.NULL, to: PlayerState.State.READY },
                { name: PlayerState.Transition.MOVE, from: [PlayerState.State.SHOOTING], to: PlayerState.State.MOVING },
                { name: PlayerState.Transition.STOP, from: [PlayerState.State.MOVING, PlayerState.State.SHOOTING], to: PlayerState.State.STOP },
                { name: PlayerState.Transition.SHOOT, from: [PlayerState.State.STOP, PlayerState.State.READY, PlayerState.State.SHOOTING], to: PlayerState.State.SHOOTING },
            ],
            methods: {
                onInitialize: () => this.playPortalAnimation(),
                onMove: () => this.moveToTarget(),
                onStop: () => this.stopActions(),
                onShoot: () => this.startShooting(),
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
        if (!this.fsm.is("shooting")) {
            cc.log(`Cannot move. Current state: ${this.fsm.state}`);
            return;
        }

        direction === "up" ? this.moveUp() : this.moveDown();
    },

    moveUp() {
        if (this.currentLaneIndex > 0) {
            this.currentLaneIndex--;
            this.targetPos = this.listPlayerPos[this.currentLaneIndex];
            this.fsm.move();
        } else {
            cc.log("Already at top lane");
        }
    },

    moveDown() {
        if (this.currentLaneIndex < this.listPlayerPos.length - 1) {
            this.currentLaneIndex++;
            this.targetPos = this.listPlayerPos[this.currentLaneIndex];
            this.fsm.move();
        } else {
            cc.log("Already at bottom lane");
        }
    },

    moveToTarget() {
        if (!this.targetPos) return;

        let dist = this.node.position.sub(this.targetPos).mag();
        let duration = dist / this.moveSpeed;

        cc.tween(this.node)
            .to(duration, { position: this.targetPos }, { easing: "smooth" })
            .call(() => {
                this.fsm.stop();
                this.fsm.shoot();
            })
            .start();
    },

    onUltimateActivated() {
        this.bulletController.getComponent('BulletController').spawnUltimateBullet(this.damage);
    },

    startShooting() {
        this.unschedule(this.spawnBullet);
        this.schedule(this.spawnBullet, this.shootSpeed);
    },

    stopActions() {
        this.unschedule(this.spawnBullet);
    },

    spawnBullet() {
        this.spine.setAnimation(1, "shoot", false);
        const bulletWorldPos = this.bulletPos.convertToWorldSpaceAR(cc.v2(0, 0));
        this.bulletController.getComponent('BulletController').spawnBullet(bulletWorldPos, this.damage);
    },

    onIncreaseShootSpeed({ multiplier, duration }) {

        this.shootSpeed /= multiplier;
        this.unschedule(this.spawnBullet);
        this.schedule(this.spawnBullet, this.shootSpeed);

        this.scheduleOnce(() => {
            this.shootSpeed = this.originalShootSpeed;
            this.unschedule(this.spawnBullet);
            this.schedule(this.spawnBullet, this.shootSpeed);
        }, duration);
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

        if (this.fsm) {
            this.fsm.clear();
            this.fsm = null;
        }

        this.unschedule(this.spawnBullet);

        if (this.spine) {
            this.spine.clearTrack(0);
        }

    },

    onDestroy() {
        Emitter.instance.removeEventMap(this.eventMap);
        this.unschedule(this.spawnBullet);
    },
});

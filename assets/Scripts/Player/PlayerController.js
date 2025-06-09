const StateMachine = require("javascript-state-machine");
const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");

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
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    onInit({ playerData, listLane }) {
        this.hp = playerData.hp;
        this.damage = playerData.damage;
        this.shootSpeed = playerData.shootSpeed;
        this.moveSpeed = playerData.moveSpeed;


        this.setUpLane(listLane);
        this.setupFSM();
    },

    setupFSM() {
        this.fsm = new StateMachine({
            init: "null",
            transitions: [
                { name: "initialize", from: "null", to: "ready" },
                { name: "move", from: ["shooting"], to: "moving" },
                { name: "stop", from: ["moving", "shooting"], to: "stop" },
                { name: "shoot", from: ["stop", "ready", "shooting"], to: "shooting" },
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


    clear() {
        this.hp = 0;
        this.damage = 0;
        this.shootSpeed = 0;
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

        cc.log("Player data and state cleared.");
    },

    onDestroy() {
        Emitter.instance.removeEventMap(this.eventMap);
        this.unschedule(this.spawnBullet);
    },
});

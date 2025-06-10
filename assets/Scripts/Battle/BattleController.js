const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
const MonsterEventKey = require('MonsterEventKey');
const mapData = require('mapData');
cc.Class({
    extends: cc.Component,

    properties: {
        waveController: require('WaveController'),
        monsterController: require('MonsterController'),
        laneManager: require('LaneManager'),
        playerController: require('PlayerController'),
        scoreCal: require('ScoreCalculator'),
        monsterLayer: cc.Node,
        mapLabel: cc.Node,
        countDownLabel: cc.Node,
    },
    onLoad() {
        this.mapLabel.active = false;
        this.countDownLabel.active = false;

        this._onPlayerDead = this.onPlayerDead.bind(this);
        Emitter.instance.registerEvent(PlayerEventKey.PLAYER_DIED, this._onPlayerDead);
    },

    start() {
        this.init();
    },

    init() {
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        collisionManager.enabledDebugDraw = true;

        this.listLane = this.laneManager.returnListSpawn();
        this.initPlayerData();
        this.startBattle();
    },

    initPlayerData() {
        const playerData = {
            hp: 100,
            damage: 20,
            shootSpeed: 0.5,
            moveSpeed: 500,
        };
        this.sendInitEvent(playerData);
    },

    sendInitEvent(playerData) {
        Emitter.instance.emit(PlayerEventKey.PLAYER_INIT, { playerData, listLane: this.listLane });
    },


    startBattle(mapId = null) {
        const maps = mapData.maps;
        let selectedMap;
        if (mapId !== null && mapId !== undefined) {
            selectedMap = maps.find(m => m.id === mapId);
        } else {
            selectedMap = maps[maps.length - 1];
        }

        this.showMapLabel(selectedMap);

        const lanePos = this.laneManager.returnListSpawn();
        const waveData = selectedMap.waves;
        this.endTime = selectedMap.endTime || 15;

        let total = 0;
        for (const wave of waveData) {
            for (const monster of wave) {
                total += monster.count;
            }
        }
        this.totalMonsters = total;
        this.deadCount = 0;
        this.winDeclared = false;
        this.isPlayerDead = false;

        this.monsterController.init(this.monsterLayer, lanePos);
        this.waveController.init(waveData, this.monsterController);
        this.waveController.startWaves(() => this.onWaveFinished());
    },

    onWaveFinished() {
        this.startEndCountdown();
    },

    startEndCountdown() {
        if (this.countdownTimer != null) return;

        this.countdownTimer = this.endTime;

        this.endTimeCallback = () => {
            if (this.countdownTimer > 0) {
                cc.log(this.countdownTimer);
                this.countDownLabel.getComponent(cc.Label).string = this.countdownTimer;
            } else {
                this.countDownLabel.getComponent(cc.Label).string = "Kết Thúc";
                this.unschedule(this.endTimeCallback);
                this.scheduleOnce(() => {
                    this.countDownLabel.active = false;
                    // this.calculateScore();
                }, 1);
                return;
            }
            this.countdownTimer--;
            this.countDownLabel.active = true;
        };

        this.schedule(this.endTimeCallback, 1);
    },

    onPlayerDead() {
        this.isPlayerDead = true;
    },

    // calculateScore() {
    //     const deadCount = this.monsterController.getDeadCount();
    //     const currentHP = this.playerController.getCurrentHealt();

    //     cc.log(deadCount, currentHP);

    //     const score = this.scoreCal.calculate(deadCount, currentHP, this.isPlayerDead);
    //     cc.log("[BattleController] Điểm cuối cùng:", score);
    // },

    showMapLabel(selectedMap) {
        this.mapLabel.getComponent(cc.Label).string = selectedMap.name;
        this.mapLabel.active = true;
        this.mapLabel.opacity = 0;

        cc.tween(this.mapLabel)
            .to(2.5, { opacity: 255 })
            .delay(1.5)
            .to(1.5, { opacity: 0 })
            .call(() => {
                this.mapLabel.active = false;
                this.mapLabel.opacity = 255;
            })
            .start();
    },


    clearGame() {
        this.monsterController.clearAll();
        this.waveController.clear();
    },


});

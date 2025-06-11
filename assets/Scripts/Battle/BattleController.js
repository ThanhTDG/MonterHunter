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
        waveSlider: cc.Slider,
    },
    onLoad() {
        this.mapLabel.active = false;
        this.countDownLabel.active = false;

        this.waveSlider.progress = 0;
        this.waveSlider.interactable = false; 
        this.waveSlider.enabled = false; 
        const focus = this.waveSlider.node.getChildByName('Focus');
        if (focus) {
            focus.width = 0;
        }

        this._onPlayerDead = this.onPlayerDead.bind(this);
        Emitter.instance.registerEvent(PlayerEventKey.PLAYER_DIED, this._onPlayerDead);

        this._updateSlider = this.updateSlider.bind(this);
        Emitter.instance.registerEvent(MonsterEventKey.NEW_WAVE, this._updateSlider);
    },

    start() {
        this.init();
    },

    init() {
        this.isGameEnded = false;

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

        this.displayMapInfo(selectedMap);

        const lanePos = this.laneManager.returnListSpawn();

        this.waveData = selectedMap.waves;
        this.endTime = selectedMap.endTime || 15;

        let total = 0;
        for (const wave of this.waveData) {
            for (const monster of wave) {
                total += monster.count;
            }
        }
        this.totalMonsters = total;
        this.deadCount = 0;
        this.winDeclared = false;
        this.isPlayerDead = false;

        this.monsterController.init(this.monsterLayer, lanePos);
        this.waveController.init(this.waveData, this.monsterController);
        this.waveController.startWaves(() => this.onWaveFinished());

    },

    onWaveFinished() {
        this.scheduleOnce(() => {
            if (this.monsterController.areAllMonstersCleared()) {
                this.endBattle();
            } else {
                this.beginEndPhaseCountdown();
            }
        }, 1);
    },

    beginEndPhaseCountdown() {
        if (this.countdownTimer != null) return;

        if (this.monsterController.areAllMonstersCleared()) {
            this.endBattle();
            return;
        }

        this.countdownTimer = this.endTime;

        this.endTimeCallback = () => {
            if (this.isGameEnded) return;

            if (this.countdownTimer > 0) {

                cc.log(this.countdownTimer);

                this.countDownLabel.getComponent(cc.Label).string = this.countdownTimer;
            } else {
                this.countDownLabel.getComponent(cc.Label).string = "Kết Thúc Tệ";
                this.unschedule(this.endTimeCallback);
                this.scheduleOnce(() => {
                    this.countDownLabel.active = false;
                    this.calculateScore();
                }, 1);
                this.isGameEnded = true;
                return;
            }

            if (this.monsterController.areAllMonstersCleared()) {
                this.endBattle();
                return;
            }

            this.countdownTimer--;
            this.countDownLabel.active = true;
        };

        this.schedule(this.endTimeCallback, 1);
    },

    endBattle() {
        if (this.isGameEnded) return;
        this.isGameEnded = true;

        this.countDownLabel.getComponent(cc.Label).string = "Kết Thúc Đẹp";
        this.countDownLabel.active = true;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.countDownLabel.active = false;
            this.calculateScore();
        }, 1);
    },

    onPlayerDead() {
        this.isPlayerDead = false;
    },

    calculateScore() {
        const deadCount = this.monsterController.getDeadCount(); 
        const currentHP = this.playerController.getCurrentHealth(); 

        cc.log(deadCount, currentHP);

        const score = this.scoreCal.calculate(deadCount, currentHP, this.isPlayerDead);
        cc.log("[BattleController] Last Score:", score);
    },

    displayMapInfo(selectedMap) {
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

    updateSlider(data) { 
        let progressValue = data.newWave / data.totalWave;

        cc.tween(this.waveSlider)
            .to(0.5, { progress: progressValue })
            .call(() => this.updateVisual())
            .start();
        this.schedule(() => {
            this.updateVisual();
        }, 0.05, 10);

    },

    updateVisual() {
        const focus = this.waveSlider.node.getChildByName('Focus');
        focus.width = this.waveSlider.node.width * this.waveSlider.progress;
    },


    clearGame() {
        this.monsterController.clearAll();
        this.waveController.clear();
        Emitter.instance.removeEvent(PlayerEventKey.PLAYER_DIED, this._onPlayerDead);
        Emitter.instance.removeEvent(PlayerEventKey.PLAYER_DIED, this._updateSlider);
    },


});

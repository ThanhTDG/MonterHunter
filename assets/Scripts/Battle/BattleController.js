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
        monsterLayer: cc.Node,
        mapLabel: cc.Node,
        countDownLabel: cc.Node,
    },
    onLoad() {
        this.mapLabel.active = false;
        this.countDownLabel.active = false;

        // test lấy sự kiện trực tiếp
        this._onEndWave = this.startEndCountdown.bind(this);
        Emitter.instance.registerEvent(MonsterEventKey.END_WAVE, this._onEndWave);

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
        let selectedMap;
        const maps = mapData.maps;
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
        this.monsterController.init(this.monsterLayer, lanePos);
        this.waveController.init(waveData, this.monsterController, this.endTime);
        this.waveController.startWaves();
    },

    onMonsterDied() {
        this.deadCount++;
        if (this.deadCount >= this.totalMonsters) {
            this.waveController.cancelEndCountdown();


        }
    },

    clearGame() {
        this.monsterController.clearAll();
        this.waveController.clear();
        Emitter.instance.removeEvent(EventKey.END_WAVE, this._onEndWave);
    },

    showMapLabel(selectedMap) {
        this.mapLabel.getComponent(cc.Label).string = selectedMap.name;
        this.mapLabel.active = true;
        this.mapLabel.opacity = 0;

        cc.tween(this.mapName)
            .to(2.5, { opacity: 255 })
            .delay(1.5)
            .to(1.5, { opacity: 0 })
            .call(() => {
                this.mapLabel.active = false;
                this.mapLabel.opacity = 255;
            })
            .start();
    },

    startEndCountdown() {
        if (this.countdownTimer != null) return;

        this.countdownTimer = this.endTime;
        this.countDownLabel.active = true;

        this.endTimeCallback = () => {
            const remaining = this.monsterController.monsters;

            if (remaining <= 0) {
                this.stopCountdownIfRunning();
                this.countDownLabel.getComponent(cc.Label).string = "WIN";
                return;
            }

            if (this.countdownTimer > 0) {
                this.countDownLabel.getComponent(cc.Label).string = this.countdownTimer;
            } else {
                this.countDownLabel.getComponent(cc.Label).string = "LOSE";
                this.unschedule(this.endTimeCallback);
                this.scheduleOnce(() => {
                    this.countDownLabel.active = false;
                }, 1);
                
                return;
            }

            this.countdownTimer--;
        };

        this.schedule(this.endTimeCallback, 1);
    },

});

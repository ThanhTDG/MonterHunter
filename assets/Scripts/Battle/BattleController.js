const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
const { DataController } = require("../System/DataController");
cc.Class({
    extends: cc.Component,

    properties: {
        Lanes: cc.Node,
        waveController: require('WaveController'),
        monsterController: require('MonsterController'),
        laneManager: require('LaneManager'),
    },

    start() {
        this.init();
    },

    init() {
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        collisionManager.enabledDebugDraw = true;

        this.listLane = this.Lanes.getComponent('LaneManager').returnListSpawn();
        this.initPlayerData();
        this.startGame();
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


    startGame(mapId = null) {
        let selectedMap;
        const maps = DataController.instance.getMa.maps;
        if (mapId !== null && mapId !== undefined) {
            selectedMap = maps.find(m => m.id === mapId);
        } else {
            selectedMap = maps[maps.length - 1];
        }
        const lanePos = this.laneManager.returnListSpawn();
        const waveData = selectedMap.waves;
        const endTime = selectedMap.endTime || 15;
        let total = 0;
        for (const wave of waveData) {
            for (const monster of wave) {
                total += monster.count;
            }
        }
        this.totalMonsters = total;
        this.deadCount = 0;
        this.monsterController.init(this.monsterLayer, lanePos);
        this.waveController.init(waveData, this.monsterController, endTime);
        this.waveController.startWaves();
        // Emitter.instance.on(EventKey.MONSTER_END, xxx, this); nhận sự kiện end lane not kill
        // Emitter.instance.on(EventKey.MONSTER_DIE, onMonsterDied(), this); //nhận sự kiện bị kill
    },

    onMonsterDied() {
        this.deadCount++;
        if (this.deadCount >= this.totalMonsters) {
            this.waveController.cancelEndCountdown();
            Emitter.instance.emit(EventKey.END_GAME);
        }
    },

    clearGame() {
        this.monsterController.clearAll();
        this.waveController.clear();
        // Emitter.instance.off(EventKey.MONSTER_END, this.onMonsterDied, this);
    }
});

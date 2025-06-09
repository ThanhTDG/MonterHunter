const EventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
const mapData = require('mapData');

cc.Class({
    extends: cc.Component,

    properties: {
        waveController: require('WaveController'),
        monsterController: require('MonsterController'),
        laneManager: require('LaneManager'),
        monsterLayer: cc.Node,
    },

    onLoad() {
        this.startGame();
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        collisionManager.enabledDebugDraw = true;


    },

    startGame(mapId = null) {
        let selectedMap;
        const maps = mapData.maps;
        if (mapId !== null && mapId !== undefined) {
            selectedMap = maps.find(m => m.id === mapId);
        } else {
            selectedMap = maps[maps.length - 1]; // chọn map cuối cùng
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
        Emitter.instance.off(EventKey.MONSTER_END, this.onMonsterDied, this);
    }
});
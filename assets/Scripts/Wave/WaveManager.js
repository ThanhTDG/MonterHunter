const EventKey = require("MonsterEventKey");
const Emitter = require("Emitter");
const waveData = require("WaveData");

cc.Class({
    extends: cc.Component,

    properties: {
        totalWaves: 10, // check fix
    },

    init(factory, enemyLayer) {
        this.factory = factory;
        this.enemyLayer = enemyLayer;
        this.currentWave = 0;
    },

    startWaves() {
        this.scheduleOnce(() => this.spawnNextWave(), 1);
    },

    spawnNextWave() {
        const config = waveData[this.currentWave];
        if (!config) {
            cc.log("Hết wave!");
            Emitter.instance.emit(EventKey.END_WAVE);
            return;
        }

        const expanded = this.expandWaveData(config, this.currentWave + 1);

        this.currentWave++;
        expanded.forEach((monsterData, index) => {
            this.scheduleOnce(() => {
                this.factory.createMonster(monsterData.type, this.enemyLayer, monsterData.level);
            }, index * 0.4);
        });

        cc.log("Wave:", this.currentWave);

        this.scheduleOnce(() => this.spawnNextWave(), expanded.length * 0.4 + 4);
    },

    expandWaveData(waveConfig, level) {
        const result = [];
        waveConfig.forEach(mon => {
            for (let i = 0; i < mon.count; i++) {
                result.push({
                    type: mon.type,
                    level: level
                });
            }
        });
        return result;
    }
});
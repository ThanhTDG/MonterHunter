const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
cc.Class({
    extends: cc.Component,

    init(waveData, monsterController) {
        this.waves = waveData;
        this.currentWave = 0;
        this.totalWave = waveData.length;
        this.monsterController = monsterController;
        this.onAllWavesFinished = null;
    },

    startWaves(onFinishedCallback) {
        this.onAllWavesFinished = onFinishedCallback;
        this.scheduleOnce(() => this.spawnNextWave(), 1.5);
    },

    scheduleNextWave(delay = 0) {
        setTimeout(() => this.spawnNextWave(), delay * 1000);
    },

    spawnNextWave() {
        const config = this.waves[this.currentWave];
        if (!config) {
            if (this.onAllWavesFinished) {
                this.onAllWavesFinished();
            }
            return;
        }

        const level = this.currentWave + 1;
        const monsters = config;

        monsters.forEach((monsterData, index) => {
            this.scheduleOnce(() => {
                this.monsterController.spawnMonster(monsterData);
            }, index * 2);
        });

        this.currentWave++;
        let newWave = this.currentWave;

        Emitter.instance.emit(MonsterEventKey.NEW_WAVE, { totalWave: this.totalWave, newWave: newWave });
        this.scheduleNextWave(monsters.length * 1.5);
    },

    clear() {
        this.unscheduleAllCallbacks();
        this.currentWave = 0;
    }
});
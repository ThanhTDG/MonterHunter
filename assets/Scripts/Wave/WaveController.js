const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
cc.Class({
    extends: cc.Component,

    init(waveData, monsterController) {
        this.waves = waveData;
        this.currentWave = 0;
        this.monsterController = monsterController;
        this.onAllWavesFinished = null;
    },

    startWaves(onFinishedCallback) {
        this.onAllWavesFinished = onFinishedCallback;
        this.scheduleOnce(() => this.spawnNextWave(), 1);
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
        let monsters = [];

        config.forEach(mon => {
            for (let i = 0; i < mon.count; i++) {
                monsters.push({ type: mon.type, level });
            }
        });

        monsters.forEach((mons, index) => {
            this.scheduleOnce(() => {
                this.monsterController.spawnMonster(mons);
            }, index * 0.4);
        });

        this.currentWave++;
        this.scheduleOnce(() => this.spawnNextWave(), monsters.length * 0.4 + 4);
    },

    clear() {
        this.unscheduleAllCallbacks();
        this.currentWave = 0;
    }
});
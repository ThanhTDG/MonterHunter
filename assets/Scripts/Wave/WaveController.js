const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
cc.Class({
    extends: cc.Component,

    init(waveData, monsterController, endTime = 15) {
        this.waves = waveData;
        this.currentWave = 0;
        this.monsterController = monsterController;
        this.endTime = endTime;
        this.countdownTimer = null;
        this.endTimeCallback = null;
    },

    startWaves() {
        this.scheduleOnce(() => this.spawnNextWave(), 1);
    },

    spawnNextWave() {
        const config = this.waves[this.currentWave];
        if (!config) {
            Emitter.instance.emit(MonsterEventKey.END_WAVE);
            return;
        }

        const level = this.currentWave + 1;
        let monsters = [];

        config.forEach(mon => {
            for (let i = 0; i < mon.count; i++) {
                monsters.push({ type: mon.type, level });
            }
        });

        monsters.forEach((m, i) => {
            this.scheduleOnce(() => {
                this.monsterController.spawnMonster(m);
            }, i * 0.4);
        });

        this.currentWave++;
        this.scheduleOnce(() => this.spawnNextWave(), monsters.length * 0.4 + 4);
    },

    clear() {
        this.unscheduleAllCallbacks();
        Emitter.instance.removeEvent(MonsterEventKey.MONSTER_DIED, this._onMonsterDied);

    }
});
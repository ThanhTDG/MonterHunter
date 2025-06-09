const EventKey = require('MonsterEventKey');
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
            this.startEndCountdown();
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

    startEndCountdown() {
        if (this.countdownTimer) return;

        this.countdownTimer = this.endTime;
        this.endTimeCallback = () => {
            this.countdownTimer--;
            cc.log("Time left:", this.countdownTimer); // set label để hiện ui

            if (this.countdownTimer <= 0) {
                this.unschedule(this.endTimeCallback);

                const remaining = Object.keys(this.monsterController.monsters).length;
                if (remaining > 0) {
                    Emitter.instance.emit(EventKey.GAME_LOSE); // bắn sự kiện thua
                }
            }
        };

        this.schedule(this.endTimeCallback, 1);
    },

    cancelEndCountdown() {
        if (this.endTimeCallback) {
            this.unschedule(this.endTimeCallback);
            this.endTimeCallback = null;
        }
    },

    clear() {
        this.unscheduleAllCallbacks();
        this.cancelEndCountdown();
    }
});
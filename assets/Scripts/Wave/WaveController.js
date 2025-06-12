const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('../Event/Emitter')
const { PAUSE_BATTLE, RESUME_BATTLE } = require('../Event/EventKeys/BattleEventKey');
const { LAST_WAVE_FINISHED } = require('../Event/EventKeys/MonsterEventKey');
cc.Class({
	extends: cc.Component,
	onLoad() {
		this.registerEvents();
	},
	init(waveData, monsterController) {
		this.waves = waveData;
		this.currentWave = 0;
		this.totalWave = waveData.length;
		this.monsterController = monsterController;
		this.onAllWavesFinished = null;
	},

	registerEvents() {
		this.eventMap = {
			[PAUSE_BATTLE]: this.pauseBattle.bind(this),
			[RESUME_BATTLE]: this.resumeBattle.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	removeEvents() {
		if (!this.eventMap) {
			return;
		}
		Emitter.instance.removeEventMap(this.eventMap);
	},

	startWaves() {
		this.currentWave = 0;
		this.scheduleNextWave(1.5);
	},

	scheduleNextWave(delay = 0) {
		this.unschedule(this._nextWaveCallback);
		this._nextWaveCallback = () => this.spawnNextWave();
		this.scheduleOnce(this._nextWaveCallback, delay);
	},

	spawnNextWave() {
		const config = this.waves[this.currentWave];
		if (!config) {
			Emitter.instance.emit(LAST_WAVE_FINISHED);
			return;
		}
		const monsters = config;

		monsters.forEach((monsterData, index) => {
			this.scheduleOnce(() => {
				this.monsterController.spawnMonster(monsterData);
			}, index * 2);
		});

		this.scheduleOnce(() => {
			this.currentWave++;
			Emitter.instance.emit(MonsterEventKey.NEW_WAVE, {
				totalWave: this.totalWave,
				newWave: this.currentWave,
			});

			this.scheduleNextWave(monsters.length * 1);
		}, monsters.length * 1);
	},
	pauseBattle() {
		this.unscheduleAllCallbacks();
		this.node.pauseAllActions();
		this._isPaused = true;
	},
	resumeBattle() {
		this.node.resumeAllActions();
		this._isPaused = false;
		if (this.currentWave < this.totalWave) {
			this.scheduleNextWave(0);
		}
	},


	clear() {
		this.removeEvents();
		this.unscheduleAllCallbacks();
		this.currentWave = 0;
	},
	onDestroy() {
		this.removeEvents();
	}
});
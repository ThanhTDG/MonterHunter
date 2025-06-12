const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
const MonsterEventKey = require("../Event/EventKeys/MonsterEventKey");
const { DataController } = require("../System/DataController");
const { SoundController } = require("../Sound/SoundController");
const { AudioKey } = require("../Enum/AudioKey");

const PopupEventKeys = require("../Event/EventKeys/PopupEventKeys");
const { PopupType } = require("../Enum/popupType");
const { SoundConfigType } = require("../Enum/SoundConfigType");
const { calculateScore } = require("./ScoreCalculator");
const { getTotalMonster } = require("../Utils/MapUtils");
cc.Class({
	extends: cc.Component,

	properties: {
		waveController: require("WaveController"),
		monsterController: require("MonsterController"),
		laneManager: require("LaneManager"),
		playerController: require("PlayerController"),
		monsterLayer: cc.Node,
		mapLabel: cc.Node,
		countDownLabel: cc.Node,
		waveSlider: cc.Slider,
		scoreCurrent: cc.Label,
	},
	onLoad() {
		this.resetUI();
		this.initGameState();
		this.registerEvents();
	},
	start() {
		this.initBattle();
	},
	onDestroy() {
		this.removeEvents();
		this.stopBackgroundMusic();
	},
	onHidePausePopup() {
		if (this._isPaused) {
			this.resumeBattle();
			this._isPaused = false;
		}
		this.emitResumeBattle()
	},

	emitPauseBattle() {
		Emitter.instance.emit(BattleEventKey.PAUSE_BATTLE)
	},
	emitResumeBattle() {
		Emitter.instance.emit(BattleEventKey.RESUME_BATTLE)
	},

	resetGame() {
		this.emitResumeBattle()
		this.isGameEnded = false;
		this.isPlayerDead = false;
		this.winDeclared = false;

		this.clearCountdown();
		this.clearGame();
		this.resetUI();
		this.stopBackgroundMusic();

		this.scoreCurrent.string = `Monster killed: 0`;

		this.scheduleOnce(() => {
			this.initBattle();
		}, 0.1);
	},

	initGameState() {
		this.isGameEnded = false;
		this.isPlayerDead = false;
		this.deadCount = 0;
		this.winDeclared = false;

		const collisionManager = cc.director.getCollisionManager();
		collisionManager.enabled = true;
		this.listLane = this.laneManager.returnListSpawn();
	},
	initBattle() {
		this.startBackgroundMusic();
		this.initPlayerData();
		this.startBattle();
	},
	initPlayerData() {
		const playerData = DataController.instance.getPlayerStats();
		this.playerController.init(playerData, this.listLane);
	},
	pauseBattle() {
		if (this.isGameEnded) return;

		this.unscheduleAllCallbacks();
		this.node.pauseAllActions();
		this._isPaused = true;

		SoundController.pauseAll(SoundConfigType.EFFECT);

		this.unschedule(this.countdownCallback);

		this.countDownLabel.getComponent(cc.Label).string = "PAUSE";
		this.countDownLabel.active = true;

	},

	resumeBattle() {
		if (this.isGameEnded) {
			return;
		}
		SoundController.resumeAll(SoundConfigType.EFFECT);
		if (typeof this.countdownTimer === "number" && this.countdownTimer >= 0) {
			this.countDownLabel.getComponent(cc.Label).string = this.countdownTimer.toString();
			this.countDownLabel.active = true;
			this.unschedule(this.countdownCallback);
			this.schedule(this.countdownCallback, 1);
		} else {
			this.countDownLabel.getComponent(cc.Label).string = "";
			this.countDownLabel.active = false;
		}
	},

	startBattle() {
		this.mapId = DataController.instance.getSelectedMapId();
		let selectedMap = DataController.instance.getSelectedMap();
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
		this.updateScoreLabel();
		this.waveController.init(this.waveData, this.monsterController);
		this.waveController.startWaves();
	},

	registerEvents() {
		this.eventMap = {
			[PlayerEventKey.PLAYER_DEAD]: this.onPlayerDead.bind(this),
			[MonsterEventKey.NEW_WAVE]: this.updateSlider.bind(this),
			[MonsterEventKey.MONSTER_DEAD]: this.updateScoreLabel.bind(this),
			[PopupEventKeys.HIDE_SETTING_POPUP]: this.onHidePausePopup.bind(this),
			[BattleEventKey.RETRY_BATTLE]: this.resetGame.bind(this),
			[BattleEventKey.NEXT_BATTLE]: this.nextMap.bind(this),
			[BattleEventKey.PAUSE_BATTLE]: this.pauseBattle.bind(this),
			[BattleEventKey.RESUME_BATTLE]: this.resumeBattle.bind(this),
			[MonsterEventKey.LAST_WAVE_FINISHED]: this.onWaveFinished.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	removeEvents() {
		Emitter.instance.removeEventMap(this.eventMap);
	},

	startBackgroundMusic() {
		if (!this.isBGMPlaying) {
			SoundController.playSound(AudioKey.BATTLE_BGM, true);
			this.isBGMPlaying = true;
		}
	},
	stopBackgroundMusic() {
		if (this.isBGMPlaying) {
			SoundController.stopSound(AudioKey.BATTLE_BGM);
			this.isBGMPlaying = false;
		}
	},

	resetUI() {
		this.mapLabel.active = false;
		this.countDownLabel.active = false;
		this.waveSlider.progress = 0;
		this.waveSlider.interactable = false;
		this.waveSlider.enabled = false;
		const focus = this.waveSlider.node.getChildByName("Focus");
		if (focus) focus.width = 0;
	},

	updateSlider(data) {
		let progressValue = data.newWave / data.totalWave;

		cc.tween(this.waveSlider)
			.to(0.5, { progress: progressValue })
			.call(() => this.updateVisual())
			.start();
		this.schedule(
			() => {
				this.updateVisual();
			},
			0.05,
			10
		);
	},
	updateVisual() {
		const focus = this.waveSlider.node.getChildByName("Focus");
		if (focus)
			focus.width = this.waveSlider.node.width * this.waveSlider.progress;
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

	onWaveFinished() {
		this.scheduleOnce(() => {
			if (this.monsterController.areAllMonstersCleared()) {
				this.declareWin();
			} else {
				this.startCountdown();
			}
		}, 1);
	},

	startCountdown() {
		if (this.countdownTimer != null) return;

		this.countdownTimer = this.endTime;
		this.countDownLabel.active = true;

		this.countdownCallback = () => {
			if (this.isGameEnded) return;
			if (this.countdownTimer <= 0) {
				if (
					!this.monsterController.areAllMonstersCleared() ||
					this.isPlayerDead
				) {
					this.declareLose();
					return;
				}
			}
			if (this.monsterController.areAllMonstersCleared()) {
				this.countDownLabel.active = false;
				this.declareWin();
				return;
			}
			this.countDownLabel.getComponent(cc.Label).string =
				this.countdownTimer.toString();
			this.countdownTimer--;
		};
		this.schedule(this.countdownCallback, 1);
	},

	onPlayerDead() {
		this.isPlayerDead = true;
		this.declareLose();
	},

	getKillCount() {
		return this.monsterController.getDeadCount();
	},

	calculateScoreAndShowPopup(isPlayerDead) {
		const healthPoint = this.playerController.getCurrentHealth();
		const deadCount = this.getKillCount();
		const remainingCount = this.monsterController.getRemainingCount
			? this.monsterController.getRemainingCount()
			: 0;
		const playerAlive = !isPlayerDead;

		this.onEndBattle(healthPoint, deadCount, remainingCount, playerAlive);
	},

	getMaxPlayerHealth() {
		return DataController.instance.getPlayerStats().hp;
	},



	onEndBattle(healthPoint, deadCount) {
		const isVictory = healthPoint > 0;
		const healthRatio = healthPoint / this.getMaxPlayerHealth();
		const totalMonsters = getTotalMonster(this.mapId);
		const score = calculateScore(isVictory, { deadCount, healthRatio });
		const totalScore = calculateScore(true, { deadCount: totalMonsters, healthRatio: 1 });
		const recap = { score, totalScore };
		this.savePlayerRecord(score, isVictory);
		if (isVictory) {
			this.showVictoryPopup(recap);
		} else {
			this.showFailedPopup(recap);
		}
	},
	savePlayerRecord(score, isVictory) {
		const mapId = this.mapId;
		DataController.instance.setPlayerRecord(mapId, score, isVictory);
	},

	showVictoryPopup(recap) {
		const hasNextMap = DataController.instance.hasNextMap();
		const popupData = {
			score: recap.score,
			totalScore: recap.totalScore,
			hasNextMap: hasNextMap
		};
		Emitter.instance.emit(
			PopupEventKeys.SHOW_POPUP,
			PopupType.VICTORY,
			popupData
		);
	},

	showFailedPopup(recap) {
		Emitter.instance.emit(
			PopupEventKeys.SHOW_POPUP,
			PopupType.FAILED,
			recap
		);
	},

	updateScoreLabel() {
		this.scheduleOnce(() => {
			this.monsterController.forceUpdateDeadCount();
			let deadCount = this.getKillCount() || 0;
			this.scoreCurrent.string = `Monster killed: ${deadCount}`;
		}, 0.05);
	},

	declareWin() {
		if (this.isGameEnded) return;
		this.isGameEnded = true;

		this.countDownLabel.getComponent(cc.Label).string = "WIN!";
		this.countDownLabel.active = true;
		this.unschedule(this.countdownCallback);

		this.scheduleOnce(() => {
			this.emitPauseBattle();
			this.calculateScoreAndShowPopup(false);
		}, 3);
	},
	declareLose() {
		if (this.isGameEnded) return;
		this.isGameEnded = true;

		this.countDownLabel.getComponent(cc.Label).string = "LOSE!";
		this.countDownLabel.active = true;
		this.unschedule(this.countdownCallback);

		this.scheduleOnce(() => {
			this.emitPauseBattle();
			this.calculateScoreAndShowPopup(true);
			this.clearGame();
		}, 3);
	},

	nextMap() {
		DataController.instance.goToNextMap();
		this.resetGame();
	},

	clearCountdown() {
		if (this.countdownCallback) {
			this.unschedule(this.countdownCallback);
			this.countdownCallback = null;
			this.countdownTimer = null;
			this.countDownLabel.active = false;
			this.countDownLabel.getComponent(cc.Label).string = "";
		}
	},

	clearGame() {
		this.unscheduleAllCallbacks();
		this.monsterController.clearAll();
		this.waveController.clear();
		this.playerController.clear();
		SoundController.stopAllSound();
	},
	onDestroy() {
		this.removeEvents();
		this.clearGame();
		this.clearCountdown();
		this.stopBackgroundMusic();
		if (this._isPaused) {
			this.resumeBattle();
			this._isPaused = false;
		}
		if (this.countdownCallback) {
			this.unschedule(this.countdownCallback);
			this.countdownCallback = null;
			this.countdownTimer = null;
		}
		cc.director.getCollisionManager().enabled = false;
	}
});

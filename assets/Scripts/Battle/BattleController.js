const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
const MonsterEventKey = require("MonsterEventKey");
const { DataController } = require("../System/DataController");
const { SoundController } = require("../Sound/SoundController");
const { AudioKey } = require("../Enum/AudioKey");

const PopupEventKeys = require("../Event/EventKeys/PopupEventKeys");
const { PopupType } = require("../Enum/popupType");
cc.Class({
	extends: cc.Component,

	properties: {
		waveController: require("WaveController"),
		monsterController: require("MonsterController"),
		laneManager: require("LaneManager"),
		playerController: require("PlayerController"),
		scoreCal: require("ScoreCalculator"),
		monsterLayer: cc.Node,
		mapLabel: cc.Node,
		countDownLabel: cc.Node,
		waveSlider: cc.Slider,
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

	pauseGame() {
		if (this.isGameEnded) {
			return;
		}
		cc.director.pause();
		// test pause BMG
		this.stopBackgroundMusic();
		this.countDownLabel.getComponent(cc.Label).string = "PAUSE";
		this.countDownLabel.active = true;
	},
	resumeGame() {
		if (this.isGameEnded) {
			return;
		}
		cc.director.resume();
		// test pause BMG
		this.startBackgroundMusic();
		if (typeof this.countdownTimer === "number" && this.countdownTimer >= 0) {
			this.countDownLabel.getComponent(cc.Label).string =
				this.countdownTimer.toString();
			this.countDownLabel.active = true;
		} else {
			this.countDownLabel.getComponent(cc.Label).string = "";
			this.countDownLabel.active = false;
		}
	},
	resetGame() {
		cc.director.resume();

		this.isGameEnded = false;
		this.isPlayerDead = false;
		this.winDeclared = false;

		this.clearCountdown();
		this.clearGame();
		this.resetUI();
		this.stopBackgroundMusic();

		this.scheduleOnce(() => {
			this.startBackgroundMusic();
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
		collisionManager.enabledDebugDraw = true;
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
	sendInitEvent(playerData) {
		Emitter.instance.emit(PlayerEventKey.PLAYER_INIT, {
			playerData,
			listLane: this.listLane,
		});
	},
	startBattle() {
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
		this.waveController.init(this.waveData, this.monsterController);
		this.waveController.startWaves(() => this.onWaveFinished());
	},

	registerEvents() {
		this.eventMap = {
			[PlayerEventKey.PLAYER_DEAD]: this.onPlayerDead.bind(this),
			[MonsterEventKey.NEW_WAVE]: this.updateSlider.bind(this),
			[PopupEventKeys.HIDE_SETTING_POPUP]: this.resumeGame.bind(this),
			[BattleEventKey.RETRY_BATTLE]: this.resetGame.bind(this),
			[BattleEventKey.NEXT_BATTLE]: this.nextMap.bind(this),
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
				if (!this.monsterController.areAllMonstersCleared() || this.isPlayerDead) {
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
	calculateScoreAndShowPopup(isPlayerDead) {
		const healthPoint = this.playerController.getCurrentHealth();
		const deadCount = this.monsterController.getDeadCount();
		const remainingCount = this.monsterController.getRemainingCount ? this.monsterController.getRemainingCount() : 0;
		const playerAlive = !isPlayerDead;

		const scoreData = {
			healthPoint,
			deadCount,
			remainingCount,
			isPlayerDead,
		};

		const score = this.scoreCal.calculate(scoreData);

		cc.log("[BattleController] Final Score:", score);

		Emitter.instance.emit(PopupEventKeys.SHOW_POPUP, {
			score,
			playerAlive,
			deadCount,
		});
	},

	declareWin() {
		if (this.isGameEnded) return;
		this.isGameEnded = true;

		this.countDownLabel.getComponent(cc.Label).string = "WIN!";
		this.countDownLabel.active = true;
		this.unschedule(this.countdownCallback);

		this.scheduleOnce(() => {
			cc.director.pause();
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
			cc.director.pause();
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

		if (this.monsterController && this.monsterController.clearAll)
			this.monsterController.clearAll();
		if (this.waveController && this.waveController.clear)
			this.waveController.clear();
		if (this.playerController && this.playerController.clear)
			this.playerController.clear();
		SoundController.stopAllSound && SoundController.stopAllSound();
	},
});

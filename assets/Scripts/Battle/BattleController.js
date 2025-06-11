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
		this.mapLabel.active = false;
		this.countDownLabel.active = false;

		this.waveSlider.progress = 0;
		this.waveSlider.interactable = false;
		this.waveSlider.enabled = false;
		const focus = this.waveSlider.node.getChildByName("Focus");
		if (focus) {
			focus.width = 0;
		}

		this.registerEvents();
	},

	start() {
		this.init();
	},
	onDestroy() {
		this.removeEvents();
		this.stopBackgroundMusic();
	},

	registerEvents() {
		this.eventMap = {
			[PlayerEventKey.PLAYER_DIED]: this.onPlayerDead.bind(this),
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

	init() {
		this.isGameEnded = false;
		this.isPlayerDead = false;
		this.deadCount = 0;
		this.winDeclared = false;

		const collisionManager = cc.director.getCollisionManager();
		collisionManager.enabled = true;
		collisionManager.enabledDebugDraw = true;
		this.listLane = this.laneManager.returnListSpawn();
		this.startBackgroundMusic();
		this.initPlayerData();
		this.startBattle();
	},
	startBackgroundMusic() {
		SoundController.playSound(AudioKey.BATTLE_BGM, true);
	},
	stopBackgroundMusic() {
		SoundController.stopSound(AudioKey.BATTLE_BGM);
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

	onWaveFinished() {
		// event có thể dùng cho trường hợp này mà nhỉ ?
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
				if (!this.monsterController.areAllMonstersCleared()) {
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

	calculateScoreAndShowPopup(isPlayerDead) {
		const healthPoint = this.playerController.getCurrentHealth();
		const deadCount = this.monsterController.getDeadCount();
		// Trong controller này không có hàm cũng không có thuộc tính getRemainingCount,
		// Tại sao không quản lý bằng danh sách ? rồi có thể trừ đi mà nhỉ ?
		const remainingCount = this.monsterController.getRemainingCount
			? this.monsterController.getRemainingCount()
			: 0;

		const playerAlive = !isPlayerDead;
		const score = this.scoreCal.calculate(
			healthPoint,
			deadCount,
			remainingCount,
			playerAlive
		);

		cc.log("[BattleController] Final Score:", score);

		// Hiện popup endgame ở đây, bạn có thể gọi hàm showPopupEndgame(score, playerAlive)
		// Ví dụ:
		// this.showEndgamePopup(score, playerAlive);
	},

	onPlayerDead() {
		this.isPlayerDead = false;
	},

	pauseGame() {
		if (this.isGameEnded) {
			return;
		}
		cc.director.pause();
		this.countDownLabel.getComponent(cc.Label).string = "PAUSE";
		this.countDownLabel.active = true;
	},

	resumeGame() {
		if (this.isGameEnded) {
			return;
		}
		cc.director.resume();
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
		// tại sao lại phải xóa rồi đăng ký lại event ?
		// có những hàm chỉ init 1 lần duy nhất sao lại gọi cả init() ?
		cc.director.resume();
		this.clearCountdown();
		this.clearGame();
		this.removeEvents();
		this.resetUI();
		this.registerEvents();
		this.init();
	},

	nextMap() {
		DataController.instance.goToNextMap();
		this.resetGame();
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
		focus.width = this.waveSlider.node.width * this.waveSlider.progress;
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
		this.monsterController.clearAll();
		this.waveController.clear();
		this.playerController.clear();
		this.unscheduleAllCallbacks();
	},
});

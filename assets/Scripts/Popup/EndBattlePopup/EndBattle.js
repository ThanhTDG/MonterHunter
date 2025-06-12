const { SCENE_TRANSITIONS } = require("../../Enum/Scene");
const Emitter = require("../../Event/Emitter");
const { RETRY_BATTLE } = require("../../Event/EventKeys/BattleEventKey");
const { SceneController } = require("../../System/SceneController");
const {
	getTweenScoreLabel,
	getTweenGoldLabel,
	getTweenScaleAndSpin,
	getTweenStarPopupScale,
} = require("../../Utils/AnimationUtils");
const { getInterpolatedStepColor } = require("../../Utils/ColorUtils");

const EMPTY_START_COLOR = cc.color(24, 24, 24);
const STAR_COLOR = cc.color(255, 255, 255);
const COLORS_STEP = [
	cc.color(128, 128, 128),
	cc.color(192, 192, 192),
	cc.color(255, 191, 78),
];

cc.Class({
	extends: require("PopupItem"),
	properties: {
		stars: {
			default: [],
			type: [cc.Sprite],
		},
		goldLabel: cc.Label,
		scoreLabel: cc.Label,
		totalScoreLabel: cc.Label,
		retryButton: cc.Button,
		lobbyButton: cc.Button,
	},

	onLoad() {
		this._super();
		this.initialize();
	},
	initialize() {
		this.animations = [];
		this.resetAll();
	},
	resetAll() {
		this.resetLabel();
		this.resetStars();
	},
	show() {
		this._super();
		this.getScore();
		this.setTotalScoreLabel();
		this.displayStars();
		this.animateScore();
		this.animateGold();
	},
	registerEvents() {
		this.retryButton.node.on("click", this.handleRetry, this);
		this.lobbyButton.node.on("click", this.handleLobby, this);
	},
	removeEvents() {
		this.retryButton.node.off("click", this.handleRetry, this);
		this.lobbyButton.node.off("click", this.handleLobby, this);
	},
	handleRetry() {
		this.emitHide();
		Emitter.instance.emit(RETRY_BATTLE);
	},
	handleLobby() {
		this.emitHide();
		const lobbyTransition = SCENE_TRANSITIONS.TO_LOBBY;
		SceneController.toScene(lobbyTransition)
	},
	hide() {
		this._super();
		this.stopAllAnimations();
		this.resetAll();
	},
	setTotalScoreLabel() {
		this.totalScoreLabel.string = `/ ${this.totalScore}`;
	},
	resetLabel() {
		this.scoreLabel.string = "0";
		this.goldLabel.string = "0";
		this.totalScoreLabel.string = "/ 0";
	},

	getScore() {
		const data = this.getData();
		if (!data) {
			cc.error("VictoryPopup: getData() - data is not set");
			return;
		}
		const { score, totalScore } = data;
		this.score = Number(score);
		this.totalScore = Number(totalScore);
		this.gold = Number(score);
	},

	resetStars() {
		this.stars.forEach((star) => this.resetStar(star));
	},

	resetStar(node, scale = 0) {
		node.scale = scale;
		node.color = EMPTY_START_COLOR;
	},

	getStarColor(index, totalStars) {
		const percent = (index + 1) / totalStars;
		return getInterpolatedStepColor(percent, COLORS_STEP);
	},

	popupAllStars() {
		const popupTween = this.stars.map((star) => {
			const node = star.node;
			node.scale = 1;
			return new Promise((resolve) => {
				getTweenStarPopupScale(node).call(resolve).start();
			});
		});
		return Promise.all(popupTween);
	},

	showStarAtIndex(i, maxStars) {
		const starNode = this.stars[i].node;
		starNode.scale = 0;
		if (i < maxStars) {
			const color = this.getStarColor(i, this.stars.length);
			return () => {
				starNode.color = color;
				return this.animateStarBright(starNode);
			};
		} else {
			return () => {
				starNode.color = EMPTY_START_COLOR;
				return this.animateStarEmpty(starNode);
			};
		}
	},

	displayStars() {
		const maxStars = this.getMaxStars(this.score, this.totalScore);
		let promise = Promise.resolve();
		for (let i = 0; i < this.stars.length; i++) {
			const showStar = this.showStarAtIndex(i, maxStars);
			promise = promise.then(showStar);
		}
		if (maxStars === this.stars.length) {
			promise = promise.then(() => this.popupAllStars());
		}
		return promise;
	},

	pushTween(tween) {
		this.animations.push(tween);
		tween.start();
	},

	animateScore() {
		const tween = getTweenScoreLabel(
			this.scoreLabel,
			this.score,
			this.totalScore,
			COLORS_STEP
		);
		this.pushTween(tween);
	},

	animateGold() {
		const tween = getTweenGoldLabel(this.goldLabel, this.gold);
		this.pushTween(tween);
	},

	animateStar(node, color, createTween) {
		node.color = color;
		const tween = createTween(node);
		this.pushTween(tween);
		return new Promise((resolve) => {
			tween
				.call(() => {
					this.animations = this.animations.filter((anim) => anim !== tween);
					resolve();
				})
				.start();
		});
	},


	animateStarBright(node) {
		return this.animateStar(node, STAR_COLOR, getTweenScaleAndSpin);
	},

	animateStarEmpty(node) {
		return this.animateStar(node, EMPTY_START_COLOR, getTweenScaleAndSpin);
	},
	getMaxStars(score, totalScore) {
		if (!totalScore || totalScore === 0) return 0;
		return Math.floor((score / totalScore) * 3);
	},

	stopAllAnimations() {
		this.animations.forEach((anim) => anim.stop && anim.stop());
		this.animations = [];
	},
});

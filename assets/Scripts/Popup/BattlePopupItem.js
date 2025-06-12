const PopupItem = require("PopupItem");
const { RETRY_BATTLE } = require("../Event/EventKeys/BattleEventKey");
const { SCENE_TRANSITIONS, SceneName } = require("../Enum/Scene");
const { SceneController } = require("../System/SceneController");
const Emitter = require("../Event/Emitter");
cc.Class({
	extends: PopupItem,

	properties: {
		retryButton: cc.Button,
		lobbyButton: cc.Button,
	},

	show() {
		this.showBattleUi();
		this._super();
	},

	hide() {
		this.hideBattleUi();
		this._super();
	},

	showBattleUi() {
		this.isBattleScene = cc.director.getScene().name === SceneName.BATTLE;
		this.setBattleUiActive(this.isBattleScene);
	},

	hideBattleUi() {
		if (!this.isBattleScene) {
			return;
		}
		this.setBattleUiActive(false);
	},

	setBattleUiActive(isActive) {
		this.lobbyButton.node.active = isActive;
		this.retryButton.node.active = isActive;
	},

	registerEvents() {
		if (this.isBattleScene) {
			this.retryButton.node.on("click", this.handleRetry, this);
			this.lobbyButton.node.on("click", this.handleLobby, this);
		}
	},

	removeEvents() {
		if (this.isBattleScene) {
			this.retryButton.node.off("click", this.handleRetry, this);
			this.lobbyButton.node.off("click", this.handleLobby, this);
		}
	},

	handleRetry() {
		this.emitHide();
		Emitter.instance.emit(RETRY_BATTLE);
	},

	handleLobby() {
		this.emitHide();
		const transition = SCENE_TRANSITIONS.TO_LOBBY;
		SceneController.instance.toTransition(transition);
	},
});

const { AudioKey } = require("../../Enum/AudioKey");
const { PopupType } = require("../../Enum/popupType");
const { SceneName } = require("../../Enum/Scene");
const Emitter = require("../../Event/Emitter");
const { HIDE_SETTING_POPUP } = require("../../Event/EventKeys/PopupEventKeys");
const { EXIT_GAME } = require("../../Event/EventKeys/SystemEventKeys");
const { SoundController } = require("../../Sound/SoundController");

cc.Class({
	extends: require("BattlePopupItem"),

	properties: {
		popupType: {
			default: PopupType.SETTING,
			override: true,
			type: cc.Enum(PopupType),
		},
		exitButton: cc.Button,
		overlayButton: cc.Button,
		closeButton: cc.Button,
	},

	registerEvents() {
		this._super();
		this.exitButton.node.on("click", this.handleExit, this);
		this.overlayButton.node.on("click", this.handleHide, this);
		this.closeButton.node.on("click", this.handleHide, this);
	},
	removeEvents() {
		this._super();
		this.exitButton.node.off("click", this.handleExit, this);
		this.overlayButton.node.off("click", this.handleHide, this);
		this.closeButton.node.off("click", this.handleHide, this);
	},

	handleExit() {
		this.emitHide();
		Emitter.instance.emit(EXIT_GAME);
	},
	handleHide() {
		this.emitHide();
	},
	emitHide() {
		SoundController.playSound(AudioKey.CLICK);
		Emitter.instance.emit(HIDE_SETTING_POPUP);
	},
});

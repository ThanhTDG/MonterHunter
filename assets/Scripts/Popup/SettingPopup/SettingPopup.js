const { AudioKey } = require("../../Enum/AudioKey");
const { PopupType } = require("../../Enum/popupType");
const { SoundController } = require("../../Sound/SoundController");

cc.Class({
	extends: require("PopupItem"),

	properties: {
		popupType: {
			default: PopupType.SETTING,
			override: true,
			type: cc.Enum(PopupType),
		},
		overlayButton: cc.Button,
		closeButton: cc.Button,
	},

	registerEvents() {
		this._super();
		this.overlayButton.node.on("click", this.handleHide, this);
		this.closeButton.node.on("click", this.handleHide, this);
	},
	removeEvents() {
		this._super();
		this.overlayButton.node.off("click", this.handleHide, this);
		this.closeButton.node.off("click", this.handleHide, this);
	},

	handleHide() {
		this.emitHide();
	},
	emitHide() {
		this._super();
		SoundController.playSound(AudioKey.CLICK);
	},
});

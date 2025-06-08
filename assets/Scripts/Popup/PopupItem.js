const { PopupType } = require("../Enum/popupType");
const { HIDE_POPUP } = require("../Event/EventKeys/PopupEventKeys");
const Emitter = require("../Event/Emitter");
cc.Class({
	extends: cc.Component,

	properties: {
		canStack: false,
		popupType: {
			default: PopupType.DEFAULT,
			type: cc.Enum(PopupType),
		},
	},

	show() {
		this.node.active = true;
	},
	hide() {
		this.node.active = false;
	},
	emitHide() {
		Emitter.instance.emit(HIDE_POPUP, this.popupType);
	},
});

const { PopupType } = require("../Enum/popupType");
const { HIDE_POPUP } = require("../Event/EventKeys/PopupEventKeys");
const Emitter = require("../Event/Emitter");
cc.Class({
	extends: cc.Component,

	properties: {
		popupType: {
			default: PopupType.DEFAULT,
			type: cc.Enum(PopupType),
		},
	},
	onLoad() {
		this.node.active = false;
	},
	show() {
		this.node.active = true;
	},
	hide() {
		this.node.active = false;
	},
	isShowing() {
		return this.node.active;
	},
	emitHide() {
		if (this.popupType === PopupType.DEFAULT) {
			cc.error("PopupItem: emitHide() - popupType is not set");
			return;
		}
		Emitter.instance.emit(HIDE_POPUP, this.popupType);
	},

});

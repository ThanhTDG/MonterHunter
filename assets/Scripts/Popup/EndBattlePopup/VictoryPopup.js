const { PopupType } = require("../../Enum/popupType");
const Emitter = require("../../Event/Emitter");
const { NEXT_BATTLE } = require("../../Event/EventKeys/BattleEventKey");

cc.Class({
	extends: require("EndBattlePopup"),
	properties: {
		popupType: {
			default: PopupType.VICTORY,
			override: true,
			type: cc.Enum(PopupType),
		},
		nextMapButton: cc.Button,
	},

	show() {
		this.showNextMap();
		this._super();
	},
	showNextMap() {
		const { hasNextMap } = this.getData();
		this.hasNextMap = hasNextMap;
		this.nextMapButton.node.active = this.hasNextMap;
	},
	registerEvents() {
		this._super();
		if (this.hasNextMap) {
			this.nextMapButton.node.on("click", this.handleNextMap, this);
		}
	},
	removeEvents() {
		this._super();
		if (this.hasNextMap) {
			this.nextMapButton.node.off("click", this.handleNextMap, this);
		}
	},

	handleNextMap() {
		this.emitHide();
		Emitter.instance.emit(NEXT_BATTLE);
	},
});

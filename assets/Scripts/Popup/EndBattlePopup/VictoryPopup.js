const { PopupType } = require("../../Enum/popupType");
const Emitter = require("../../Event/Emitter");
const { NEXT_BATTLE } = require("../../Event/EventKeys/BattleEventKey");

cc.Class({
	extends: require("./EndBattle"),
	properties: {
		popupType: {
			default: PopupType.VICTORY,
			override: true,
			type: cc.Enum(PopupType),
		},
		nextMapButton: cc.Button,
		overlayNextMapButton: cc.Button,
	},

	show() {
		this._super();
		this.showNextMap();
	},
	showNextMap() {
		const { hasNextMap } = this.getData();
		this.overlayNextMapButton.node.active = !hasNextMap;
	},
	registerEvents() {
		this._super();
		this.nextMapButton.node.on("click", this.handleNextMap, this);
	},
	removeEvents() {
		this._super();
		this.nextMapButton.node.off("click", this.handleNextMap, this);
	},

	handleNextMap() {
		this.emitHide();
		Emitter.instance.emit(NEXT_BATTLE);
	},
});

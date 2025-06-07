const Emitter = require("../Scripts/Event/Emitter");
const { EXIT } = require("../Scripts/Event/EventKeys/SystemEventKeys");

cc.Class({
	extends: cc.Component,

	properties: {},
	onClickExit() {
		Emitter.instance.emit(EXIT);
		console.log("Exit button clicked, emitting EXIT event.");
	},
});

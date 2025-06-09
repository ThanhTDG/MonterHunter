const { SceneName } = require("./Enum/SceneName");
const Emitter = require("./Event/Emitter");
const loadingEventsKeys = require("./Event/EventKeys/LoadingEventKeys");
const { EXIT } = require("./Event/EventKeys/SystemEventKeys");
const { SoundController } = require("./Sound/SoundController");
const { SceneController } = require("./System/SceneController");

cc.Class({
	extends: cc.Component,

	properties: {
		popupController: require("./Popup/PopupController"),
	},
	onLoad() {
		this.initialize();
	},

	initialize() {
		cc.game.addPersistRootNode(this.node);
		this.registerEvents();
	},
	registerEvents() {
		this.eventMap = {
			[loadingEventsKeys.START_LOADING]: this.startLoading.bind(this),
			[EXIT]: this.terminate.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	startLoading() {
		let totalAssets = 0;
		let loadedCount = 0;
		const checkLoaded = () => {
			loadedCount++;
			this.handleLoading(loadedCount, totalAssets);
		};
		const onTotal = (amount) => {
			totalAssets += amount;
		}
		totalAssets += SoundController.instance.preLoad(checkLoaded);
		totalAssets += SceneController.instance.preLoad(checkLoaded);
		this.popupController.preLoad(checkLoaded, onTotal);
	},

	handleLoading(loadedCount, total) {
		const percent = loadedCount / total;
		this.emitLoading(percent);
		if (loadedCount >= total) {
			this.emitLoadingComplete();
		}
	},
	emitLoadingComplete() {
		const loadedCallback = () => {
			SceneController.instance.loadScene(SceneName.LOBBY);
		};
		Emitter.instance.emit(loadingEventsKeys.LOADING_COMPLETE, loadedCallback);
	},

	emitLoading(percent) {
		Emitter.instance.emit(loadingEventsKeys.LOADING, percent);
	},

	removeEvents() {
		Emitter.instance.removeEventMap(this.eventMap);
	},
	releaseInstances() {
		SceneController.instance.destroy();
		SoundController.instance.destroy();
		this.popupController.destroy();
		Emitter.instance.destroy();
	},

	terminate() {
		this.removeEvents();
		this.releaseInstances();
		cc.game.removePersistRootNode(this.node);
		cc.director.loadScene("Portal");
	},
});

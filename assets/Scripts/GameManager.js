const { SceneName, SCENE_TRANSITIONS } = require("./Enum/Scene");
const Emitter = require("./Event/Emitter");
const loadingEventsKeys = require("./Event/EventKeys/LoadingEventKeys");
const { EXIT_GAME } = require("./Event/EventKeys/SystemEventKeys");
const { SoundController } = require("./Sound/SoundController");
const { DataController } = require("./System/DataController");
const { SceneController } = require("./System/SceneController");

const AssetType = {
	SOUND: "sound",
	SCENE: "scene",
	POPUP: "popup",
	DATA: "data",
}

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
			[EXIT_GAME]: this.terminate.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	startLoading() {
		const totalAssets = this.createAssetMap(0);
		const loadedCount = this.createAssetMap(0);
		let lastPercent = 0;

		const checkLoaded = (type) => {
			loadedCount[type]++;
			lastPercent = this.handleLoading(loadedCount, totalAssets, lastPercent);
		};

		const onTotal = (type, amount) => {
			totalAssets[type] += amount;
		};

		const preLoad = (controller, type) => {
			console.log(`Preloading ${type}...`);
			controller.preLoad(
				() => checkLoaded(type),
				(amount) => onTotal(type, amount)
			);
		};

		preLoad(SoundController.instance, AssetType.SOUND);
		preLoad(SceneController.instance, AssetType.SCENE);
		preLoad(this.popupController, AssetType.POPUP);
		preLoad(DataController.instance, AssetType.DATA);
	},

	createAssetMap(defaultValue) {
		return Object.values(AssetType).reduce((acc, type) => {
			acc[type] = defaultValue;
			return acc;
		}, {});
	},

	getTotalAsset(map) {
		return Object.values(map).reduce((total, count) => total + count, 0);
	},
	handleLoading(loadedCount, totalAssets, lastPercent) {
		const types = Object.keys(loadedCount);
		const weight = 1 / types.length;
		let percent = 0;
		types.forEach(type => {
			const loaded = loadedCount[type] || 0;
			const total = totalAssets[type] || 0;
			if (total === 0) {
				return;
			}
			percent += (loaded / total) * weight;
		});
		percent = Math.min(percent, 1);
		if (percent === lastPercent) {
			return lastPercent;
		} else {
			this.emitLoading(percent);
		}
		if (percent >= 1) {
			this.emitLoadingComplete();
		}
	},
	emitLoadingComplete() {
		const loadedCallback = () => {
			const transition = SCENE_TRANSITIONS.TO_LOBBY;
			SceneController.instance.toTransition(transition);
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

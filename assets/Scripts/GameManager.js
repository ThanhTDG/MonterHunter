const { SceneName } = require("./Enum/SceneName");
const Emitter = require("./Event/Emitter");
const {
	START_LOADING,
	LOADING,
} = require("./Event/EventKeys/LoadingEventKeys");
const { AudioPath } = require("./Sound/AudioConfigs");
const { SoundController } = require("./Sound/SoundController");
const { SceneController } = require("./System/SceneController");

const { loadAudioClip } = require("./Utils/FileUtils");
cc.Class({
	extends: cc.Component,

	properties: {},
	onLoad() {
		this.initialize();
	},
	start() {},

	initialize() {
		cc.game.addPersistRootNode(this.node);
		this.registerEvents();
	},
	registerEvents() {
		this.eventMap = {
			[START_LOADING]: this.startLoading.bind(this),
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
		totalAssets += this.preLoadSound(checkLoaded);
		totalAssets += this.preLoadScene(checkLoaded);
	},

	preLoadScene(onLoaded) {
		const names = Object.values(SceneName);
		names.forEach((sceneName) => {
			cc.director.preloadScene(sceneName, null, (error, asset) => {
				if (!error) {
					onLoaded();
				} else {
					cc.error(`Preload scene error for ${sceneName}:`, error);
				}
			});
		});
		return names.length;
	},

	preLoadSound(onLoaded) {
		const sounds = Object.keys(AudioPath);
		sounds.forEach((key) => {
			const path = AudioPath[key];
			loadAudioClip(path, key, (clip) => {
				SoundController.instance.setAudioClip(key, clip);
				onLoaded();
			});
		});
		return sounds.length;
	},

	handleLoading(loadedCount, total) {
		const percent = loadedCount / total;
		this.emitLoading(percent);
		if (loadedCount >= total) {
			SceneController.instance.state.toLobby();
		}
	},

	emitLoading(percent) {
		Emitter.instance.emit(LOADING, percent);
	},

	onDestroy() {
		SoundController.instance.destroy();
		SceneController.instance.destroy();
		Emitter.instance.removeEventMap(this.eventMap);
		Emitter.instance.destroy();
	},
});

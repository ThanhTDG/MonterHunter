const { SceneName } = require("./Enum/SceneName");
const Emitter = require("./Event/Emitter");
const loadingEventsKeys = require("./Event/EventKeys/LoadingEventKeys");
const { EXIT } = require("./Event/EventKeys/SystemEventKeys");
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
	releaseSounds() {
		const sounds = Object.keys(AudioPath);
		sounds.forEach((key) => {
			const path = AudioPath[key];
			const clip = SoundController.instance.getAudioClip(key);
			if (clip) {
				cc.loader.releaseAsset(clip);
				SoundController.instance.setAudioClip(key, null);
			}
		});
		SoundController.instance.destroy();
	},
	releaseEvents() {
		Emitter.instance.removeEventMap(this.eventMap);
		Emitter.instance.destroy();
	},

	terminate() {
		SceneController.instance.destroy();
		this.releaseSounds();
		this.releaseEvents();
		cc.game.removePersistRootNode(this.node);
		cc.director.loadScene("Portal");
	},
});

const { AudioKey } = require("./Enum/AudioKey");
const Emitter = require("./Event/Emitter");
const { AudioPath } = require("./Sound/AudioConfigs");
const { SoundController } = require("./Sound/SoundController");
const { loadAudioClip } = require("./Utils/FileUtils");

cc.Class({
	extends: cc.Component,

	properties: {},
	statics: {
		isFirstLoad: true,
	},
	onLoad() {
		initializeFirstLoad();
	},
	start() { },

	initializeFirstLoad() {
		let isFirstLoad = this.statics.isFirstLoad;
		if (!isFirstLoad) {
			return;
		}
		this.statics.isFirstLoad = false;
		cc.game.addPersistRootNode(this.node);
		this.loadSound();
	},
	loadSound() {
		Object.keys(AudioPath).forEach((key) => {
			const path = AudioPath[key];
			loadAudioClip(path, key, (clip) => {
				console.log(key);
				SoundController.instance.setAudioClip(key, clip);
			});
		});
	},
	onDestroy() {
		SoundController.instance.destroy();
		Emitter.instance.destroy();
	},
});

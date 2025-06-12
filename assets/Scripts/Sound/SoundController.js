const { loadAudioClip } = require("../Utils/IOUtils");
const { AudioKey, AudioPath } = require("./AudioConfigs");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");
const { SoundConfigValidator, SoundConfigItem } = require("./SoundConfigItem");

class PlayingItem {
	constructor(id, type, key) {
		this.id = id;
		this.type = type;
		this.key = key;
	}
}

export class SoundController {
	static _instance = null;

	constructor() {
		this.playing = [];
		this.configMap = {};
		this.audioMap = {};
		this.initializeMaps();
	}

	static get instance() {
		if (!SoundController._instance) {
			SoundController._instance = new SoundController();
		}
		return SoundController._instance;
	}

	static playSound(audioKey, loop = false) {
		if (SoundController._instance) {
			SoundController._instance.playSound(audioKey, loop);
		}
	}
	static stopSound(audioKey) {
		if (SoundController._instance) {
			SoundController._instance.stopSound(audioKey);
		}
	}
	static pauseSound(audioKey) {
		if (SoundController._instance) {
			SoundController._instance.pauseSound(audioKey);
		}
	}
	static pauseAll(type) {
		if (SoundController._instance) {
			SoundController._instance.pauseAll(type);
		}
	}
	static resumeAll(type) {
		if (SoundController._instance) {
			SoundController._instance.resumeAll(type);
		}
	}
	static stopAllSound() {
		if (SoundController._instance) {
			SoundController._instance.stopAllSound();
		}
	}

	initializeMaps() {
		Object.values(ConfigType).forEach((type) => {
			this.configMap[type] = SoundConfigItem.createDefault(type);
		});
		Object.keys(AudioKey).forEach((key) => {
			this.audioMap[key] = null; // chỉ lưu clip
		});
	}

	preLoad(onLoaded, onLoad) {
		const files = Object.keys(AudioPath);
		if (onLoad) onLoad(files.length);
		files.forEach((key) => {
			const name = AudioPath[key];
			loadAudioClip(name, (audioClip) => {
				this.setAudioClip(key, audioClip);
				onLoaded();
			});
		});
	}

	playSound(audioKey, loop = false) {
		const clip = this.getAudioClip(audioKey);
		const type = this.getTypeByKey(audioKey);
		if (!clip) {
			cc.warn(`Audio clip not found for key: ${audioKey}`);
			return;
		}
		const id = this.play(type, clip, loop);
		if (id == null) {
			cc.error(`Failed to play sound for key: ${audioKey}`);
			return;
		}
		if (!loop) {
			cc.audioEngine.setFinishCallback(id, () => {
				this.removePlayingItem(id);
			});
		}
		this.addPlayingItem(id, type, audioKey);
	}

	addPlayingItem(id, type, key) {
		this.playing.push(new PlayingItem(id, type, key));
	}

	removePlayingItem(id) {
		this.playing = this.playing.filter((item) => item.id !== id);
	}

	getPlayingItemByKey(key) {
		return this.playing.find((item) => item.key === key);
	}

	stopSound(audioKey) {
		const playingItem = this.getPlayingItemByKey(audioKey);
		if (playingItem) {
			cc.audioEngine.stop(playingItem.id);
			this.removePlayingItem(playingItem.id);
		}
	}

	stopAllSound() {
		cc.audioEngine.stopAll();
		this.playing = [];
	}

	pauseSound(audioKey) {
		const playingItem = this.getPlayingItemByKey(audioKey);
		if (playingItem) {
			cc.audioEngine.pause(playingItem.id);
		}
	}

	pauseAll(type) {
		this.playing.forEach((item) => {
			if (item.type === type || type === ConfigType.MASTER) {
				cc.audioEngine.pause(item.id);
			}
		});
	}

	resumeAll(type) {
		this.playing.forEach((item) => {
			if (item.type === type || type === ConfigType.MASTER) {
				cc.audioEngine.resume(item.id);
			}
		});
	}

	updateVolume(type) {
		this.playing.forEach((item) => {
			if (item.type === type || type === ConfigType.MASTER) {
				this.setVolume(item.id, item.type);
			}
		});
	}

	getConfigMap() {
		return this.configMap;
	}

	setDefault(type) {
		const defaultItem = SoundConfigItem.createDefault(type);
		this.configMap[type].applyConfig(defaultItem);
		this.updateVolume(type);
	}

	setAllDefault() {
		Object.values(ConfigType).forEach((type) => this.setDefault(type));
		this.updateVolume(ConfigType.MASTER);
	}

	getTypeByKey(key) {
		const type = AudioKey[key];
		if (!type) {
			cc.error(`Invalid audio key: ${key}`);
			return null;
		}
		return type;
	}

	getConfig(type) {
		SoundConfigValidator.validateType(type);
		return this.configMap[type];
	}

	setConfig(type, config) {
		this.configMap[type].applyConfig(config);
		this.updateVolume(type);
	}

	calculateVolume(type) {
		const item = this.getConfig(type);
		const master = this.getConfig(ConfigType.MASTER);
		if (!item.canPlay() || !master.canPlay()) {
			return 0;
		}
		return item.volume * master.volume;
	}

	setVolume(id, type) {
		if (id == null) {
			return;
		}
		const volume = this.calculateVolume(type);
		cc.audioEngine.setVolume(id, volume);
	}

	play(type, clip, loop = false) {
		const volume = this.calculateVolume(type);
		return cc.audioEngine.play(clip, loop, volume);
	}

	setAudioClip(key, clip) {
		const oldClip = this.audioMap[key];
		if (oldClip) {
			cc.loader.releaseAsset(oldClip);
		}
		this.audioMap[key] = clip;
	}

	getAudioClip(key) {
		return this.audioMap[key];
	}

	releaseSounds() {
		Object.keys(this.audioMap).forEach((key) => {
			const clip = this.audioMap[key];
			if (clip) {
				cc.loader.releaseAsset(clip);
				this.audioMap[key] = null;
			}
		});
	}

	destroy() {
		this.releaseSounds();
		this.configMap = null;
		this.audioMap = null;
		cc.audioEngine.stopAll();
		SoundController._instance = null;
	}
}

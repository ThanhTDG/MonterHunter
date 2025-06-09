const { loadAudioClip } = require("../Utils/FileUtils");
const { AudioItem } = require("./AudioItem");
const { AudioKey, AudioPath } = require("./AudioConfigs");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");
const { SoundConfigValidator, SoundConfigItem } = require("./SoundConfigItem");
const EventKey = require("../Event/EventKeys/SoundEventKeys");
const Emitter = require("../Event/Emitter");
export class SoundController {
	static _instance = null;

	constructor() {
		this.configMap = {};
		this.audioMap = {};
		this.eventMap = {};
		this.initializeMaps();
		this.registerEvents();
	}

	static get instance() {
		if (!SoundController._instance) {
			SoundController._instance = new SoundController();
		}
		return SoundController._instance;
	}

	initializeMaps() {
		Object.values(ConfigType).forEach((type) => {
			this.configMap[type] = SoundConfigItem.createDefault(type);
		});
		Object.keys(AudioKey).forEach((key) => {
			this.audioMap[key] = AudioItem.createDefault();
		});
	}
	registerEvents() {
		this.eventMap = {
			[EventKey.PLAY_SOUND]: this.playSound.bind(this),
			[EventKey.STOP_SOUND]: this.stopSound.bind(this),
			[EventKey.SET_SOUND_CONFIG]: this.setConfig.bind(this),
			[EventKey.SET_DEFAULT_SOUND_CONFIG]: this.setDefault.bind(this),
			[EventKey.SET_ALL_DEFAULT_SOUND_CONFIG]: this.setAllDefault.bind(this),
			[EventKey.GET_SOUND_CONFIG]: this.getConfig.bind(this),
			[EventKey.GET_ALL_SOUND_CONFIG]: this.getConfigMap.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	}

	preLoad(onLoaded, onLoad) {
		const files = Object.keys(AudioPath);
		if (onLoad) {
			onLoad(files.length);
		}
		files.forEach((key) => {
			const name = AudioPath[key];
			loadAudioClip(name, (audioClip) => {
				this.setAudioClip(key, audioClip);
				onLoaded();
			});
		});
	}

	playSound(audioKey, loop = false) {
		const audioItem = this.getAudioItem(audioKey);
		const type = this.getTypeByKey(audioKey);
		if (!audioItem.hasClip()) {
			cc.error(`Audio item or clip not found for key: ${audioKey}`);
			return;
		}
		const id = this.play(type, audioItem.getClip(), loop);
		if (id == null) {
			cc.error(`Failed to play sound for key: ${audioKey}`);
			return;
		}
		if (!loop) {
			cc.audioEngine.setFinishCallback(id, () => {
				audioItem.setId(null);
			});
		}
		audioItem.setId(id);
	}
	getConfigMap() {
		return this.configMap;
	}

	stopSound(audioKey) {
		const audioItem = this.getAudioItem(audioKey);
		if (audioItem && audioItem.getId() != null) {
			cc.audioEngine.stop(audioItem.getId());
			audioItem.setId(null);
		}
	}

	setDefault(type) {
		this.configMap[type] = SoundConfigItem.createDefault(type);
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

	getAudioItem(audioKey) {
		if (!this.audioMap[audioKey]) {
			cc.error(`Invalid audio key: ${audioKey}`);
			return null;
		}
		return this.audioMap[audioKey];
	}

	setConfig(config) {
		const { type } = config;
		this.configMap[type] = config;
		this.updateVolume(type);
	}

	updateVolume(type) {
		Object.keys(this.audioMap).forEach((key) => {
			const audioItem = this.getAudioItem(key);
			const soundType = this.getTypeByKey(key);
			if (!audioItem || !soundType) return;
			if (soundType === type || type === ConfigType.MASTER) {
				this.setVolume(audioItem.getId(), soundType);
			}
		});
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
		const audioItem = this.getAudioItem(key);
		if (audioItem.getClip() !== null) {
			cc.loader.releaseAsset(audioItem.getClip());
		}
		audioItem.setClip(clip);
	}
	getAudioClip(key) {
		const audioItem = this.getAudioItem(key);
		return audioItem.getClip();
	}

	stopAllSound() {
		cc.audioEngine.stopAll();
		Object.values(this.audioMap).forEach((audioItem) => {
			if (audioItem) audioItem.setId(null);
		});
	}

	releaseSounds() {
		const files = Object.keys(AudioPath);
		files.forEach((key) => {
			const clip = this.getAudioClip(key);
			if (clip) {
				cc.loader.releaseAsset(clip);
				this.setAudioClip(key, null);
			}
		});
	}
	removeEvents() {
		Emitter.instance.removeEventMap(this.eventMap);
	}

	destroy() {
		this.configMap = null;
		this.audioMap = null;
		cc.audioEngine.stopAll();
		this.removeEvents();
		this.releaseSounds();
		SoundController._instance = null;
	}
}

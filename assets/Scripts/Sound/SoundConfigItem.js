const { VolumeValidate, EnumValidate } = require("../Utils/ValidatesUtils");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

class Config {
	static default = {
		[ConfigType.MASTER]: { volume: 1.0, enable: true },
		[ConfigType.MUSIC]: { volume: 1.0, enable: true },
		[ConfigType.EFFECT]: { volume: 1.0, enable: true },
	};

	static get(type) {
		return this.default[type];
	}
}

export class SoundConfigValidator {
	static validateType(type) {
		if (!EnumValidate(type, ConfigType)) {
			throw new Error(`Invalid sound type: ${type}`);
		}
	}

	static validateVolume(volume) {
		if (VolumeValidate(volume) === false) {
			throw new Error(
				`Invalid volume: ${volume}. Volume must be a number between 0 and 1.`
			);
		}
	}

	static validateEnable(enable) {
		if (typeof enable !== "boolean") {
			throw new Error(
				`Invalid enable value: ${enable}. Enable must be a boolean.`
			);
		}
	}
}

export class SoundConfigItem {
	constructor(type, volume, enable) {
		this.type = type;
		this.volume = volume;
		this.enable = enable;
	}

	setVolume(volume) {
		SoundConfigValidator.validateVolume(volume);
		this.volume = volume;
	}

	setEnable(enable) {
		SoundConfigValidator.validateEnable(enable);
		this.enable = enable;
	}

	canPlay() {
		return this.enable && this.volume > 0;
	}

	static getDefaultConfig() {
		return Config.default;
	}

	static create(type, volume, enable) {
		SoundConfigValidator.validateType(type);
		SoundConfigValidator.validateVolume(volume);
		SoundConfigValidator.validateEnable(enable);
		return new SoundConfigItem(type, volume, enable);
	}

	static createDefault(type) {
		const config = Config.get(type);
		return new SoundConfigItem(type, config.volume, config.enable);
	}
}

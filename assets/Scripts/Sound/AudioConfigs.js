const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.MUSIC]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.Effect,
	[Key.COIN]: ConfigType.Effect,
};
export const AudioPath = {
	[Key.MUSIC]: "bgm",
	[Key.CLICK]: "click",
	[Key.COIN]: "coin_counting",
};

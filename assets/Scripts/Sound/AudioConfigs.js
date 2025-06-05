const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.MUSIC]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.Effect,
	[Key.COIN]: ConfigType.Effect,
};
export const AudioPath = {
	[Key.MUSIC]: "Sounds/bgm",
	[Key.CLICK]: "Sounds/click",
	[Key.COIN]: "Sounds/coin_counting",
};

const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.LOBBY_BGM]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.EFFECT,
	[Key.POPUP_OPEN]: ConfigType.EFFECT,
	
};
export const AudioPath = {
	[Key.LOBBY_BGM]: "bgm_lobby",
	[Key.CLICK]: "effect_click",
	[Key.POPUP_OPEN]: "effect_popup",
};

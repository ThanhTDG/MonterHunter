const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.LOBBY_BGM]: ConfigType.MUSIC,
	[Key.BATTLE_BGM]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.EFFECT,
	[Key.POPUP_OPEN]: ConfigType.EFFECT,
	[Key.GAME_START]: ConfigType.EFFECT,
	[Key.UPGRADE]: ConfigType.EFFECT,

};
export const AudioPath = {
	[Key.LOBBY_BGM]: "bgm_lobby",
	[Key.BATTLE_BGM]: "bgm_battle",
	[Key.CLICK]: "effect_click",
	[Key.POPUP_OPEN]: "effect_popup",
	[Key.GAME_START]: "effect_game_start",
	[Key.UPGRADE]: "effect_upgrade",
};

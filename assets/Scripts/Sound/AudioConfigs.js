const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.LOBBY_BGM]: ConfigType.MUSIC,
	[Key.BATTLE_BGM]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.EFFECT,
	[Key.POPUP_OPEN]: ConfigType.EFFECT,
	[Key.GAME_START]: ConfigType.EFFECT,
	[Key.UPGRADE]: ConfigType.EFFECT,
	[Key.SKILL_ULTIMATE]: ConfigType.EFFECT,
	[Key.LOSE]: ConfigType.EFFECT,
	[Key.VICTORY]: ConfigType.EFFECT,
	[Key.TAKE_DAMAGE]: ConfigType.EFFECT,
	[Key.SHOOT]: ConfigType.EFFECT,
};
export const AudioPath = {
	[Key.LOBBY_BGM]: "bgm_lobby",
	[Key.BATTLE_BGM]: "bgm_battle",
	[Key.CLICK]: "effect_click",
	[Key.POPUP_OPEN]: "effect_popup",
	[Key.GAME_START]: "effect_game_start",
	[Key.UPGRADE]: "effect_upgrade",
	[Key.SKILL_ULTIMATE]: "effect_skill_ultimate",
	[Key.LOSE]: "effect_lose",
	[Key.VICTORY]: "effect_victory",
	[Key.TAKE_DAMAGE]: "effect_take_damage",
	[Key.SHOOT]: "effect_shoot",
};

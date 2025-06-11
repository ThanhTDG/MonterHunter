const { AudioKey: Key } = require("../Enum/AudioKey");
const { SoundConfigType: ConfigType } = require("../Enum/SoundConfigType");

export const AudioKey = {
	[Key.LOBBY_BGM]: ConfigType.MUSIC,
	[Key.BATTLE_BGM]: ConfigType.MUSIC,
	[Key.CLICK]: ConfigType.EFFECT,
	[Key.GAME_START]: ConfigType.EFFECT,
	[Key.UPGRADE]: ConfigType.EFFECT,
	[Key.SKILL_ULTIMATE]: ConfigType.EFFECT,
	[Key.LOSE]: ConfigType.EFFECT,
	[Key.VICTORY]: ConfigType.EFFECT,
	[Key.PLAYER_TAKE_DAMAGE]: ConfigType.EFFECT,
	[Key.PLAYER_SHOOT]: ConfigType.EFFECT,
};

export const AudioPath = {
	[Key.LOBBY_BGM]: "bgm_lobby",
	[Key.BATTLE_BGM]: "bgm_battle",
	[Key.CLICK]: "effect_click",
	[Key.GAME_START]: "effect_game_start",
	[Key.UPGRADE]: "effect_upgrade",
	[Key.SKILL_ULTIMATE]: "effect_skill_ultimate",
	[Key.LOSE]: "effect_lose",
	[Key.VICTORY]: "effect_victory",
	[Key.PLAYER_TAKE_DAMAGE]: "effect_player_take_damage",
	[Key.PLAYER_SHOOT]: "effect_player_shoot",
};

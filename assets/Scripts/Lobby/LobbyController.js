const { AudioKey } = require("../Enum/AudioKey");
const { PopupType } = require("../Enum/popupType");
const { SCENE_TRANSITIONS } = require("../Enum/Scene");
const Emitter = require("../Event/Emitter");
const { SHOW_POPUP } = require("../Event/EventKeys/PopupEventKeys");
const { SoundController } = require("../Sound/SoundController");
const { DataController } = require("../System/DataController");
const { SceneController } = require("../System/SceneController");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.initialize();
    },
    initialize() {
        this.playBackgroundMusic();
    },

    onClickOpenSetting() {
        SoundController.playSound(AudioKey.CLICK)
        Emitter.instance.emit(SHOW_POPUP, PopupType.SETTING)
    },

    onClickPlayGame() {
        SoundController.playSound(AudioKey.GAME_START)
        const battle = SCENE_TRANSITIONS.TO_BATTLE
        SceneController.toScene(battle);
    },

    onSelectMap() {
        SoundController.playSound(AudioKey.CLICK)
        Emitter.instance.emit(SHOW_POPUP, PopupType.SELECTMAP)
    },

    playBackgroundMusic() {
        SoundController.playSound(AudioKey.LOBBY_BGM, true);
    },
    stopBackgroundMusic() {
        SoundController.stopSound(AudioKey.LOBBY_BGM);
    },
    beforeDestroy() {
        this.stopBackgroundMusic();
    },
    onDestroy() {
        this.beforeDestroy();
    }
});

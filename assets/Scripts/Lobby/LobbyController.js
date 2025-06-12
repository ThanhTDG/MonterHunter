const { AudioKey } = require("../Enum/AudioKey");
const { PopupType } = require("../Enum/popupType");
const { SCENE_TRANSITIONS } = require("../Enum/Scene");
const Emitter = require("../Event/Emitter");
const { SHOW_POPUP } = require("../Event/EventKeys/PopupEventKeys");
const { EXIT_GAME } = require("../Event/EventKeys/SystemEventKeys");
const { SoundController } = require("../Sound/SoundController");
const { SceneController } = require("../System/SceneController");
const { DataController } = require("DataController");

cc.Class({
    extends: cc.Component,

    properties: {
        labelCurrenMap: cc.Label,
        exitButton: cc.Button,
    },

    onLoad() {
        this.initialize();
        this.exitButton.node.on('click', () => {
            Emitter.instance.emit(EXIT_GAME)
        });
    },
    initialize() {
        this.playBackgroundMusic();
        const mapName = DataController.instance.getCurrentMap().name;
        this.labelCurrenMap.string = mapName;
    },

    onClickOpenSetting() {
        SoundController.playSound(AudioKey.CLICK);
        Emitter.instance.emit(SHOW_POPUP, PopupType.SETTING);
    },

    onClickPlayGame() {
        SoundController.playSound(AudioKey.GAME_START);
        const battle = SCENE_TRANSITIONS.TO_BATTLE;
        SceneController.toScene(battle);
    },

    onSelectMap() {
        SoundController.playSound(AudioKey.CLICK);
        Emitter.instance.emit(SHOW_POPUP, PopupType.SELECTMAP);
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
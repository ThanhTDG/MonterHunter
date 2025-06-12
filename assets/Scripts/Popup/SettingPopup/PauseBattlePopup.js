const SettingPopup = require('./SettingPopup');
const { PopupType } = require('../../Enum/popupType');
const Emitter = require('../../Event/Emitter');
const { HIDE_PAUSE_BATTLE_POPUP } = require('../../Event/EventKeys/PopupEventKeys');
const { EXIT_GAME } = require('../../Event/EventKeys/SystemEventKeys');
const { RETRY_BATTLE } = require('../../Event/EventKeys/BattleEventKey');
const { SoundController } = require('../../Sound/SoundController');
const { AudioKey } = require('../../Enum/AudioKey');
const { SceneController } = require('../../System/SceneController');
const { SCENE_TRANSITIONS } = require('../../Enum/Scene');
cc.Class({
    extends: SettingPopup,
    properties: {
        popupType: {
            default: PopupType.DEFAULT,
            override: true,
            type: cc.Enum(PopupType),
        },
        exitButton: cc.Button,
        retryButton: cc.Button,
        lobbyButton: cc.Button,
    },
    registerEvents() {
        this._super();
        this.exitButton.node.on('click', this.handleExit, this);
        this.retryButton.node.on('click', this.handleRetry, this);
        this.lobbyButton.node.on('click', this.handleLobby, this);
    },
    removeEvents() {
        this._super();
        this.exitButton.node.off('click', this.handleExit, this);
        this.retryButton.node.off('click', this.handleRetry, this);
        this.lobbyButton.node.off('click', this.handleLobby, this);
    },
    handleExit() {
        this.emitHide();
        Emitter.instance.emit(EXIT_GAME)
    },
    handleRetry() {
        this.emitHide();
        Emitter.instance.emit(RETRY_BATTLE);
        SceneController.instance.stateController
    },
    handleLobby() {
        this.emitHide();
        const lobbyTransition = SCENE_TRANSITIONS.TO_LOBBY;
        SceneController.toScene(lobbyTransition)
    },
    emitHide() {
        SoundController.playSound(AudioKey.CLICK);
        Emitter.instance.emit(HIDE_PAUSE_BATTLE_POPUP);
    }
});

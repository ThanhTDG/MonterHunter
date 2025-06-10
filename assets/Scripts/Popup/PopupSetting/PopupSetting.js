const { AudioKey } = require("../../Enum/AudioKey");
const { PopupType } = require("../../Enum/popupType");
const { SceneName, SCENE_TRANSITIONS } = require("../../Enum/Scene");
const Emitter = require("../../Event/Emitter");
const { HIDE_SETTING_POPUP } = require("../../Event/EventKeys/PopupEventKeys");
const { EXIT_GAME } = require("../../Event/EventKeys/SystemEventKeys");
const { SoundController } = require("../../Sound/SoundController");
const { SceneController } = require("../../System/SceneController");

cc.Class({
    extends: require("PopupItem"),

    properties: {
        popupType: {
            default: PopupType.SETTING,
            override: true,
            type: cc.Enum(PopupType),
        },
        exitButton: cc.Button,
        retryButton: cc.Button,
        lobbyButton: cc.Button,
        overlayButton: cc.Button,
        closeButton: cc.Button,
    },
    onLoad() {
        this._super();
        this.registerEvents();
    },

    registerEvents() {
        this.exitButton.node.on("click", this.handleExit, this);
        this.retryButton.node.on("click", this.handleRetry, this);
        this.lobbyButton.node.on("click", this.handleLobby, this);
        this.overlayButton.node.on("click", this.handleHide, this);
        this.closeButton.node.on("click", this.handleHide, this);
    },
    unregisterEvents() {
        this.exitButton.node.off("click", this.handleExit, this);
        this.retryButton.node.off("click", this.handleRetry, this);
        this.lobbyButton.node.off("click", this.handleLobby, this);
        this.overlayButton.node.off("click", this.handleHide, this);
        this.closeButton.node.off("click", this.handleHide, this);
    },

    show() {
        this._super();
        const isBattle = this.getCurrentScene() === SceneName.BATTLE;
        this.showBattleUi(isBattle);
    },

    showBattleUi(enable = false) {
        this.lobbyButton.node.active = enable;
        this.retryButton.node.active = enable;
    },

    getCurrentScene() {
        return cc.director.getScene().name;
    },
    handleExit() {
        this.emitHide();
        Emitter.instance.emit(EXIT_GAME);
    },

    handleRetry() {
        throw new Error("Retry functionality is not implemented yet.");
        this.emitHide();
        // Emitter.instance.emit(RETRY_BATTLE);
    },

    handleLobby() {
        this.emitHide();
        const transition = SCENE_TRANSITIONS.TO_LOBBY;
        SceneController.instance.toTransition(transition);
    },
    handleHide() {
        this.emitHide();
    },
    emitHide() {
        SoundController.playSound(AudioKey.CLICK);
        Emitter.instance.emit(HIDE_SETTING_POPUP);
    },

});

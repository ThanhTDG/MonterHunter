const PopupItem = require('PopupItem');
const { RETRY_BATTLE } = require('../Event/EventKeys/BattleEventKey');
const { SCENE_TRANSITIONS } = require('../Enum/Scene');
const { SceneController } = require('../System/SceneController');
const Emitter = require('../Event/Emitter');
cc.Class({
    extends: PopupItem,

    properties: {
        retryButton: cc.Button,
        lobbyButton: cc.Button,
    },
    onLoad() {
        this._super();
        this.registerEvents();
    },
    registerEvents() {
        this.retryButton.node.on("click", this.handleRetry, this);
        this.lobbyButton.node.on("click", this.handleLobby, this);
    },
    removeEvents() {
        this.retryButton.node.off("click", this.handleRetry, this);
        this.lobbyButton.node.off("click", this.handleLobby, this);
    },
    handleRetry() {
        this.emitHide();
        Emitter.instance.emit(RETRY_BATTLE);
    },

    handleLobby() {
        this.emitHide();
        const transition = SCENE_TRANSITIONS.TO_LOBBY;
        SceneController.instance.toTransition(transition);
    },
});

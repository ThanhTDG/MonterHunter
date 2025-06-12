const { AudioKey } = require("../../Enum/AudioKey");
const { PopupType } = require("../../Enum/popupType");
const Emitter = require("../../Event/Emitter");
const { RESUME_BATTLE } = require("../../Event/EventKeys/BattleEventKey");
const { SoundController } = require("../../Sound/SoundController");

cc.Class({
    extends: require("PopupItem"),

    properties: {
        popupType: {
            default: PopupType.TUTORIAL,
            override: true,
            type: cc.Enum(PopupType),
        },
        overlayButton: cc.Button,

    },


    registerEvents() {
        this.overlayButton.node.on("click", this.handleHide, this);
    },
    removeEvents() {
        this.overlayButton.node.off("click", this.handleHide, this);
    },

    handleHide() {
        this.emitHide();
    },
    emitHide() {
        this._super();
        SoundController.playSound(AudioKey.CLICK);
        Emitter.instance.emit(RESUME_BATTLE);
    },

});

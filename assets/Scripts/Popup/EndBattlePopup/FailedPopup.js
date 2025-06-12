const { PopupType } = require("../../Enum/popupType");

cc.Class({
    extends: require("./EndBattle"),
    properties: {
        popupType: {
            default: PopupType.FAILED,
            override: true,
            type: cc.Enum(PopupType),
        },
    },
});

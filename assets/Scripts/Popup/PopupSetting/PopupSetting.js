const { PopupType } = require("../../Enum/popupType");


cc.Class({
    extends: require("PopupItem"),

    properties: {
        popupType: {
            default: PopupType.SETTING,
            override: true,
            type: cc.Enum(PopupType),
        },
    },

});

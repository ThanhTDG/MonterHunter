const { PopupType } = require("./Enum/popupType");
const Emitter = require("./Event/Emitter");
const { SHOW_POPUP } = require("./Event/EventKeys/PopupEventKeys");

cc.Class({
    extends: cc.Component,

    properties: {

    },
    onClickTest() {
        Emitter.instance.emit(SHOW_POPUP, PopupType.SETTING);
    }
});

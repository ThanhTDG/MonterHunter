const Emitter = require("../Event/Emitter");
const EventKey = require("../Event/EventKeys/PlayerEventKey");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    start () {

    },


    onMoveUp() {
        Emitter.instance.emit(EventKey.PLAYER_MOVE, 'up');
    },

    onMoveDown() {
        Emitter.instance.emit(EventKey.PLAYER_MOVE, 'down');
    },

});

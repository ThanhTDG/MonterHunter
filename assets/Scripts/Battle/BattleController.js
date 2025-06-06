const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
cc.Class({
    extends: cc.Component,

    properties: {
        Lanes: cc.Node,
    },

    onLoad() {
        this.eventMap = {
            [PlayerEventKey.PLAYER_INIT]: this.sendLine.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
        this.listLane = this.Lanes.getComponent('LaneManager').returnListSpawn();
    },

    start() {

    },

    sendLine() {
        cc.log('send line');
        Emitter.instance.emit(BattleEventKey.SEND_LINE, this.listLane);
    },

    onDestroy() {
        Emitter.instance.removeEventMap(this.eventMap);
    }


});

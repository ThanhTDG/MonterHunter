const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad(){
        this.init();
    },

    init(){
        Emitter.instance.emit(PlayerEventKey.PLAYER_INIT);
        cc.log('player emit');
    },

    start() {
        let eventMap = {
            [PlayerEventKey.PLAYER_MOVE]: (direction) => {
                if (direction === 'up') {
                    this.moveUp();
                } else if (direction === 'down') {
                    this.moveDown();
                }
            },
            [BattleEventKey.SEND_LINE] : (listLine) => this.logListLane(listLine)
        };
        Emitter.instance.registerEventMap(eventMap);
    },

    moveUp() {

    },
    logListLane(listLine) {
        cc.log("List Lane: ", listLine);
    },

    onDestroy() {
        Emitter.instance.removeEvent(eventMap);
    }
});

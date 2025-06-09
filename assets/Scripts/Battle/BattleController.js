const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const BattleEventKey = require("../Event/EventKeys/BattleEventKey");
cc.Class({
    extends: cc.Component,

    properties: {
        Lanes: cc.Node,
    },

    start() {
        this.init();
    },

    init() {
        this.listLane = this.Lanes.getComponent('LaneManager').returnListSpawn();
        cc.director.getCollisionManager().enabled = true;
        this.initPlayerData();

    },

    initPlayerData() {
        const playerData = {
            hp: 100,
            damage: 20,
            shootSpeed: 0.5,
            moveSpeed: 500,
        };
        this.sendInitEvent(playerData);


    },

    sendInitEvent(playerData) {
        Emitter.instance.emit(PlayerEventKey.PLAYER_INIT, { playerData, listLane: this.listLane });
    },


});

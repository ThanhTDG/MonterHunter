const Emitter = require("../Event/Emitter");
const EventKey = require("../Event/EventKeys/PlayerEventKey");

cc.Class({
    extends: cc.Component,

    properties: {
        moveUpButton: cc.Button,
        moveDownButton: cc.Button,
    },

    onLoad() {
        if (this.moveUpButton) {
            this.moveUpButton.node.on('click', this.onMoveUp, this);
        }
        if (this.moveDownButton) {
            this.moveDownButton.node.on('click', this.onMoveDown, this);
        }

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onDestroy() {
        if (this.moveUpButton) {
            this.moveUpButton.node.off('click', this.onMoveUp, this);
        }
        if (this.moveDownButton) {
            this.moveDownButton.node.off('click', this.onMoveDown, this);
        }

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onMoveUp() {
        Emitter.instance.emit(EventKey.PLAYER_MOVE, 'up');
    },

    onMoveDown() {
        Emitter.instance.emit(EventKey.PLAYER_MOVE, 'down');
    },

    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.onMoveUp();
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.onMoveDown();
                break;
        }
    },

    onKeyUp(event) {
    },
});

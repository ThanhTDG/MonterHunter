const { SCENE_TRANSITIONS } = require("../Enum/Scene");
const { DataController } = require("../System/DataController");
const { SceneController } = require("../System/SceneController");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onClickPlayGame() {
        const battle = SCENE_TRANSITIONS.TO_BATTLE
        SceneController.instance.toTransition(battle);
    }
});

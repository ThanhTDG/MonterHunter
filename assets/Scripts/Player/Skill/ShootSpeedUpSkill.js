const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");

cc.Class({
    extends: require('SkillItem'),

    onSkillActivated() {
        cc.log("Fast Shooting Skill activated!");
        Emitter.instance.emit(PlayerEventKey.INCREASE_SHOOT_SPEED, { multiplier: 2, duration: 5 });

        this.scheduleOnce(() => {
            Emitter.instance.emit(PlayerEventKey.RESET_SHOOT_SPEED);
        }, 5);
    },
});

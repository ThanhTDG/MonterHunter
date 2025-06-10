const Emitter = require("../../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const {SkillType} = require('../../Enum/SkillType');

cc.Class({
    extends: require('SkillItem'),
    properties: {
        skillType: {
            default: SkillType.ATKSPEEDUP,
            type: cc.Enum(SkillType),
            override: true
        },
        cooldownTime: {
            default: 10,
            override: true
        }
    },

    onSkillActivated() {
        Emitter.instance.emit(PlayerEventKey.INCREASE_SHOOT_SPEED, { multiplier: 2, duration: 5 });
    },
});

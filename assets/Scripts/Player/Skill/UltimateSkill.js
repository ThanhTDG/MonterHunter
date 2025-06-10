const Skill = require("./SkillItem");
const Emitter = require("../../Event/Emitter");
const PlayerEventKey = require("../../Event/EventKeys/PlayerEventKey");
const MonsterEventKey = require("../../Event/EventKeys/MonsterEventKey");
const {SkillType} = require('../../Enum/SkillType');

cc.Class({
    extends: Skill,

    properties: {
        skillType: {
            default: SkillType.ULTIMATE,
            type: cc.Enum(SkillType),
            override: true
        },
        requiredKills: 10,
    },

    onLoad() {
        this.currentKills = 0;
        this.isReady = false;
        Emitter.instance.registerEvent(MonsterEventKey.MONSTER_DEAD, this.onMonsterKilled, this);
        Skill.prototype.onLoad.call(this);
        this.cooldownLabel.node.active = true;
    },

    initializeSkill() {
        this.progressBar.progress = 0;
        this.node.opacity = 100;
        this.isCooldown = false;
        this.cooldownLabel.string = (this.currentKills / this.requiredKills).toFixed(0);
        this.markAsReady();
    },

    activateSkill() {
        if (!this.isReady) {
            cc.log("Ultimate skill not ready!");
            return;
        }

        Emitter.instance.emit(PlayerEventKey.ACTIVATE_ULTIMATE);
        this.resetProgress();
    },

    onMonsterKilled() {
        if (this.isReady) return;

        this.currentKills++;
        this.updateProgress();

        if (this.currentKills >= this.requiredKills) {
            this.markAsReady();
        }
    },

    updateProgress() {
        const progress = this.currentKills / this.requiredKills;
        this.cooldownLabel.node.string = progress.toFixed(2);
        this.progressBar.progress = progress;
    },

    markAsReady() {
        this.isReady = true;
        this.cooldownLabel.node.active = false;
        this.node.opacity = 255;
    },

    resetProgress() {
        this.node.opacity = 100;
        this.currentKills = 0;
        this.isReady = false;
        this.progressBar.progress = 0;
        this.cooldownLabel.node.active = true;
    },

    onDestroy() {
        Emitter.instance.unregisterEvent(MonsterEventKey.MONSTER_DEAD, this.onMonsterKilled, this);
    }
});

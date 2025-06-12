const Skill = require("./SkillItem");
const Emitter = require("../../Event/Emitter");
const PlayerEventKey = require("../../Event/EventKeys/PlayerEventKey");
const MonsterEventKey = require("../../Event/EventKeys/MonsterEventKey");
const { SkillType } = require('../../Enum/SkillType');

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

        Emitter.instance.registerEvent(MonsterEventKey.MONSTER_DEAD, this.onMonsterKilled.bind(this));
        this._super();

    },

    initializeSkill() {
        this._super();
        this.currentKills = 0;
        this.isReady = false;
        if (!this.progressBar || !this.cooldownLabel) {
            return;
        }

        this.progressBar.progress = 0;
        this.node.opacity = 100;
        this.isCooldown = false;
        this.cooldownLabel.node.active = true;
        this.cooldownLabel.string = ((this.currentKills / this.requiredKills) * 10).toFixed(0);
        this.markAsReady(true);
    },

    activateSkill() {
        if (!this.isReady) {
            return;
        }

        Emitter.instance.emit(PlayerEventKey.ACTIVATE_ULTIMATE);
        this.resetProgress();
    },
    onMonsterKilled() {
        if (this.isReady || !this.node) {
            return;
        }

        this.currentKills++;
        this.updateProgress();

        if (this.currentKills >= this.requiredKills) {
            this.markAsReady(true);
        }
    },


    updateProgress() {
        if (!this.cooldownLabel || !this.progressBar) {
            return;
        }

        const progress = this.currentKills / this.requiredKills;
        this.cooldownLabel.string = (progress * 10).toFixed(0);
        this.progressBar.progress = progress;
    },

    markAsReady(isReady) {
        if (!this.node) {
            return;
        }

        this.isReady = isReady;

        this.cooldownLabel.node.active = !isReady;

        this.node.opacity = isReady ? 255 : 100;
    },


    resetProgress() {
        this.node.opacity = 100;
        this.currentKills = 0;
        this.isReady = false;

        if (this.progressBar) {
            this.progressBar.progress = 0;
        }
        this.cooldownLabel.node.active = true;
        this.updateProgress();

    },

    onDestroy() {
        Emitter.instance.removeEvent(MonsterEventKey.MONSTER_DEAD, this.onMonsterKilled);
    }
});


const { SkillType } = require('../../Enum/SkillType');

cc.Class({
    extends: cc.Component,

    properties: {
        skillType: {
            default: SkillType.ATKSPEEDUP,
            type: cc.Enum(SkillType),


        },
        cooldownTime: {
            default: 15,
        },
        cooldownLabel: cc.Label,
    },

    onLoad() {
        this.initializeSkill();
    },

    initializeSkill() {
        this.progressBar = this.getComponent(cc.ProgressBar);
        this.button = this.getComponent(cc.Button);

        this.cooldownLabel.node.active = false;
        this.isCooldown = false;
        this.remainingTime = 0;

        this.button.node.on('click', this.activateSkill, this);
    },


    activateSkill() {
        if (this.isCooldown) {
            cc.log("Skill is on cooldown!");
            return;
        }

        if (this.onSkillActivated) {
            this.onSkillActivated();
        }
        this.startCooldown();
    },

    onSkillActivated() {
    },

    startCooldown(cooldownTime = this.cooldownTime) {
        this.isCooldown = true;
        this.remainingTime = cooldownTime;

        this.progressBar.progress = 0;
        this.cooldownLabel.string = this.remainingTime.toFixed(1);
        this.cooldownLabel.node.active = true;
        this.node.opacity = 100;

        this.schedule(this.updateCooldown, 0.1);
    },

    updateCooldown(dt) {
        if (this.remainingTime > 0) {
            this.remainingTime -= dt;

            if (this.remainingTime < 0) this.remainingTime = 0;

            const progress = 1 - this.remainingTime / this.cooldownTime;
            this.progressBar.progress = progress;

            this.cooldownLabel.string = this.remainingTime.toFixed(1);
            this.node.opacity = 100;

        } else {
            this.isCooldown = false;

            this.progressBar.progress = 1;
            this.cooldownLabel.node.active = false;

            this.node.opacity = 255;

            this.unschedule(this.updateCooldown);
            this.onCooldownComplete();
        }
    },

    onCooldownComplete() {
    },

    pauseBattle() {
        this.isPaused = true;
        this.node.pauseAllActions && this.node.pauseAllActions();
        if (this.isCooldown) {
            this.unschedule(this.updateCooldown);
            this._pausedRemainingTime = this.remainingTime;
        }
    },

    resumeBattle() {
        this.isPaused = false;
        this.node.resumeAllActions && this.node.resumeAllActions();
        if (this.isCooldown && this._pausedRemainingTime > 0) {
            this.remainingTime = this._pausedRemainingTime;
            this.schedule(this.updateCooldown, 0.1);
            this._pausedRemainingTime = null;
        }
    },
});

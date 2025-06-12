const Emitter = require("../../Event/Emitter");
const { PAUSE_BATTLE, RESUME_BATTLE } = require("../../Event/EventKeys/BattleEventKey");

cc.Class({
    extends: cc.Component,

    properties: {
        skillSlots: [cc.Node],
        skillPrefabs: [cc.Prefab],
        ultimateSkillSlot: cc.Node,
        ultimateSkillPrefab: cc.Prefab,
    },

    onLoad() {
        this.skills = [];
        this.initUltimateSkill();
        this.initSkills(3);
        this.registerEvents();
    },
    onDestroy() {
        this.removeEvents();
        this.clearSkills();
    },
    registerEvents() {
        this.eventMap = {
            [PAUSE_BATTLE]: this.pauseBattle.bind(this),
            [RESUME_BATTLE]: this.resumeBattle.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },
    removeEvents() {
        if (!this.eventMap) {
            return;
        }
        Emitter.instance.removeEventMap(this.eventMap);
    },

    initSkills(delayTime = 0) {
        this.skillSlots.forEach((slot, index) => {
            const skillPrefab = this.skillPrefabs[index];
            if (skillPrefab) {
                const skillNode = cc.instantiate(skillPrefab);
                skillNode.setParent(slot);
                skillNode.setPosition(cc.v2(0, 0));
                skillNode.opacity = 100;

                const button = skillNode.getComponent(cc.Button);
                if (button) {
                    button.interactable = false;
                }

                this.skills.push({ node: skillNode, button, ready: false });

                this.scheduleOnce(() => {
                    if (button) {
                        button.interactable = true;
                        skillNode.opacity = 255;
                    }
                }, delayTime);
            }
        });
    },
    pauseBattle() {
        if (!this.skills || this.skills.length === 0) {
            return;
        }
        this.skills.forEach(skill => {
            const script = skill.node.getComponent("SkillItem");
            script.pauseBattle();
        });
        if (this.ultimateSkill && this.ultimateSkill.node) {
            const ultimateScript = this.ultimateSkill.node.getComponent("SkillItem");
            ultimateScript.pauseBattle();
        }
    },

    resumeBattle() {
        if (!this.skills || this.skills.length === 0) {
            return;
        }
        this.skills.forEach(skill => {
            const script = skill.node.getComponent("SkillItem");
            script.resumeBattle();
        });
        if (this.ultimateSkill && this.ultimateSkill.node) {
            const ultimateScript = this.ultimateSkill.node.getComponent("SkillItem");
            ultimateScript.resumeBattle();
        }
    },

    initUltimateSkill() {
        const ultimateSkillNode = cc.instantiate(this.ultimateSkillPrefab);
        ultimateSkillNode.setParent(this.ultimateSkillSlot);
        ultimateSkillNode.setPosition(cc.v2(0, 0));

        const button = ultimateSkillNode.getComponent(cc.Button);
        if (button) {
            button.interactable = true;
        }

        this.ultimateSkill = { node: ultimateSkillNode, button };
    },

    clearSkills() {
        this.skills.forEach(skill => {
            if (skill.node && cc.isValid(skill.node)) {
                skill.node.destroy();
            }
        });
        this.skills = [];

        if (this.ultimateSkill && this.ultimateSkill.node && cc.isValid(this.ultimateSkill.node)) {
            this.ultimateSkill.node.destroy();
        }
        this.ultimateSkill = null;
    },

    resetSkill() {
        this.clearSkills();
        this.initUltimateSkill();
        this.initSkills(3);
        this.skills.forEach(skill => {
            if (skill.node) {
                const skillComponent = skill.node.getComponent('SkillItem');
                skillComponent.initializeSkill();
            }
        });

        if (this.ultimateSkill && this.ultimateSkill.node) {
            const ultimateSkillComponent = this.ultimateSkill.node.getComponent('UltimateSkill');
            ultimateSkillComponent.initializeSkill();
        }
    },


    onDestroy() {
        this.clearSkills();
        this.unscheduleAllCallbacks();
    }
});

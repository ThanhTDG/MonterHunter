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
            if (skill.node) {
                skill.node.destroy();
            }
        });
        this.skills = [];

        if (this.ultimateSkill && this.ultimateSkill.node) {
            this.ultimateSkill.node.destroy();
            this.ultimateSkill = null;
        }
    },
});

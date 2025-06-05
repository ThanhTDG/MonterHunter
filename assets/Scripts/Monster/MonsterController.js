cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.monsters = {};
    },

    add(monster) {
        this.monsters[monster.id] = monster;
    },

    remove(id) {
        const monsterNode = this.monsters[id];
        if (!monsterNode) return;

        const script = monsterNode.getComponent("MonsterBase");
        if (script && script.stopAllTweens) {
            script.stopAllTweens();
        }

        monsterNode.destroy();
        delete this.monsters[id];
    },

    getAll() {
        return Object.values(this.monsters);
    },

    clearAll() {
        for (let id in this.monsters) {
            const monsterNode = this.monsters[id];
            const script = monsterNode.getComponent("MonsterBase");
            if (script && script.stopAllTweens) {
                script.stopAllTweens();
            }
            monsterNode.destroy();
        }
        this.monsters = {};
    }
});

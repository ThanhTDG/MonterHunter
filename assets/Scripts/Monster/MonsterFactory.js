const PrefabMap = {
    DogMonster: "DogMonster",
    WolfMonster: "WolfMonster",
    DragonMonster: "DragonMonster",
    RobotMonster: "RobotMonster"
};

cc.Class({
    extends: cc.Component,

    properties: {
        prefabList: [cc.Prefab]
    },

    create(monsterData, parent, pos) {
        const prefab = this.getPrefabByType(monsterData.type);
        if (!prefab) return;

        const monster = cc.instantiate(prefab);
        monster.parent = parent;
        monster.setPosition(parent.convertToNodeSpaceAR(pos));

        const script = monster.getComponent(PrefabMap[monsterData.type]);
        script.init(monsterData);
        script.id = monsterData.id;
        script.type = monsterData.type;

        return monster;
    },

    getPrefabByType(type) {
        return this.prefabList.find(p => p.name === type);
    },
});
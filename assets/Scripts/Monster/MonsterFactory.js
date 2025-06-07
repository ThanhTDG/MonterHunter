const PrefabMap = require("TypeMonster");

cc.Class({
    extends: cc.Component,

    properties: {
        prefabList: [cc.Prefab],
        monterControl: require("MonsterController"),
        monsterLayer: cc.Node,
    },

    createMonster(type, parent, level = 1) {
        const prefab = this.getPrefabByType(type);
        if (!prefab) {
            cc.error("Prefab không tồn tại:", type);
            return null;
        }

        const worldPos = this.monsterLayer.parent.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const startX = cc.winSize.width + 100;
        const minY = worldPos.y + 200;
        const maxY = worldPos.y - 300;

        const startY = minY + Math.random() * (maxY - minY); // toạ độ giả lập (lấy từ land)
        const convertPos = cc.v2(startX, startY);

        const monster = cc.instantiate(prefab);
        monster.parent = parent;

        const localPos = monster.parent.convertToNodeSpaceAR(convertPos);
        monster.setPosition(localPos);

        const scriptName = PrefabMap[type];
        const script = monster.getComponent(scriptName);
        script.init(level);

        script.type = type;
        script.id = this._generateUniqueId();

        this.monterControl.add(monster);
        return monster;
    },

    getPrefabByType(type) {
        return this.prefabList.find(prefab => prefab.name === type);
    },

    _generateUniqueId() {
        return 'mon_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
});
cc.Class({
    extends: cc.Component,

    properties: {
        monsterFactory: require('MonsterFactory'),
    },

    init(monsterLayer, lanePosList) {
        this.monsterLayer = monsterLayer;
        this.lanePosList = lanePosList;
        this.monsters = {};
    },

    spawnMonster(monsterData) {
        const y = this.getRandomLaneY();
        const pos = cc.v2(cc.winSize.width + 150, y);
        const monster = this.monsterFactory.create(monsterData, this.monsterLayer, pos);
        this.monsters[monsterData.id] = monster;
    },

    getRandomLaneY() {
        const index = Math.floor(Math.random() * this.lanePosList.length);
        return this.lanePosList[index];
    },

    remove(id) {
        if (this.monsters[id]) {
            this.monsters[id].destroy();
            delete this.monsters[id];
        }
    },

    clearAll() {
        for (let id in this.monsters) {
            this.monsters[id].destroy();
        }
        this.monsters = {};
    }
});
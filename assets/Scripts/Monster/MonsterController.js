const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');

cc.Class({
    extends: cc.Component,

    properties: {
        monsterFactory: require('MonsterFactory'),
    },

    init(monsterLayer, lanePosList) {
        this.monsterLayer = monsterLayer;
        this.lanePosList = lanePosList;
        this.monsters = {};
        this.deadCount = 0;

        this._onMonsterDead = this.onMonsterDead.bind(this);
        Emitter.instance.registerEvent(MonsterEventKey.MONSTER_DEAD, this._onMonsterDead, this);
    },

    spawnMonster(monsterData) {
        const y = this.getRandomLaneY();
        const pos = cc.v2(cc.winSize.width + 150, y);
        const monster = this.monsterFactory.create(monsterData, this.monsterLayer, pos);
        this.monsters[monsterData.id] = monster;
    },

    getRandomLaneY() {
        const index = Math.floor(Math.random() * this.lanePosList.length);

        return this.lanePosList[index].y;
    },

    onMonsterDead(data) {
        this.deadCount++;
        this.remove(data.id);
        cc.log(`[MonsterController] die: id= ${data.id}, type= ${data.type}, deadCount= ${this.deadCount}`);
    },

    // tổng quái bị giết
    getDeadCount() {
        return this.deadCount;
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
        Emitter.instance.removeEvent(MonsterEventKey.MONSTER_DEAD, this.onMonsterDead, this);
    }
});
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

        this._onDestroyMonster = this.onDestroyMonster.bind(this);
        Emitter.instance.registerEvent(MonsterEventKey.MONSTER_END, this._onDestroyMonster, this);
    },

    spawnMonster(monsterData) {
        const y = this.getRandomLaneY();
        const pos = cc.v2(cc.winSize.width + 150, y);

        if (!monsterData.id) {
            monsterData.id = this.generateId();
        }
        const monster = this.monsterFactory.create(monsterData, this.monsterLayer, pos);
        this.monsters[monsterData.id] = monster;
    },

    generateId() {
        return 'mon_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    },

    getRandomLaneY() {
        const index = Math.floor(Math.random() * this.lanePosList.length);

        return this.lanePosList[index].y;
    },

    onDestroyMonster(data) {
        this.remove(data.id);
    },

    onMonsterDead(data) {
        this.deadCount++;
        this.remove(data.id);
    },

    getDeadCount() {
        return this.deadCount;
    },

    isMonsterCleared(monster) {
        const isDestroyed = !cc.isValid(monster);
        const isDetached = monster && !monster.parent;
        return isDestroyed || isDetached;
    },

    areAllMonstersCleared() {
        const allCleared = Object.values(this.monsters).every(monster =>
            this.isMonsterCleared(monster)
        );
        return allCleared;
    },

    remove(id) {
        if (this.monsters[id]) {
            this.monsters[id].destroy();
            delete this.monsters[id];
        }
    },

    clearAll() {
        for (let id in this.monsters) {
            const monster = this.monsters[id];
            if (monster) {
                monster.unscheduleAllCallbacks && monster.unscheduleAllCallbacks();
                monster.stopAllActions && monster.stopAllActions();
                monster.destroy();
            }
        }
        this.monsters = {};
        this.deadCount = 0;

        Emitter.instance.removeEvent(MonsterEventKey.MONSTER_DEAD, this._onMonsterDead, this);
        Emitter.instance.removeEvent(MonsterEventKey.MONSTER_END, this._onDestroyMonster, this);
    }
});
const MonsterEventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
const { PAUSE_BATTLE, RESUME_BATTLE } = require('../Event/EventKeys/BattleEventKey');
const MonsterItem = require('MonsterItem');
const { getRandomId } = require('../Utils/RamdomUltis');
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
        this.registerEvents();
        this._isPause = false;
    },

    registerEvents() {
        this.eventMap = {
            [MonsterEventKey.MONSTER_DEAD]: this.onMonsterDead.bind(this),
            [MonsterEventKey.MONSTER_END]: this.onDestroyMonster.bind(this),
            [PAUSE_BATTLE]: this.pauseBattle.bind(this),
            [RESUME_BATTLE]: this.resumeBattle.bind(this),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },
    pauseBattle() {
        this._isPause = true;
        for (let id in this.monsters) {
            console.log("Pause monster actions", this.monsters[id]);
            const monster = this.monsters[id];
            monster.getComponent(MonsterItem).pauseBattle();
        }
        this.node.pauseAllActions();
    },

    resumeBattle() {
        this._isPause = false;
        for (let id in this.monsters) {
            const monster = this.monsters[id];
            monster.getComponent(MonsterItem).resumeBattle();
        }
        this.node.resumeAllActions();
    },
    removeEvents() {
        Emitter.instance.removeEventMap(this.eventMap);
    },

    spawnMonster(monsterData) {
        const y = this.getRandomLaneY();
        const pos = cc.v2(cc.winSize.width + 150, y);
        monsterData.id = getRandomId();
        const monster = this.monsterFactory.create(monsterData, this.monsterLayer, pos);
        monster.getComponent(MonsterItem)._isPaused = this._isPause;
        this.monsters[monsterData.id] = monster;
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

    getRemainingMonsterCount() {
        return this.getAliveMonsters().length;
    },

    getAliveMonsters() {
        return Object.values(this.monsters).filter(m => cc.isValid(m) && m.parent);
    },

    remove(id) {
        const monster = this.monsters[id];

        if (monster.currentHealth > 0) {
            console.warn(`Cảnh báo: Quái ID ${id} bị xóa khi còn sống!`);
            return;
        }

        if (monster.__tween) {
            monster.__tween.stop();
            monster.__tween = null;
        }

        if (typeof monster.unscheduleAllCallbacks === "function") {
            monster.unscheduleAllCallbacks();
        }

        monster.destroy();
        delete this.monsters[id];
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

        this.removeEvents();
    }
});
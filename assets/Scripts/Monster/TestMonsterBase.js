// MonsterState.js
const MonsterState = {
    IDLE: 'idle',
    MOVING: 'moving',
    ATTACKED: 'attacked',
    COLLIDING: 'colliding',
    DEAD: 'dead'
};

module.exports = MonsterState;

// MonsterBase.js
const EventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
const StateMachine = require('javascript-state-machine');
const MonsterState = require('MonsterState');
const { EntityGroup } = require('../Enum/EntityGroup');

cc.Class({
    extends: cc.Component,

    properties: {
        healthBar: cc.ProgressBar,
        maxHealth: 100,
        currentHealth: 100,
        amount: 100,
    },

    init(level = 1) {
        this.type = "";
        this.id = "";
        this.maxHealth = 100 * level;
        this.currentHealth = this.maxHealth;
        this.healthBar.progress = 1;

        this.initFSM();
        this.fsm.startIdle();
    },

    initFSM() {
        this.fsm = new StateMachine({
            init: MonsterState.IDLE,
            transitions: [
                { name: 'startIdle', from: '*', to: MonsterState.IDLE },
                { name: 'startMoving', from: MonsterState.IDLE, to: MonsterState.MOVING },
                { name: 'getAttacked', from: [MonsterState.IDLE, MonsterState.MOVING], to: MonsterState.ATTACKED },
                { name: 'resumeMove', from: MonsterState.ATTACKED, to: MonsterState.MOVING },
                { name: 'collidePlayer', from: '*', to: MonsterState.COLLIDING },
                { name: 'die', from: '*', to: MonsterState.DEAD },
            ],
            methods: {
                onEnterIdle: () => this.onEnterIdle(),
                onEnterMoving: () => this.onEnterMoving(),
                onEnterAttacked: () => this.onEnterAttacked(),
                onEnterColliding: () => this.onEnterColliding(),
                onEnterDead: () => this.onEnterDead()
            }
        });
    },

    onEnterIdle() {
        this.stopTweens();
        this.scheduleOnce(() => {
            if (this.fsm.can('startMoving')) this.fsm.startMoving();
        }, 2);
    },

    onEnterMoving() {
        this.stopTweens();
        const moveDuration = 2;
        this.walking = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(moveDuration, { x: -200 })
            ).start();

        this.floating = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.25, { y: 10 })
                    .by(0.25, { y: -10 })
            ).start();
    },

    onEnterAttacked() {
        this.stopTweens();
        this.scheduleOnce(() => {
            if (this.fsm.can('resumeMove')) this.fsm.resumeMove();
        }, 0.3);
    },

    onEnterColliding() {
        this.stopTweens();
        this.sendAttackToPlayer();
        this.attackInterval = this.schedule(this.sendAttackToPlayer, 2);

        this.attackEffect = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.1, { x: 10 })
                    .by(0.1, { x: -20 })
                    .by(0.1, { x: 10 })
            ).start();
    },

    onEnterDead() {
        this.stopTweens();
        this.playDieEffect();
    },

    playDieEffect() {
        cc.tween(this.node)
            .to(0.3, { scale: 0, opacity: 0 })
            .call(() => this.node.destroy())
            .start();
    },

    stopTweens() {
        if (this.walking) this.walking.stop();
        if (this.floating) this.floating.stop();
        if (this.attackEffect) this.attackEffect.stop();
        this.walking = null;
        this.floating = null;
        this.attackEffect = null;
        this.unschedule(this.attackInterval);
    },

    sendAttackToPlayer() {
        Emitter.instance.emit(EventKey.MONSTER_ATTACK_PLAYER, {
            id: this.id,
            type: this.type,
            damage: this.amount
        });
    },

    takeDamage(amount) {
        if (this.fsm.is(MonsterState.DEAD)) return;

        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
        this.healthBar.progress = this.currentHealth / this.maxHealth;

        if (this.currentHealth <= 0 && this.fsm.can('die')) {
            this.fsm.die();
        } else if (this.fsm.can('getAttacked')) {
            this.fsm.getAttacked();
        }
    },

    onCollisionEnter(other, self) {
        if (this.fsm.is(MonsterState.DEAD)) return;

        if (other.node.group === EntityGroup.BULLET) {
            this.takeDamage(this.amount);
            const worldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            Emitter.instance.emit(EventKey.SPAWN_EFFECT, {
                id: this.id,
                type: this.type,
                worldPos,
                health: this.currentHealth,
                maxHealth: this.maxHealth,
            });
        }

        if (other.node.group === EntityGroup.PLAYER) {
            if (this.fsm.can('collidePlayer')) this.fsm.collidePlayer();
        }

        if (other.node.group === EntityGroup.BOUNDARY) {
            Emitter.instance.emit(EventKey.COLLISION_ENDSCENE);
            if (this.fsm.can('die')) this.fsm.die();
        }
    }
});

const EventKey = require('MonsterEventKey');
const Emitter = require('Emitter');
const StateMachine = require('javascript-state-machine');
const { EntityGroup } = require('../Enum/EntityGroup');

const MonsterState = {
    IDLE: 'idle',
    MOVING: 'moving',
    ATTACKED: 'attacked',
    COLLIDING: 'colliding',
    DEAD: 'dead'
};


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
        this.fsm.onStartMoving();
    },

    initFSM() {
        this.fsm = new StateMachine({
            init: 'idle',
            transitions: [
                { name: 'startMoving', from: 'idle', to: 'moving' },
                { name: 'getAttacked', from: ['idle','moving'], to: 'attacked' },
                { name: 'resumeMove', from: 'attacked', to: 'moving' },
                { name: 'collidePlayer', from: ['idle','moving', 'attacked'], to: 'colliding' },
                { name: 'die', from: ['idle','moving', 'attacked', 'colliding'], to: 'dead' }
            ],
            methods: {
                onStartMoving: () => this.onStartMoving(),
                onEnterMoving: () => this.onEnterMoving(),
                onEnterAttacked: () => this.onEnterAttacked(),
                onEnterColliding: () => this.onEnterColliding(),
                onEnterDead: () => this.onEnterDead()
            }
        });
    },

    // === MOVING STATE ===
    onEnterMoving() {
        // this.stopTweens();

        this.walking = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to({ x: -100 }))
            .start();

        this.walkingTween = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.1, { y: 10 })
                    .by(0.1, { y: -10 }))
            .start();
    },

    onStartMoving() {
        this.stopTweens();

        this.walking = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(1, { x: -100 }))
            .start();

        this.walkingTween = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.25, { y: 10 })
                    .by(0.25, { y: -10 }))
            .start();
    },

    // === ATTACKED STATE ===
    onEnterAttacked() {
        this.stopTweens();

        console.log('attack');
        // Đứng lại 0.5s rồi tiếp tục di chuyển
        this.scheduleOnce(() => {
            if (this.fsm.can('resumeMove'))
                this.fsm.resumeMove();
        }, 0.5);
    },

    // === COLLIDING STATE ===
    onEnterColliding() {
        this.stopTweens();

        console.log('va chạm player');
        //Hiệu ứng tấn công: ví dụ giật nhẹ node
        this.attackEffect = cc.tween(this.node)
            .repeatForever(cc.tween()
                .by(0.1, { x: 5 })
                .by(0.1, { x: -5 }))
            .start();
    },

    // === DEAD STATE ===
    onEnterDead() {
        this.stopTweens();

        console.log('dead');
        cc.tween(this.node)
            .to(0.3, { scale: 0, opacity: 0 })
            .call(() => this.node.destroy())
            .start();
    },

    // === UTILS ===
    stopTweens() {
        if (this.walkingTween) {
            this.walkingTween.stop();
            this.walkingTween = null;
        }
        if (this.walking) {
            this.walking.stop();
            this.walking = null;
        }
        if (this.attackEffect) {
            this.attackEffect.stop();
            this.attackEffect = null;
        }
    },

    takeDamage(amount) {
        if (this.fsm.is('dead')) return;

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
        if (this.fsm.is('dead')) return;
        if (this.fsm.can('getAttacked')) this.fsm.getAttacked();

        if (other.node.group === EntityGroup.BULLET) {
            this.takeDamage(this.amount);

            const pos = self.node.position;
            const worldPos = self.node.parent.convertToWorldSpaceAR(pos);

            const infoCollision = {
                'hpProgress': this.healthBar.progress,
                'id': this.id,
                'type': this.type,
                'maxHealth': this.maxHealth,
                'currentHealth': this.currentHealth,
                'amount': this.amount,
                'pos': pos,
                'worldPos': worldPos,
            }
            Emitter.instance.emit(EventKey.SPAWN_EFFECT, infoCollision);
        }

        if (other.node.group === EntityGroup.PLAYER) {
            if (this.fsm.can('collidePlayer')) this.fsm.collidePlayer();
        }

        if (other.node.group === EntityGroup.BOUNDARY) {
            Emitter.instance.emit(EventKey.COLLISION_ENDSCENE);
            console.log('die');
            if (this.fsm.can('die')) this.fsm.die();
        }
    }
});

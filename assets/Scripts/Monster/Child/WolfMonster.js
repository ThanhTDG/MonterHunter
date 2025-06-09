const MonsterItem = require('MonsterItem');
const Emitter = require('Emitter');
const EventKey = require('MonsterEventKey');

cc.Class({
    extends: MonsterItem,

    properties: {
        // damage: 60,
        // wolfSpeed: 120,
    },

    // handleDeath() {
    //     if (this.moveTween) this.moveTween.stop();

    //     cc.tween(this.node)
    //         .parallel(
    //             cc.tween().to(0.5, { opacity: 0 }),
    //             cc.tween().by(0.5, { angle: 360 })
    //         )
    //         .call(() => {
    //             // Emitter.instance.emit(EventKey.MONSTER_DEAD, [this.id, this.type]);
    //             this.node.destroy();
    //         })
    //         .start();
    // },
});

const MonsterItem = require('MonsterItem');
const Emitter = require('Emitter');
const EventKey = require('MonsterEventKey');

cc.Class({
    extends: MonsterItem,

    properties: {
        // damage: 100,
        // dragonSpeed: 80,
    },

    // handleDeath() {
    //     if (this.moveTween) this.moveTween.stop();

    //     cc.tween(this.node)
    //         .sequence(
    //             cc.tween().to(0.2, { scale: 1.5 }),
    //             cc.tween().to(0.2, { scale: 0 }),
    //             cc.tween().to(0.5, { opacity: 0, y: this.node.y + 100 }),
    //             cc.call(() => {
    //                 Emitter.instance.emit(EventKey.MONSTER_DEAD, [this.id, this.type]);
    //                 this.node.destroy();
    //             })
    //         )
    //         .start();
    // },
});

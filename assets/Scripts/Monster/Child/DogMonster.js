const MonsterItem = require('MonsterItem');
const Emitter = require('Emitter');
const EventKey = require('MonsterEventKey');

cc.Class({
    extends: MonsterItem,

    properties: {
        // damage: 40,
        // dogSpeed: 150,
    },

    // handleDeath() {
    //     if (this.moveTween) this.moveTween.stop();

    //     cc.tween(this.node)
    //         .sequence(
    //             cc.tween().by(0.2, { y: 30 }),
    //             cc.tween().by(0.2, { y: -30 }),
    //             cc.tween().to(0.5, { opacity: 0, y: this.node.y + 50 }),
    //             cc.call(() => {
    //                 // Emitter.instance.emit(EventKey.MONSTER_DEAD, [this.id, this.type]);
    //                 this.node.destroy();
    //             })
    //         )
    //         .start();
    // },
});

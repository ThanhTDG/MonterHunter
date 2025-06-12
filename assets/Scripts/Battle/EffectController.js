const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const MonsterEventKey = require('../Event/EventKeys/MonsterEventKey');

const EffectController = cc.Class({
    extends: cc.Component,

    properties: {
        playerDamageTextPrefab: cc.Prefab,
        monsterDamageTextPrefab: cc.Prefab,
    },

    onLoad() {
        this.registerEvents();
    },

    registerEvents() {
        this.eventMap = {
            [PlayerEventKey.PLAYER_HURT]: this.playEffectText.bind(this, 'player'),
            [MonsterEventKey.TAKE_DAMAGE]: this.playEffectText.bind(this, 'monster'),
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    playEffectText(targetType, worldPos, damage, DestroyTime = 1) {
        const prefab =
            targetType === 'player'
                ? this.playerDamageTextPrefab
                : this.monsterDamageTextPrefab;

        if (!prefab) return;

        const effect = cc.instantiate(prefab);
        this.node.addChild(effect);
        const localPos = this.node.convertToNodeSpaceAR(worldPos);
        effect.setPosition(localPos);

        const label = effect.getComponent(cc.Label);
        if (label) {
            label.string = `${damage}`;
        }

        cc.tween(effect)
            .by(0.3, { position: cc.v2(0, 40) }, { easing: 'quadOut' })
            .by(0.2, { position: cc.v2(0, -20) }, { easing: 'quadIn' })
            .delay(DestroyTime - 0.5)
            .call(() => {
                if (cc.isValid(effect)) {
                    effect.destroy();
                }
            })
            .start();
    },

    clear() {
        this.node.children.forEach((child) => {
            if (cc.isValid(child)) {
                child.destroy();
            }
        });
    },

    onDestroy() {
        Emitter.instance.removeEventMap(this.eventMap);
    },
});

const Emitter = require("../Event/Emitter");
const PlayerEventKey = require("../Event/EventKeys/PlayerEventKey");
const MonsterEventKey = require('../Event/EventKeys/MonsterEventKey');

const EffectController = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        damageTextPrefab: cc.Prefab,
        effectLayer: cc.Node,
    },

    onLoad() {
        this.eventMap = {
            [PlayerEventKey.PLAYER_HURT] : this.playEffectText.bind(this),
            
        };
        Emitter.instance.registerEventMap(this.eventMap);
    },

    playEffectText(worldPos, damage, DestroyTime = 1) {
        if (!this.damageTextPrefab || !this.effectLayer) return;

        const effect = cc.instantiate(this.damageTextPrefab);
        const localPos = this.effectLayer.convertToNodeSpaceAR(worldPos);
        effect.setPosition(localPos);

        this.effectLayer.addChild(effect);

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

    onDestroy(){
        Emitter.instance.unregisterEventMap(this.eventMap);
    },

});
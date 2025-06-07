const MonsterItem = require("MonsterItem");

cc.Class({
    extends: MonsterItem,

    init(level = 1) {
        this._super(level);
        this.maxHealth = 200 * level;
        this.currentHealth = this.maxHealth;
        this.healthBar.progress = 1;
        this.moveDuration = 3 + Math.random();
    },

    onEnterDead() {
        this._super();
        cc.tween(this.node)
            .to(0.3, { scale: 0 })
            .call(() => this.node.destroy())
            .start();
    },
});
const MonsterItem = require("MonsterItem");

cc.Class({
    extends: MonsterItem,

    init(level = 1) {
        this._super(level);
        this.maxHealth = 400 * level;
        this.currentHealth = this.maxHealth;
        this.healthBar.progress = 1;
        this.moveDuration = 2 + Math.random();
    },

    onEnterDead() {
        this._super();
        cc.tween(this.node)
            .to(0.5, { opacity: 0, scale: 2 })
            .call(() => this.node.destroy())
            .start();
    },
});

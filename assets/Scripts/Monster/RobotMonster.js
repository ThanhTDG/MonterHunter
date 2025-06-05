const MonsterItem = require("MonsterItem");

cc.Class({
    extends: MonsterItem,

    init(level = 1) {
        this._super(level);
        this.maxHealth = 300 * level;
        this.currentHealth = this.maxHealth;
        this.healthBar.progress = 1;
        this.moveDuration = 5 + Math.random();
    },

    onEnterDead() {
        this._super();
        cc.tween(this.node)
            .by(0.2, { angle: 360 })
            .to(0.3, { opacity: 0, y: this.node.y - 50 })
            .call(() => this.node.destroy())
            .start();
    },
});
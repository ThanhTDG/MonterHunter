export class PlayerStats {
    constructor({ hp = 100, damage = 20, shootSpeed = 0.5, moveSpeed = 500 } = {}) {
        this.hp = hp;
        this.damage = damage;
        this.shootSpeed = shootSpeed;
        this.moveSpeed = moveSpeed;
    }
    static createDefault() {
        return new PlayerStats();
    }

    setStats(config) {
        this.hp = config.hp;
        this.damage = config.damage;
        this.shootSpeed = config.shootSpeed;
        this.moveSpeed = config.moveSpeed;
    }
    applyBonusStats(bonusStats) {
        if (bonusStats && bonusStats instanceof PlayerStats) {
            this.hp += bonusStats.hp;
            this.damage += bonusStats.damage;
            this.shootSpeed = Math.max(0.01, this.shootSpeed - (0.01 * bonusStats.shootSpeed)).toFixed(3);
            this.moveSpeed += bonusStats.moveSpeed;
        }
    }
    toJSON() {
        return {
            hp: this.hp,
            damage: this.damage,
            shootSpeed: this.shootSpeed,
            moveSpeed: this.moveSpeed
        };
    }
    static fromJSON(json) {
        return new PlayerStats({
            hp: json.hp,
            damage: json.damage,
            shootSpeed: json.shootSpeed,
            moveSpeed: json.moveSpeed
        });
    }
    clone() {
        return new PlayerStats({
            hp: this.hp,
            damage: this.damage,
            shootSpeed: this.shootSpeed,
            moveSpeed: this.moveSpeed
        });
    }

}
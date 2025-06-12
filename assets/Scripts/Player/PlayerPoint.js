import { PlayerStats } from "./PlayerStats";

const { LocalStorage } = require("../Enum/LocalStorage");
const { PlayerPointType } = require("../Enum/PlayerPointType");
const { getFromLocalStorage, setToLocalStorage } = require("../Utils/IOUtils");

export const DefaultPointUpgrade = {
    BasePointUpgread: 100,
    PointUpgradeFactor: 1.2,
};
export const PlayerBonusStats = {
    [PlayerPointType.HP]: 10,
    [PlayerPointType.DAMAGE]: 1,
    [PlayerPointType.SHOOT_SPEED]: 1,
    [PlayerPointType.MOVE_SPEED]: 50,
};

export class PlayerPoint {
    constructor(hp = 0, damage = 0, shootSpeed = 0, moveSpeed = 0) {
        this.hp = hp;
        this.damage = damage;
        this.shootSpeed = shootSpeed;
        this.moveSpeed = moveSpeed;
    }

    static createDefault() {
        return new PlayerPoint();
    }

    static preLoad(onLoaded, onLoad) {
        let playerPoint = getFromLocalStorage(LocalStorage.PLAYER_POINT);
        if (!playerPoint) {
            playerPoint = PlayerPoint.createDefault();
        } else {
            playerPoint = PlayerPoint.fromJSON(playerPoint);
        }
        onLoad(1);
        onLoaded();
        return playerPoint;
    }

    setLocalStorage() {
        setToLocalStorage(LocalStorage.PLAYER_POINT, this.toJSON());
    }

    toPlayerBonusStats() {
        const hp = this.hp * PlayerBonusStats[PlayerPointType.HP];
        const damage = this.damage * PlayerBonusStats[PlayerPointType.DAMAGE];
        const shootSpeed = this.shootSpeed * PlayerBonusStats[PlayerPointType.SHOOT_SPEED];
        const moveSpeed = this.moveSpeed * PlayerBonusStats[PlayerPointType.MOVE_SPEED];
        return new PlayerStats({ hp, damage, shootSpeed, moveSpeed });

    }

    setPoint(type, value) {
        switch (type) {
            case PlayerPointType.HP:
                this.hp = value;
                break;
            case PlayerPointType.SHOOT_SPEED:
                this.shootSpeed = value;
                break;
            case PlayerPointType.MOVE_SPEED:
                this.moveSpeed = value;
                break;
            case PlayerPointType.DAMAGE:
                this.damage = value;
                break;
            default:
                console.warn(`Unknown point type: ${type}`);
        }
        this.setLocalStorage()
    }

    getPoint(type) {
        switch (type) {
            case PlayerPointType.HP:
                return this.hp;
            case PlayerPointType.DAMAGE:
                return this.damage;
            case PlayerPointType.SHOOT_SPEED:
                return this.shootSpeed;
            case PlayerPointType.MOVE_SPEED:
                return this.moveSpeed;
            default:
                console.warn(`Unknown point type: ${type}`);
                return 0;
        }
    }
    calculateUpgradeCost(type) {
        const currentPoint = this.getPoint(type);
        const rawCost = DefaultPointUpgrade.BasePointUpgread * Math.pow(DefaultPointUpgrade.PointUpgradeFactor, currentPoint);
        return Math.round(rawCost);
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
        return new PlayerPoint(json.hp, json.damage, json.shootSpeed, json.moveSpeed);
    }

    clone() {
        return new PlayerPoint(this.hp, this.damage, this.shootSpeed, this.moveSpeed);
    }

    total() {
        return this.hp + this.damage + this.shootSpeed + this.moveSpeed;
    }
}
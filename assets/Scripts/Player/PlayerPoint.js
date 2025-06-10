import { LocalStorage } from "../Enum/LocalStorage";
import { PlayerPointType } from "../Enum/PlayerPointType";
import { getFromLocalStorage, setToLocalStorage } from "../Utils/IOUtils";


export const PlayerBonusStats = {
    [PlayerPointType.HP]: 10,
    [PlayerPointType.SHOOT_SPEED]: 1,
    [PlayerPointType.MOVE_SPEED]: 0.1
};

export class PlayerPoint {
    constructor(hp = 0, shootSpeed = 0, moveSpeed = 0) {
        this.hp = hp;
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
        return {
            [PlayerPointType.HP]: this.hp * PlayerBonusStats[PlayerPointType.HP],
            [PlayerPointType.SHOOT_SPEED]: this.shootSpeed * PlayerBonusStats[PlayerPointType.SHOOT_SPEED],
            [PlayerPointType.MOVE_SPEED]: this.moveSpeed * PlayerBonusStats[PlayerPointType.MOVE_SPEED]
        };
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
            default:
                console.warn(`Unknown point type: ${type}`);
        }
    }

    getPoint(type) {
        switch (type) {
            case PlayerPointType.HP:
                return this.hp;
            case PlayerPointType.SHOOT_SPEED:
                return this.shootSpeed;
            case PlayerPointType.MOVE_SPEED:
                return this.moveSpeed;
            default:
                console.warn(`Unknown point type: ${type}`);
                return 0;
        }
    }

    toJSON() {
        return {
            hp: this.hp,
            shootSpeed: this.shootSpeed,
            moveSpeed: this.moveSpeed
        };
    }

    static fromJSON(json) {
        return new PlayerPoint(json.hp, json.shootSpeed, json.moveSpeed);
    }

    clone() {
        return new PlayerPoint(this.hp, this.shootSpeed, this.moveSpeed);
    }

    total() {
        return this.hp + this.shootSpeed + this.moveSpeed;
    }
}
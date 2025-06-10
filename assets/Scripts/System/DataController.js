import { PlayerPoint } from "../Player/PlayerPoint";
import { PlayerRecord } from "../Player/PlayerRecord";
import MapConfigs from "./MapConfigs";

export class DataController {
    static _instance = null;

    constructor() {
        this.playerPoint = null;
        this.playerRecord = null;
        this.mapConfigs = null;
        this.selectedMapId = null;
        this.playerStats = null;
    }

    static get instance() {
        if (!DataController._instance) {
            DataController._instance = new DataController();
        }
        return DataController._instance;
    }
    setRecordMapScore(mapId, score) {
        if (this.selectedMapId !== mapId) {
            throw new Error(`Selected map ID does not match the provided map ID: ${mapId}`);
        }
        this.playerRecord.setMapRecord(mapId, score);
    }

    getHighestMapCanSelect() {
        const recordId = this.playerRecord.getHighestId();
        const maxId = this.mapConfigs.length;
        return Math.min(recordId + 1, maxId);
    }

    getMoney() {
        return this.playerRecord.getMoney();
    }

    getPlayerPoint() {
        return this.playerPoint;
    }

    getMapConfigs() {
        return this.mapConfigs;
    }

    getMapConfig(mapId) {
        return this.mapConfigs[mapId];
    }

    getSelectedMapId() {
        return this.selectedMapId;
    }

    getSelectedMap() {
        if (!this.selectedMapId) {
            throw new Error("No map selected");
        }
        return this.mapConfigs.find(map => map.id === this.selectedMapId);
    }

    preLoad(onLoaded, onLoad) {
        this.playerPoint = PlayerPoint.preLoad(onLoaded, onLoad);
        this.playerRecord = PlayerRecord.preLoad(onLoaded, onLoad);
        this.mapConfigs = MapConfigs;
        this.resetSelectedMap();
        this.setupPlayerStats(this.playerPoint);
    }

    setupPlayerStats(playerPoint) {
        let playerStats = PlayerStats.createDefault();
        playerStats.applyBonusStats(playerPoint.toPlayerBonusStats());
        this.playerStats = playerStats;
    }

    setSelectedMapId(id) {
        this.selectedMapId = id;
    }

    resetSelectedMap() {
        this.selectedMapId = this.getHighestMapCanSelect();
    }


}
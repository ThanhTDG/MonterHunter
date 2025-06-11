const { PlayerPoint } = require("../Player/PlayerPoint");
const { PlayerRecord } = require("../Player/PlayerRecord");
const { PlayerStats } = require("../Player/PlayerStats");
const { MapConfigs } = require("./MapConfigs");

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
    getPLayerStats() {
        return this.playerStats.clone();
    }

    setSkillPoint(type, value) {
        this.playerPoint.setPoint(type, value);
        this.setPlayerStats(this.playerPoint);
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
    getCurrentMap() {
        if (!this.selectedMapId) {
            throw new Error("No map selected");
        }
        return this.mapConfigs.find(map => map.id === this.selectedMapId);
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
        this.setPlayerStats(this.playerPoint);
        this.resetSelectedMap();
    }

    setPlayerStats(playerPoint) {
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
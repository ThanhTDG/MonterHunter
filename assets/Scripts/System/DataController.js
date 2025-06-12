const { PlayerPoint } = require("../Player/PlayerPoint");
const { PlayerRecord } = require("../Player/PlayerRecord");
const { PlayerStats } = require("../Player/PlayerStats");
const { MapConfigs } = require("./MapConfigs");

export class DataController {
	static _instance = null;

	constructor() {
		this.playerPoint = null;
		this.playerRecord = null;
		this.selectedMapId = null;
		this.playerStats = null;
	}

	static get instance() {
		if (!DataController._instance) {
			DataController._instance = new DataController();
		}
		return DataController._instance;
	}

	setPlayerRecord(mapId, score, isWin) {
		this.playerRecord.setRecord(mapId, score, isWin);
	}

	hasNextMap() {
		return this.selectedMapId < this.getHighestMapCanSelect();
	}

	goToNextMap() {
		if (!this.hasNextMap()) {
			cc.error("No next map available");
			return null;
		}
		this.selectedMapId++;
		return this.selectedMapId;
	}

	getRawPlayerStats() {
		return this.playerStats;
	}

	getPlayerStats() {
		return this.playerStats.clone();
	}

	setSkillPoint(type, value) {
		this.playerPoint.setPoint(type, value);
		this.setPlayerStats(this.playerPoint);
	}

	getHighestMapCanSelect() {
		const recordId = this.playerRecord.getHighestId();
		const maxId = MapConfigs.length;
		return Math.min(recordId + 1, maxId);
	}

	getMoney() {
		return this.playerRecord.getMoney();
	}

	setMonney(amount) {
		return this.playerRecord.setMonney(amount);
	}

	getPlayerPoint() {
		return this.playerPoint;
	}

	canAffordUpgrade(type) {
		const playerPoint = this.getPlayerPoint();
		const cost = playerPoint.calculateUpgradeCost(type);
		const money = this.getMoney();
		return money >= cost;
	}

	getMapConfigs() {
		return MapConfigs;
	}

	getMapConfig(mapId) {
		const map = MapConfigs.find((map) => map.id === mapId);
		return map;
	}

	getSelectedMapId() {
		return this.selectedMapId;
	}
	getCurrentMap() {
		if (!this.selectedMapId) {
			throw new Error("No map selected");
		}
		return MapConfigs.find((map) => map.id === this.selectedMapId);
	}

	getSelectedMap() {
		if (!this.selectedMapId) {
			throw new Error("No map selected");
		}
		return MapConfigs.find((map) => map.id === this.selectedMapId);
	}
	getTotalScore(mapId) { }

	preLoad(onLoaded, onLoad) {
		this.playerPoint = PlayerPoint.preLoad(onLoaded, onLoad);
		this.playerRecord = PlayerRecord.preLoad(onLoaded, onLoad);
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
	destroy() {
		this.playerPoint = null;
		this.playerRecord = null;
		this.selectedMapId = null;
		this.playerStats = null;
		DataController._instance = null;
	}
}
const { LocalStorage } = require("../Enum/LocalStorage");
const { getFromLocalStorage, setToLocalStorage } = require("../Utils/IOUtils");

export class MapItemRecord {
	constructor(mapId = 0, score = 0) {
		this.id = mapId;
		this.score = score;
	}
	static createDefault() {
		return new MapItemRecord();
	}
	static fromJSON(json) {
		return new MapItemRecord(json.id, json.score);
	}
	toJSON() {
		return {
			id: this.id,
			score: this.score,
		};
	}
}

export class PlayerRecord {
	constructor(money = 0, mapRecord = []) {
		this.money = money;
		this.mapRecord = mapRecord;
	}

	static createDefault() {
		return new PlayerRecord();
	}

	static preLoad(onLoaded, onLoad) {
		let playerRecord = getFromLocalStorage(LocalStorage.PLAYER_RECORD);
		if (!playerRecord) {
			playerRecord = PlayerRecord.createDefault();
		} else {
			playerRecord = PlayerRecord.fromJSON(playerRecord);
		}
		onLoad(1);
		onLoaded();
		return playerRecord;
	}
	static fromJSON(json) {
		const mapRecord = Array.isArray(json.mapRecord)
			? json.mapRecord.map((item) => MapItemRecord.fromJSON(item))
			: [];
		return new PlayerRecord(json.money, mapRecord);
	}

	setLocalStorage() {
		setToLocalStorage(LocalStorage.PLAYER_RECORD, this.toJSON());
	}

	toJSON() {
		return {
			money: this.money,
			mapRecord: this.mapRecord.map((item) => item.toJSON()),
		};
	}

	addMoney(amount) {
		this.money += amount;
	}

	getMoney() {
		return this.money;
	}
	setRecord(mapId, score, isWin = false) {
		if (isWin) {
			this.setMapRecord(mapId, score);
		}
		this.addMoney(score);
		this.setLocalStorage();
	}

	setMapRecord(mapId, score) {
		const existingRecord = this.mapRecord.find((item) => item.id === mapId);
		if (!existingRecord) {
			this.mapRecord.push(new MapItemRecord(mapId, score));
			this.mapRecord.sort((a, b) => a.id - b.id);
		} else if (score > existingRecord.score) {
			existingRecord.score = score;
		}
	}

	getMapRecord(mapId) {
		return this.mapRecord.find((item) => item.id === mapId);
	}
	getHighestId() {
		if (this.mapRecord.length === 0) {
			return 0;
		}
		return this.mapRecord[this.mapRecord.length - 1].id;
	}
}

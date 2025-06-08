const { removeItemFromList, findItemInList } = require("../Utils/ListUtils");
const PopupEventKeys = require("../Event/EventKeys/PopupEventKeys");
const Emitter = require("../Event/Emitter");
const PopupItem = require("./PopupItem");
const { loadPrefabs } = require("../Utils/FileUtils");
cc.Class({
	extends: cc.Component,

	properties: {},

	onLoad() {
		this.initializeSetup();
	},
	onDestroy() {
		this.cleanup();
	},
	preLoad(onLoaded) {
		const nameFolder = "Popup";
		let total = 0;
		loadPrefabs(nameFolder, (prefabs) => {
			total = prefabs.length;
			prefabs.forEach((prefab) => {
				this.addPopup(prefab);
				onLoaded();
			});
		});
		return total;
	},
	initializeSetup() {
		this.openStack = [];
		this.popupList = [];
		this.registerEvents();
		cc.game.addPersistRootNode(this.node);
		this.centerOnScreen();
	},
	centerOnScreen() {
		const canvas = cc.director.getScene().getChildByName("Canvas");
		this.node.setPosition(canvas.getPosition());
		this.node.zIndex = 1000;
	},
	registerEvents() {
		this.eventMap = {
			[PopupEventKeys.SHOW_POPUP]: this.showPopup.bind(this),
			[PopupEventKeys.HIDE_POPUP]: this.hidePopup.bind(this),
			[PopupEventKeys.HIDE_ALL_POPUPS]: this.hideAllPopups.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	showPopup(type) {
		if (this.isPopupOpen(type)) {
			return;
		}
		const showPopupFound = (popup) => {
			popup.show();
			this.openStack.push(popup);
		};
		findItemInList(
			this.popupList,
			(popup) => popup.popupType === type,
			(popupFound) => showPopupFound(popupFound)
		);
	},
	isPopupOpen(type) {
		return this.openStack.some((popup) => popup.popupType === type);
	},
	hidePopup(type) {
		removeItemFromList(
			this.openStack,
			(popup) => popup.popupType === type,
			(popupFound) => popupFound.hide()
		);
	},
	hideAllPopups() {
		this.openStack.forEach((popup) => popup.hide());
		this.openStack = [];
	},
	addPopup(popupPrefab) {
		const item = this.createFromPrefab(popupPrefab);
		this.node.addChild(item.node);
		this.popupList.push(item);
	},
	createFromPrefab(popupPrefab) {
		const node = cc.instantiate(popupPrefab);
		const item = node.getComponent(PopupItem);
		if (!item) {
			cc.error("PopupItem component not found on the prefab.");
			return null;
		}
		return item;
	},
	cleanup() {
		Emitter.instance.removeEventMap(this.eventMap);
		this.openStack.forEach((popup) => popup.destroy());
		this.openStack = null;
		this.popupList = null;
		this.eventMap = null;
		this.node.destroyAllChildren();
		cc.game.removePersistRootNode(this.node);
	},
});

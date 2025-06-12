const { removeItemFromList, findItemInList } = require("../Utils/ListUtils");
const PopupEventKeys = require("../Event/EventKeys/PopupEventKeys");
const Emitter = require("../Event/Emitter");
const PopupItem = require("./PopupItem");
const { loadPrefabs } = require("../Utils/IOUtils");
const { PopupType } = require("../Enum/popupType");

cc.Class({
	extends: cc.Component,

	properties: {
	},

	onLoad() {
		this.initializeSetup();
	},
	onDestroy() {
		this.cleanup();
	},

	preLoad(onLoaded, onTotal) {
		this.preloadPopups(onLoaded, onTotal);
	},
	registerEvents() {
		this.eventMap = {
			[PopupEventKeys.SHOW_POPUP]: this.showPopup.bind(this),
			[PopupEventKeys.FORCE_HIDE_POPUP]: this.hidePopup.bind(this),
			[PopupEventKeys.HIDE_PAUSE_BATTLE_POPUP]: () => {
				this.hideTopPopup(PopupType.PAUSE_BATTLE);
			},
			[PopupEventKeys.HIDE_POPUP]: this.hideTopPopup.bind(this),
			[PopupEventKeys.HIDE_ALL_POPUPS]: this.hideAllPopups.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	initializeSetup() {
		this.openStack = [];
		this.popupMap = {};
		this.registerEvents();
		cc.game.addPersistRootNode(this.node);
		this.centerOnScreen();
	},
	showPopup(type, data = null) {
		if (this.isPopupOpen(type) || openStack.length === 1) {
			return;
		}
		const popup = this.popupMap[type];
		if (data) {
			popup.setData(data);
		}
		popup.show();
		this.openStack.push(type);
	},
	hideTopPopup(type) {
		let index = this.openStack.indexOf(type);
		if (index === -1) {
			throw new Error(`PopupController: hidePopup() - Popup of type ${type} is not open.`);
		}
		const isLast = index + 1 === this.openStack.length;
		if (!isLast) {
			throw new Error(`PopupController: hidePopup() - Popup of type ${type} is not the last one in the stack.`);
		}
		this.hidePopup(type);
	},
	hidePopup(type) {
		const popup = this.popupMap[type];
		popup.hide();
		removeItemFromList(this.openStack, (itemType) => itemType === type);
	},
	preloadPopups(onLoaded, onTotal) {
		const path = "Popup";
		loadPrefabs(path, (prefabs) => {
			if (onTotal) {
				onTotal(prefabs.length);
			}
			prefabs.forEach((prefab) => {
				this.addPopup(prefab);
				onLoaded();
			});
		});
	},
	addPopup(popupPrefab) {
		const node = cc.instantiate(popupPrefab);
		const item = node.getComponent(PopupItem);
		if (item) {
			this.node.addChild(node);
			this.popupMap[item.popupType] = item;

		}
	},
	centerOnScreen() {
		const canvas = cc.director.getScene().getChildByName("Canvas");
		this.node.setPosition(canvas.getPosition());
		this.node.zIndex = 1000;
	},


	isPopupOpen(type) {
		return this.openStack.includes(type);
	},
	hideAllPopups() {
		this.openStack.forEach((popupType) => this.hidePopup(popupType));
	},
	cleanup() {
		Emitter.instance.removeEventMap(this.eventMap);
		this.openStack = [];
		this.popupMap = {};
		this.eventMap = null;
		this.node.destroyAllChildren();
		cc.game.removePersistRootNode(this.node);
	},
});
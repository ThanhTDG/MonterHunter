const { AudioKey } = require("../../Enum/AudioKey");
const { PopupType } = require("../../Enum/popupType");
const { SCENE_TRANSITIONS } = require("../../Enum/Scene");
const Emitter = require("../../Event/Emitter");
const { HIDE_POPUP } = require("../../Event/EventKeys/PopupEventKeys");
const { SoundController } = require("../../Sound/SoundController");
const { DataController } = require("../../System/DataController");
const { SceneController } = require("../../System/SceneController");

cc.Class({
    extends: require("PopupItem"),

    properties: {
        popupType: {
            default: PopupType.SELECTMAP,
            override: true,
            type: cc.Enum(PopupType),
        },
        overlayButton: cc.Button,
        closeButton: cc.Button,
        mapListContainer: cc.Node,
        mapItemPrefab: cc.Prefab,

    },

    onLoad() {
        this.node.active = false;
        this.populateMapList();
    },

    registerEvents() {
        this.overlayButton.node.on("click", this.handleHide, this);
        this.closeButton.node.on("click", this.handleHide, this);
    },
    removeEvents() {
        this.overlayButton.node.off("click", this.handleHide, this);
        this.closeButton.node.off("click", this.handleHide, this);
    },

    handleHide() {
        this.emitHide();
    },
    emitHide() {
        this._super();
        SoundController.playSound(AudioKey.CLICK);
    },

    populateMapList() {
        this.mapListContainer.removeAllChildren();

        const mapConfigs = DataController.instance.getMapConfigs();

        mapConfigs.forEach((mapData) => {
            const mapNode = cc.instantiate(this.mapItemPrefab);
            mapNode.getChildByName('MapLabel').getComponent(cc.Label).string = mapData.name;
            mapNode.active = true;

            mapNode.on(cc.Node.EventType.TOUCH_END, () => this.onMapSelected(mapData), this);

            this.mapListContainer.addChild(mapNode);
        });
    },

    onMapSelected(mapData) {
        DataController.instance.setSelectedMapId(mapData.id);
        const battle = SCENE_TRANSITIONS.TO_BATTLE;
        SceneController.toScene(battle);
        this.emitHide();
    }
});

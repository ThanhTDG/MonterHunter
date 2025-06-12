const { DataController } = require("DataController");
const { SoundController } = require("../Sound/SoundController");
const { AudioKey } = require("../Enum/AudioKey");

cc.Class({
    extends: cc.Component,

    properties: {
        moneyPrefab: cc.Prefab,
        statPrefab: cc.Prefab,
    },

    onLoad() {
        this.statPrefabs = []
        this.init();
    },

    init() {
        this.createStatPrefabs();
        this.createMoneyPrefab();
        this.updateUI();
    },

    createStatPrefabs() {
        const stats = [
            { type: "damage", label: "Damage" },
            { type: "hp", label: "Health Point" },
            { type: "shootSpeed", label: "Shoot Speed" },
            { type: "moveSpeed", label: "Move Speed" },
        ];

        stats.forEach((stat) => {
            const statNode = cc.instantiate(this.statPrefab);
            const statLabel = statNode.getChildByName("Label").getComponent(cc.Label);
            const statButton = statNode.getChildByName("UpgradeButton").getComponent(cc.Button);
            const costLabel = statNode.getChildByName("CostLabel").getComponent(cc.Label);

            statLabel.string = `${stat.label}: 0`;
            costLabel.string = `Cost: 0`;

            statButton.node.on(
                "click",
                () => this.handleUpgrade(stat.type),
                this
            );

            this.node.addChild(statNode);
            this.statPrefabs.push({
                type: stat.type,
                node: statNode,
                label: statLabel,
                button: statButton,
                costLabel: costLabel,
            });
        });
    },



    createMoneyPrefab() {
        const moneyNode = cc.instantiate(this.moneyPrefab);
        const label = moneyNode.getComponent(cc.Label);

        this.node.addChild(moneyNode);
        this.moneyLabel = label;
    },

    updateUI() {
        const money = DataController.instance.getMoney();
        const playerStats = DataController.instance.getRawPlayerStats();

        this.statPrefabs.forEach(({ type, label, costLabel, button }) => {
            const playerPoint = DataController.instance.getPlayerPoint();
            const cost = playerPoint.calculateUpgradeCost(type);
            const currentStat = playerStats[type];


            label.string = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${currentStat}`;
            costLabel.string = `Cost: ${cost}`;

            button.node.opacity = money >= cost ? 255 : 100;
            button.interactable = money >= cost;
        });

        if (this.moneyLabel) {
            this.moneyLabel.string = `Money: ${money}`;
        }
    },



    handleUpgrade(type) {
        const dataController = DataController.instance;
        if (!dataController.canAffordUpgrade(type)) {
            return;
        }

        const playerPoint = dataController.getPlayerPoint();
        const cost = playerPoint.calculateUpgradeCost(type);
        const monney = dataController.getMoney();

        dataController.setSkillPoint(type, playerPoint.getPoint(type) + 1);
        dataController.setMonney(monney - cost);
        SoundController.playSound(AudioKey.UPGRADE);
        this.updateUI();
    },

    onDestroy() {
        this.statPrefabs.forEach(({ node }) => {
            if (node && node.isValid) {
                const button = node.getChildByName("UpgradeButton").getComponent(cc.Button);
                if (button) {
                    button.node.off("click", this.handleUpgrade, this);
                }
            }
        });
        this.moneyLabel = null;
    }

});

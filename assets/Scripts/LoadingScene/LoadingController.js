const { SceneName } = require("../Enum/SceneName");
const { SceneController } = require("../System/SceneController");
const { convertToCamelCase } = require("../Utils/ConvertUtils");

cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: cc.ProgressBar,
        loadingText: cc.RichText,
        text: "LOADING...",
    },
    onLoad() {
        this.initialize();
    },

    initialize() {
        this.progressBar.progress = 0;
        this.loadingText.string = "";
    },
    start() {
        preloadAll();
    },
    preloadAll() {
        const sceneNames = Object.values(SceneName);
        this.mapProgress = {};
        for (let i = 0; i < sceneNames.length; i++) {
            const name = sceneNames[i];
            preLoadScene(name)
        }
    },
    updateProgress() {
        const progressList = Object.values(this.mapProgress);
        const totalProgress = progressList.reduce((acc, val) => acc + val, 0);
        if (totalProgress < this.progressBar.progress) {
            return;
        }
        this.progressBar.progress = totalProgress;
    },
    setMapProgress(sceneName, percent = 0) {
        const currentProgress = this.mapProgress[sceneName] || 0;
        if (percent < currentProgress) {
            return;
        }
        this.mapProgress[sceneName] = percent;
        this.updateProgress();
    },
    preLoadScene(targetScene) {
        cc.director.preloadScene(
            targetScene,
            (completedCount, totalCount, item) => {
                const percent = (completedCount / totalCount);
                this.setMapProgress(targetScene, percent);
            },
            (error, asset) => {
                if (!error) {
                    SceneController.Instance.nextSceneLoaded();
                    console.log(`Preloaded scene: ${targetScene}`, asset);
                } else {
                    cc.error(`Preload scene error for ${targetScene}:`, error);
                }
            }
        );
    }
});
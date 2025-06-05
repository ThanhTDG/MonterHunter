const { SceneController } = require("../GameManager.js");
const { convertToCamelCase } = require("../Utils/ConvertUtils.js");

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
        this.onLoadingScreen(this.progressBar, this.loadingText, this.text);
    },
    onLoadingScreen(progressBar, richText, textLoading) {
        const targetScene = SceneController.Instance.targetScene;
        const startTime = Date.now();
        const targetState = convertToCamelCase(targetScene);
        richText.string = textLoading;
        cc.director.preloadScene(
            targetScene,
            (completedCount, totalCount, item) => {
                const percent = completedCount / totalCount;
                if (progressBar.progress > percent) {
                    return;
                }
                progressBar.progress = percent;
            },
            (error, asset) => {
                if (!error) {
                    SceneController.Instance.finishLoadScene();
                    console.log(asset);
                } else {
                    cc.error("Preload scene error:", error);
                }
            }
        );
    },
});

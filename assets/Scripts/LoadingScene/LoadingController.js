const { SceneController } = require("../GameManager.js");

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
        richText.string = textLoading;
        cc.director.preloadScene(
            targetScene,
            (completedCount, totalCount, item) => {
                const percent = completedCount / totalCount;
                if (progressBar.progress > result) {
                    return;
                }
                progressBar.progress = result;
            },
            (error, asset) => {
                if (!error) {
                    const elapsed = Date.now() - startTime;
                    const wait = Math.max(0, minTimeLoadingMs - elapsed);
                    setTimeout(() => {
                        cc.director.loadScene(targetScene);
                    }, wait);
                    console.log(asset);
                } else {
                    cc.error("Preload scene error:", error);
                }
            }
        );
    },
});

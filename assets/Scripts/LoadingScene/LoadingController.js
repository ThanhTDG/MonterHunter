const Emitter = require("../Event/Emitter");
const LoadingEventKeys = require("../Event/EventKeys/LoadingEventKeys");
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
	start() {
		this.emitStartLoading();
	},

	initialize() {
		this.progressBar.progress = 0;
		this.loadingText.string = this.text;
		this.registerEvents();
	},
	registerEvents() {
		this.eventMap = {
			[LoadingEventKeys.LOADING]: this.setProgress.bind(this),
			[LoadingEventKeys.LOADING_COMPLETE]: this.onLoadingComplete.bind(this),
		};
		Emitter.instance.registerEventMap(this.eventMap);
	},
	onLoadingComplete(loadedCallback) {
		this.progressBar.progress = 1;
		loadedCallback();
	},
	emitStartLoading() {
		Emitter.instance.emit(LoadingEventKeys.START_LOADING);
	},
	setProgress(percent) {
		this.progressBar.progress = percent;
	},
	onDestroy() {
		Emitter.instance.removeEventMap(this.eventMap);
	},
});

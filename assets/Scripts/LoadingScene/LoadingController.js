const Emitter = require("../Event/Emitter");
const LoadingEventKeys = require("../Event/EventKeys/LoadingEventKeys");
cc.Class({
	extends: cc.Component,

	properties: {
		progressBar: cc.ProgressBar,
		loadingText: cc.RichText,
		text: "LOADING...",
		loadingStep: 0,
	},
	onLoad() {
		this.initialize();
		this.schedule(this.animateLoadingText, 0.1)
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
	animateLoadingText() {
		const base = this.text;
		const step = this.loadingStep % base.length;

		let newText = "";
		for (let i = 0; i < base.length; i++) {
			if (i === step) {
				newText += `<b><size=45> ${base[i]} </size></b>`;
			} else {
				newText += base[i];
			}
		}
		this.loadingText.string = newText;
		this.loadingStep++;
	},

	onDestroy() {
		this.unschedule(this.animateLoadingText);
		Emitter.instance.removeEventMap(this.eventMap);
	},
});

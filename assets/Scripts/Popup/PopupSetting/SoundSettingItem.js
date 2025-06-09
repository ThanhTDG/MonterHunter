const { SoundConfigType } = require("../../Enum/SoundConfigType");
const { SoundController } = require("../../Sound/SoundController");

cc.Class({
    extends: cc.Component,

    properties: {
        soundType: {
            default: SoundConfigType.MASTER,
            type: cc.Enum(SoundConfigType),
        },
        slider: cc.Slider,
        fillSlider: cc.Sprite,
    },

    onLoad() {
        this.initialize();
    },
    initialize() {
        this.config = SoundController.instance.getConfig(this.soundType);
        this.setSlider(config.volume);
    },
    setSlider(value) {
        this.slider.progress = value;
        this.fillSlider.fillRange = value;
    },
    setFillSlider(value) {
        const width = this.slider.node.width;
        this.fillSlider.node.width = width * value;
    },
    onSliderChange(event) {
        const value = event.progress;
        this.setFillSlider(value);
        this.config.volume = value;
        SoundController.instance.setConfig(this.config);
    },
});
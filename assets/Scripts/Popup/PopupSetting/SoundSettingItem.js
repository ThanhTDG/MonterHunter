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
        this.setSlider(this.config.volume);
        this.setFillSlider(this.config.volume);
        this.registerEvents();
    },
    registerEvents() {
        this.slider.node.on("slide", this.onSliderChange, this);
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
        let value = event.progress;
        const isChange = this.config.volume !== value;
        if (!isChange) {
            return;
        }
        this.setSlider(value);
        this.setFillSlider(value);
        this.config.volume = value;
        SoundController.instance.updateVolume(this.soundType);
    },
});
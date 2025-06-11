const { PopupType } = require("../../Enum/popupType");
const Emitter = require("../../Event/Emitter");
const EMPTY_START_COLOR = cc.color(24, 24, 24);
const STAR_COLOR = cc.color(255, 255, 255);
cc.Class({
    extends: require("BattlePopupItem"),
    properties: {
        popupType: {
            default: PopupType.VICTORY,
            override: true,
            type: cc.Enum(PopupType),
        },
        nextMapButton: cc.Button,
        stars: {
            default: [],
            type: [cc.Sprite],
        },
        goldLabel: cc.Label,
        scoreLabel: cc.Label,
        totalScoreLabel: cc.Label,
    },
    onLoad() {
        this._super();
        this.initialize();
    },
    initialize() {
        this.animations = [];
        this.resetLabel();
    },
    show() {
        this._super();
        this.getScore();
        this.resetStars();
        this.displayStars();
        this.totalScoreLabel.string = `/${this.totalScore}`;
        this.animateScore();
        this.animateGold();
    },
    hide() {
        this._super();
        this.stopAllAnimations();
        this.resetLabel();
    },

    registerEvents() {
        this._super();
        this.nextMapButton.node.on("click", this.handleNextMap, this);
    },

    removeEvents() {
        this._super();
        this.nextMapButton.node.off("click", this.handleNextMap, this);
    },

    handleNextMap() {
        this.emitHide();
        Emitter.instance.emit(NEXT_MAP);
    },
    setTotalScoreLabel(totalScore) {
        this.totalScoreLabel.string = `/ ${totalScore}`;
    },
    resetLabel() {
        this.scoreLabel.string = "0";
        this.goldLabel.string = "0";
        this.totalScoreLabel.string = "/ 0";
    },

    getScore() {
        const data = this.getData();
        if (!data) {
            cc.error("VictoryPopup: getData() - data is not set");
            return;
        }
        const { score, totalScore } = data;
        console.log(this)
        this.score = Number(score)
        this.totalScore = Number(totalScore)
        this.goldValue = Number(score)
    },

    setScore(score) {
        this.score.string = score;
    },

    setGold(gold) {
        this.gold.string = gold;
    },

    resetStars() {
        this.stars.forEach(star => this.resetNode(star));
    },

    resetNode(node, scale = 0) {
        node.scale = scale;
        node.stopActions && node.stopActions();
        cc.Tween && cc.Tween.stopAllByTarget && cc.Tween.stopAllByTarget(node);
    },

    displayStars() {
        const maxStars = this.getMaxStars(this.score, this.totalScore);
        let promise = Promise.resolve();
        for (let i = 0; i < this.stars.length; i++) {
            const starNode = this.stars[i].node;
            starNode.scale = 0;
            if (i < maxStars) {
                promise = promise.then(() => this.animateStarBright(starNode));
            } else {
                promise = promise.then(() => this.animateStarEmpty(starNode));
            }
        }
        return promise;
    },

    animateStarBright(node) {
        node.color = STAR_COLOR;
        return this.tweenScaleAndSpin(node);
    },

    animateStarEmpty(node) {
        node.color = EMPTY_START_COLOR;
        return this.tweenScaleAndSpin(node);
    },

    animateScore(duration = 1.2) {
        const finalScore = this.score;
        const totalScore = this.totalScore;
        const maxStars = this.getMaxStars(finalScore, totalScore);
        const isMaxStars = maxStars === 3;
        let obj = { value: 0 };
        const tween = this.createScoreTween(obj, finalScore, isMaxStars, duration);
        this.animations.push(tween);
        tween.start();
    },

    animateGold(duration = 1.2) {
        const finalGold = this.goldValue;
        let obj = { value: 0 };
        const tween = this.createGoldTween(obj, finalGold, duration);
        this.animations.push(tween);
        tween.start();
    },

    animateStarBright(node) {
        node.color = STAR_COLOR;
        return this.tweenScaleAndSpin(node);
    },

    animateStarEmpty(node) {
        node.color = EMPTY_START_COLOR;
        return this.tweenScaleAndSpin(node);
    },

    createScoreTween(obj, finalScore, isMaxStars, duration) {
        const maxColor = cc.color(255, 191, 78);
        const minColor = cc.color(255, 255, 255);
        return cc.tween(obj)
            .to(duration, { value: finalScore }, {
                progress: (start, end, current, ratio) => {
                    const displayValue = Math.floor(start + (end - start) * ratio);
                    this.scoreLabel.string = `${displayValue}`;
                    this.scoreLabel.node.color = isMaxStars
                        ? maxColor
                        : minColor;
                    return start + (end - start) * ratio;
                }
            })
            .call(() => {
                this.scoreLabel.string = `${finalScore}`;
                this.scoreLabel.node.color = isMaxStars
                    ? maxColor
                    : minColor;
            });
    },

    createGoldTween(obj, finalGold, duration) {
        return cc.tween(obj)
            .to(duration, { value: finalGold }, {
                progress: (start, end, current, ratio) => {
                    const displayValue = Math.floor(start + (end - start) * ratio);
                    this.goldLabel.string = `+ ${displayValue}`;
                    return start + (end - start) * ratio;
                }
            })
            .call(() => {
                this.goldLabel.string = `+ ${finalGold}`;
            });
    },
    tweenScaleAndSpin(node, rotation = 720) {
        const currentAngle = node.angle;
        const endAngle = currentAngle - rotation;
        cc.Tween && cc.Tween.stopAllByTarget && cc.Tween.stopAllByTarget(node);

        const tween = cc.tween(node)
            .to(0.3, { scale: 1, angle: endAngle }, { easing: "backOut" })
            .call(() => {
                node.angle = currentAngle;
            });

        this.animations.push(tween);
        return new Promise(resolve => {
            tween.call(() => {
                this.animations = this.animations.filter(anim => anim !== tween);
                resolve();
            }).start();
        });
    },
    getMaxStars(score, totalScore) {
        if (!totalScore || totalScore === 0) return 0;
        return Math.floor((score / totalScore) * 3);
    },

    getScoreColor(ratio, isMaxStars) {
        if (isMaxStars) {
            if (ratio < 0.7) {
                const gray = Math.floor(24 + (255 - 24) * (ratio / 0.7));
                return `rgb(${gray},${gray},${gray})`;
            } else {
                const t = (ratio - 0.7) / 0.3;
                const r = 255;
                const g = Math.floor(255 + (215 - 255) * t);
                const b = Math.floor(255 + (0 - 255) * t);
                return `rgb(${r},${g},${b})`;
            }
        } else {
            const gray = Math.floor(24 + (255 - 24) * ratio);
            return `rgb(${gray},${gray},${gray})`;
        }
    },

    stopAllAnimations() {
        if (!this.animations) return;
        this.animations.forEach(anim => anim.stop && anim.stop());
        this.animations = [];
    }
});
cc.Class({
	extends: cc.Component,

	properties: {},

	onClickOpenGame() {
		cc.director.loadScene("Loading");
	},
});

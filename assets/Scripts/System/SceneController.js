const { SceneName } = require("../Enum/SceneName");
const StateController = require("javascript-state-machine");
const STATE = {
	LOADING: "loading",
	LOBBY: "lobby",
	BATTLE: "battle",
};
const TRANSITIONS = {
	TO_LOADING: "toLoading",
	TO_BATTLE: "toBattle",
	TO_LOBBY: "toLobby",
};
export class SceneController {
	static _instance = null;

	constructor() {
		this.initialize();
	}
	static get instance() {
		if (!SceneController._instance) {
			SceneController._instance = new SceneController();
		}
		return SceneController._instance;
	}
	initialize() {
		this.initializeState();
	}

	initializeState() {
		this.state = new StateController({
			init: STATE.LOADING,
			transitions: [
				{
					name: TRANSITIONS.TO_LOBBY,
					from: [STATE.LOADING, STATE.BATTLE],
					to: STATE.LOADING,
				},
				{
					name: TRANSITIONS.TO_BATTLE,
					from: STATE.LOBBY,
					to: STATE.BATTLE,
				},
			],
			methods: {
				onToBattle: this.onToBattle.bind(this),
				onToLobby: this.onToLobby.bind(this),
			},
		});
	}

	onToBattle() {
		this.loadScene(SceneName.BATTLE);
	}
	onToLobby() {
		this.loadScene(SceneName.LOBBY);
	}
	loadScene(sceneName) {
		cc.director.loadScene(sceneName);
	}

	destroy() {
		this.state = null;
		this.mapEvent = null;
		this.targetScene = null;
		SceneController._instance = null;
	}
}

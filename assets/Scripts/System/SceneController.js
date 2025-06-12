const Emitter = require("../Event/Emitter");

const { SceneName } = require("../Enum/Scene");
const StateController = require("javascript-state-machine");
const STATE = {
	LOADING: SceneName.LOADING,
	LOBBY: SceneName.LOBBY,
	BATTLE: SceneName.BATTLE,
};
const { SCENE_TRANSITIONS: TRANSITIONS } = require("../Enum/Scene");

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

	static toScene(transitionName) {
		SceneController._instance.stateController[transitionName]();
	}

	preLoad(onLoaded, onTotal) {
		const names = Object.values(SceneName);
		if (onTotal) {
			onTotal(names.length);
		}
		names.forEach((sceneName) => {
			cc.director.preloadScene(sceneName, null, (error, asset) => {
				if (!error) {
					onLoaded();
				} else {
					cc.error(`Preload scene error for ${sceneName}:`, error);
				}
			});
		});
	}

	initialize() {
		this.initializeState();
	}

	initializeState() {
		this.stateController = new StateController({
			init: STATE.LOADING,
			transitions: [
				{
					name: TRANSITIONS.TO_LOBBY,
					from: [STATE.LOADING, STATE.BATTLE],
					to: STATE.LOBBY,
				},
				{
					name: TRANSITIONS.TO_BATTLE,
					from: STATE.LOBBY,
					to: STATE.BATTLE,
				},
			],
			methods: {
				onToBattle: this.loadScene.bind(this),
				onToLobby: this.loadScene.bind(this),
			},
		});
	}

	loadScene() {
		cc.director.loadScene(this.stateController.state);
	}

	destroy() {
		if (this.eventMap) {
			Emitter.instance.removeEventMap(this.eventMap);
		}
		this.stateController = null;
		this.eventMap = null;
		this.targetScene = null;
		SceneController._instance = null;
	}
}
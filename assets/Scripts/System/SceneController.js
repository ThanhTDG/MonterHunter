import Emitter from "../Event/Emitter";
import { EnumValidate } from "../Utils/ValidatesUtils";

const { SceneName } = require("../Enum/SceneName");
const SceneEventKeys = require("../Event/EventKeys/SceneEventKeys");
const StateController = require("javascript-state-machine");
const STATE = {
	LOADING: "loading",
	LOBBY: "lobby",
	BATTLE: "battle",
	EXIT: "exit",
};
const TRANSITIONS = {
	TO_LOADING: "toLoading",
	TO_BATTLE: "toBattle",
	TO_LOBBY: "toLobby",
	TO_EXIT: "toExit",
};
export class SceneController {
	static _instance = null;

	constructor() {
		this.targetScene = SceneName.LOBBY;
		this.initialize();
	}
	static get Instance() {
		if (!SceneController._instance) {
			SceneController._instance = new SceneController();
		}
		return SceneController._instance;
	}
	initialize() {
		this.initializeState();
		this.registerEvents();
		this.setTransition(this.targetScene);
	}
	registerEvents() {
		this.mapEvent = {
			[SceneEventKeys.NEXT_SCENE]: this.nextScene.bind(this),
			[SceneEventKeys.LOAD_SCENE]: this.loadScene.bind(this),
		};
		Emitter.instance.registerEventMap(this.mapEvent);
	}
	initializeState() {
		this.state = new StateController({
			init: STATE.LOADING,
			transitions: [
				{
					name: TRANSITIONS.TO_LOADING,
					from: [STATE.LOBBY, STATE.BATTLE],
					to: STATE.LOADING,
				},
				{
					name: TRANSITIONS.TO_LOBBY,
					from: STATE.LOADING,
					to: STATE.LOBBY,
				},
				{
					name: TRANSITIONS.TO_BATTLE,
					from: STATE.LOADING,
					to: STATE.BATTLE,
				},
				{
					name: TRANSITIONS.TO_EXIT,
					from: [STATE.LOBBY, STATE.BATTLE],
					to: STATE.EXIT,
				},
			],
			methods: {
				onToBattle: this.handleOnToScene.bind(this),
				onToLoading: this.handleOnToScene.bind(this),
				onToLobby: this.handleOnToScene.bind(this),
				onToExit: () => {},
			},
		});
	}

	handleOnToScene() {
		this.loadScene();
	}
	loadScene() {
		cc.director.loadScene(this.targetScene);
		this.targetScene = null;
	}

	nextScene(targetScene) {
		if (!EnumValidate(SceneName, targetScene)) {
			cc.error(`SceneController: Invalid scene name ${targetScene}`);
			return;
		}
		if (!this.state.can(STATE.LOADING)) {
			cc.error(
				`SceneController: Cannot transition to loading state from ${this.state.current}`
			);
			return;
		}
		this.state.toLoading();
		this.targetScene = targetScene;
		this.setTransition(targetScene);
	}
	setTransition(sceneName) {
		const transitionName = `to${sceneName}`;
		this.transition = this.state.toLobby.bind(this);
		this.transition1 = this.state[transitionName];
		this.transition2 = this.state[transitionName].bind(this.state);
	}
	nextSceneLoaded() {
		this.transition();
	}
	Destroy() {
		this.state = null;
		this.mapEvent = null;
		this.targetScene = null;
		Emitter.instance.removeEventMap(this.mapEvent);
		SceneController._instance = null;
	}
}

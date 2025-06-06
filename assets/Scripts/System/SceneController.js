import Emitter from "../Event/Emitter";
import { EnumValidate } from "../Utils/ValidatesUtils";

const { SceneName } = require("../Enum/SceneName");
const SceneEventKeys = require("../Event/EventKeys/SceneEventKeys");
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
	static get Instance() {
		if (!SceneController._instance) {
			SceneController._instance = new SceneController();
		}
		return SceneController._instance;
	}
	initialize() {
		this.initializeState();
	}

	initializeState() {
		this.sceneState = new StateController({
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
				onToBattle: this.handleOnToBattle.bind(this),
				onToLoading: this.handleOnToLoading.bind(this),
				onToLobby: this.handleOnToLobby.bind(this),
				onToExit: () => { },
			},
		});
	}
	

	handleOnToBattle() {
		this.loadScene(SceneName.BATTLE);
	}
	handleOnToLoading() {
		this.loadScene(SceneName.LOADING);
	}
	handleOnToLobby() {
		this.loadScene(SceneName.LOBBY);
	}
	loadScene(sceneName) {
		cc.director.loadScene(sceneName)
	}
	destroy() {
		this.state = null;
		this.mapEvent = null;
		this.targetScene = null;
		Emitter.instance.removeEventMap(this.mapEvent);
		SceneController._instance = null;
	}
}

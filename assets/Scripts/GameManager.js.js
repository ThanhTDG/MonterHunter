const { AudioKey } = require("./Enum/AudioKey");
const { SceneName } = require("./Enum/SceneName");
const Emitter = require("./Event/Emitter");
const { AudioPath } = require("./Sound/AudioConfigs");
const { SoundController } = require("./Sound/SoundController");
const { ConvertEnumToCamelCase, convertToCamelCase } = require("./Utils/ConvertUtils");
const { loadAudioClip } = require("./Utils/FileUtils");
const State = require('javascript-state-machine');
const SceneEventKey = require("./Event/EventKeys/SceneEventKeys");
cc.Class({
	extends: cc.Component,

	properties: {},
	onLoad() {
		this.initialize();
	},
	start() { },

	initialize() {
		cc.game.addPersistRootNode(this.node);
		this.loadSound();

	},
	loadSound() {
		Object.keys(AudioPath).forEach((key) => {
			const path = AudioPath[key];
			loadAudioClip(path, key, (clip) => {
				console.log(key);
				SoundController.instance.setAudioClip(key, clip);
			});
		});
	},

	onDestroy() {
		SoundController.instance.destroy();
		Emitter.instance.destroy();
	},
});

const STATE = {
	LOADING: 'loading',
	LOBBY: 'lobby',
	BATTLE: 'battle',
	EXIT: 'exit',
}
const TRANSITIONS = {
	TO_LOADING: 'toLoading',
	TO_SCENE: 'toScene',
	TO_EXIT: 'toExit',
}
export class SceneController {
	static _instance = null;

	constructor() {
		this.targetScene = SceneName.LOBBY;
		this.initialize();
	}
	initialize() {
		this.initializeState();
		this.registerEvents();
	}
	registerEvents() {
		this.mapEvent = {
			[SceneEventKey.NEXT_SCENE]: this.nextScene.bind(this),
			[SceneEventKey.LOAD_SCENE]: this.loadScene.bind(this),
		};
	}
	initializeState() {
		this.state = new State({
			init: STATE.LOADING,
			transitions: [
				{ name: TRANSITIONS.TO_LOADING, from: [STATE.LOBBY, STATE.BATTLE], to: STATE.LOADING },
				{ name: TRANSITIONS.TO_SCENE, from: STATE.LOADING, to: [STATE.LOBBY, STATE.BATTLE] },
				{ name: TRANSITIONS.TO_EXIT, from: [STATE.LOBBY, STATE.BATTLE], to: STATE.EXIT },
			],
			methods: {
				onToScene: this.handleOnToScene.bind(this),
				onToLoading: () => {
					this.loadScene(SceneName.LOADING);
				},
				onToExit: () => {
				}
			},
		});
	}
	finishLoadScene() {
		let targetState = convertToCamelCase(this.targetScene);
		this.state[targetState]()
	}
	handleOnToScene() {
		this.loadScene(this.targetScene);
	}
	loadScene(targetScene) {
		cc.director.loadScene(targetScene);
	}
	nextScene(targetScene) {
		if (!this.state.can(STATE.LOADING)) {
			cc.log(`SceneController: Cannot transition to loading state from ${this.state.current}`);
		}
		this.state.toLoading();
		this.targetScene = targetScene;
	}
	static get Instance() {
		if (!SceneController._instance) {
			SceneController._instance = new SceneController();
		}
		return SceneController._instance;
	}
}
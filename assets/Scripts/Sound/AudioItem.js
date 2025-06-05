export class AudioItem {
	constructor({ id = null, clip = null } = {}) {
		this.id = id;
		this.clip = clip;
	}
	setClip(clip) {
		this.id = null;
		this.clip = clip;
	}
	hasClip() {
		return this.clip !== null;
	}
	getClip() {
		return this.clip;
	}
	setId(id) {
		this.id = id;
	}
	getId() {
		return this.id;
	}
	static createDefault() {
		return new AudioItem();
	}
}

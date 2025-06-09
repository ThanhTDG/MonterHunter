export const loadDirectory = (path, callback, type) => {
	cc.loader.loadResDir(path, type, (err, assets) => {
		if (err) {
			cc.error(`Failed to load directory: ${path}`, err);
		} else {
			callback(assets);
		}
	});
};

export const loadAsset = (path, callback, type) => {
	cc.loader.loadRes(path, type, (err, asset) => {
		if (err) {
			cc.error(`Failed to load asset: ${path}`, err);
		} else {
			callback(asset);
		}
	});
};

export const loadAudioClip = (name, callback) => {
	const path = `Sounds/${name}`;
	loadAsset(path, callback, cc.AudioClip);
};

export const loadAudioClips = (path, callback) => {
	loadDirectory(path, callback, cc.AudioClip);
};
export const loadPrefab = (path, callback) => {
	path = "Prefabs/" + path;
	loadAsset(path, callback, cc.Prefab);
};

export const loadPrefabs = (path, callback) => {
	path = "Prefabs/" + path;
	loadDirectory(path, callback, cc.Prefab);
};

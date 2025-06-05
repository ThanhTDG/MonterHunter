
export const loadAudioClip = (path, audioKey, callback) => {
    cc.loader.loadRes(path, cc.AudioClip, (err, clip) => {
        if (err) {
            cc.error(`Failed to load audio clip: ${audioKey}`, err);
        } else {
            callback(clip);
        }
    });
}
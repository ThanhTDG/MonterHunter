const EventEmitter = require('events');
class mEmitter {
    static _instance = null;
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(100);
    }
    static get instance() {
        if (!mEmitter._instance) {
            mEmitter._instance = new mEmitter();
        }
        return mEmitter._instance;
    }
    emit(...args) {
        this.emitter.emit(...args);
    }
    registerEvent(event, listener) {
        this.emitter.on(event, listener);
    }
    registerOnce(event, listener) {
        this.emitter.once(event, listener);
    }
    registerEventMap(eventMap) {
        for (const event in eventMap) {
            this.registerEvent(event, eventMap[event]);
        }
    }
    removeEventMap(eventMap) {
        for (const event in eventMap) {
            this.removeEvent(event, eventMap[event]);
        }
    }
    removeEvent(event, listener) {
        this.emitter.removeListener(event, listener);
    }
    destroy() {
        this.emitter.removeAllListeners();
        this.emitter = null;
        mEmitter._instance = null;
    }
}

module.exports = mEmitter;
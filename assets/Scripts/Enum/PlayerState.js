const PlayerState = {
    State: {
        NULL: 'null',
        READY: 'ready',
        MOVING: 'moving',
        STOP: 'stop',
        SHOOTING: 'shooting',
    },
    Transition: {
        INITIALIZE: 'initialize',
        MOVE: 'move',
        STOP: 'stop',
        SHOOT: 'shoot',
    }
};

module.exports = PlayerState;
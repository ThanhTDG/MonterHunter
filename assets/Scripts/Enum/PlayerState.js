const State = {
    NULL: "null",
    READY: "ready",
    MOVING: "moving",
    SHOOTING: "shooting",
    STOP: "stop",
    DEAD: "dead",
};

const Transition = {
    INITIALIZE: "initialize",
    MOVE: "move",
    STOP: "stop",
    SHOOT: "shoot",
    DIE: "die",
};

module.exports = {
    State,
    Transition,
};

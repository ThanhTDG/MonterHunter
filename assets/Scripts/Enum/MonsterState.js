const MonsterState = {
    State: {
        IDLE: 'IDLE',
        MOVING: 'MOVING',
        HIT: 'HIT',
        DEAD: 'DEAD'
    },
    Transition: {
        START_MOVING: 'startMoving',
        GET_HIT: 'getHit',
        RESUME: 'resume',
        DIE: 'die'
    }
};

module.exports = MonsterState;

cc.Class({
    extends: cc.Component,

    calculate(deadCount, currentHP, isPlayerDead, baseMultiplier = 10) {
        if (isPlayerDead) {
            return deadCount * baseMultiplier;
        }

        let bonusMultiplier = 1.0;

        if (currentHP === 100) {
            bonusMultiplier = 1.5;
        } else if (currentHP > 75) {
            bonusMultiplier = 1.3;
        } else if (currentHP > 50) {
            bonusMultiplier = 1.25;
        } else {
            bonusMultiplier = 1.0;
        }

        const score = (Math.floor(deadCount * bonusMultiplier)) * baseMultiplier;
        return score;
    }
});

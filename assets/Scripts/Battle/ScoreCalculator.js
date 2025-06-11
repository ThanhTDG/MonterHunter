cc.Class({
	extends: cc.Component,

	calculate(
		currentHP,
		deadCount,
		remainingCount,
		isPlayerDead,
		baseMultiplier = 10
	) {
		if (isPlayerDead) {
			return deadCount * baseMultiplier;
		}
		let bonusMultiplier = this.getBonusMultiple(currentHP);
		const score = deadCount * bonusMultiplier * baseMultiplier;
		return score;
	},

	getBonusMultiple(healthPoint) {
		if (healthPoint === 100) {
			return 1.5;
		}
		if (healthPoint > 75) {
			return 1.3;
		}
		if (healthPoint > 50) {
			return 1.25;
		}
		return 1.0;
	},
});

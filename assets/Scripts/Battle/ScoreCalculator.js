cc.Class({
	extends: cc.Component,

	calculate(scoreData, baseMultiplier = 10) {
		if (scoreData.isPlayerDead || scoreData.remainingCount > 0) {
			return scoreData.deadCount * baseMultiplier;
		}
		let bonusMultiplier = this.getBonusMultiple(scoreData.healthPoint);
		const score = scoreData.deadCount * bonusMultiplier * baseMultiplier;
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

export const calculateScore = (isVictory, scoreData, baseMultiplier = 10) => {
	const { healthRatio, deadCount } = scoreData;
	if (!isVictory) {
		return deadCount * baseMultiplier;
	}
	const bonusMultiplier = getBonusMultiple(healthRatio);
	const score = deadCount * bonusMultiplier * baseMultiplier;
	return score;
};

const getBonusMultiple = (healthRatio) => {
	if (healthRatio === 1) {
		return 1.5;
	}
	if (healthRatio > 0.75) {
		return 1.3;
	}
	if (healthRatio > 0.5) {
		return 1.25;
	}
	return 1.0;
};

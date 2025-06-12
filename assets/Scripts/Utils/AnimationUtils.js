const { getInterpolatedStepColor } = require("./ColorUtils");

export const getTweenIncreaseNumber = (
	obj,
	finalValue,
	duration,
	onUpdate,
	onComplete
) => {
	return cc
		.tween(obj)
		.to(
			duration,
			{ value: finalValue },
			{
				progress: (start, end, current, ratio) => {
					const displayValue = Math.floor(start + (end - start) * ratio);
					if (typeof onUpdate === "function") {
						onUpdate(displayValue, ratio);
					}
					return start + (end - start) * ratio;
				},
			}
		)
		.call(() => {
			if (typeof onUpdate === "function") {
				onUpdate(finalValue, 1);
			}
			if (typeof onComplete === "function") {
				onComplete();
			}
		});
};

export const getTweenScoreLabel = (
	label,
	finalScore,
	maxScore,
	colors = [
		cc.color(255, 255, 255),
		cc.color(255, 215, 0),
		cc.color(255, 191, 78),
	],
	duration = 1.2
) => {
	const obj = { value: 0 };
	const updateLabelColor = (displayValue) => {
		const percent = displayValue / maxScore;
		const color = getInterpolatedStepColor(percent, colors);
		label.string = `${displayValue}`;
		label.node.color = color;
	};
	return getTweenIncreaseNumber(obj, finalScore, duration, updateLabelColor);
};

export const getTweenGoldLabel = (label, finalGold, duration = 1.2) => {
	const obj = { value: 0 };
	const updateLabel = (displayValue) => {
		label.string = `+ ${displayValue}`;
	};
	return getTweenIncreaseNumber(obj, finalGold, duration, updateLabel);
};

export const getTweenScaleAndSpin = (node, rotation = 720, duration = 0.3) => {
	const currentAngle = node.angle;
	const endAngle = currentAngle - rotation;
	return cc
		.tween(node)
		.to(duration, { scale: 1, angle: endAngle }, { easing: "backOut" })
		.call(() => {
			node.angle = currentAngle;
		});
};

export const getTweenStarPopupScale = (
	node,
	scaleUp = 1.3,
	durationUp = 0.2,
	durationDown = 0.15
) => {
	return cc
		.tween(node)
		.to(durationUp, { scale: scaleUp }, { easing: "backOut" })
		.to(durationDown, { scale: 1 }, { easing: "sineIn" });
};

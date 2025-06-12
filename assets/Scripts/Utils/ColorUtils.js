export const interpolateColor = (fromColor, toColor, ratio) => {
	const r = fromColor.r + (toColor.r - fromColor.r) * ratio;
	const g = fromColor.g + (toColor.g - fromColor.g) * ratio;
	const b = fromColor.b + (toColor.b - fromColor.b) * ratio;
	return cc.color(r, g, b);
};
export const getInterpolatedStepColor = (progress, steps) => {
	let fromColor = steps[0];
	let toColor = steps[steps.length - 1];
	let interpolationRatio = 1;

	for (let i = 1; i < steps.length; i++) {
		const threshold = i / steps.length;
		if (progress < threshold) {
			fromColor = steps[i - 1];
			toColor = steps[i];
			interpolationRatio = (progress - (i - 1) / steps.length) * steps.length;
			break;
		}
	}
	return interpolateColor(fromColor, toColor, interpolationRatio);
};

export const VolumeValidate = (volume) => {
	return typeof volume === "number" && volume >= 0 && volume <= 1;
};
export const EnumValidate = (value, enumObject) => {
	return Object.values(enumObject).includes(value);
};

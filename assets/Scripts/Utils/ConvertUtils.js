export const convertToCamelCase = (str) => {
    let s = str.toLowerCase().replace(/(_[a-z])/g, (group) => group[1].toUpperCase());
    return s.charAt(0).toLowerCase() + s.slice(1);
}
export const ConvertEnumToCamelCase = (enumObject) => {
    const result = {};
    for (const key in enumObject) {
        if (Object.prototype.hasOwnProperty.call(enumObject, key)) {
            const value = convertToCamelCase(enumObject[key]);
            result[key] = value
        }
    }
    return result;
}
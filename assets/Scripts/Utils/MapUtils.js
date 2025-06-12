const { MapConfigs } = require("../System/MapConfigs");

export const getTotalMonster = (mapId) => {
    const map = MapConfigs.find(m => m.id === mapId);
    return map.waves.reduce((total, wave) => total + wave.length, 0);
}

export const getMapById = (mapId) => {
    const map = MapConfigs.find(m => m.id === mapId);
    return map;
}

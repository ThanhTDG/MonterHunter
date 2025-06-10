export const MapConfigs = [
    {
        id: 1,
        name: "Forest",
        totalScore: 10,
        endTime: 15,
        waves: [
            [{ type: "DogMonster", count: 3 }],
            [{ type: "DogMonster", count: 4 }, { type: "WolfMonster", count: 2 }]
        ]
    },
    {
        id: 2,
        name: "Cave",
        totalScore: 15,
        endTime: 15,
        waves: [
            [{ type: "DogMonster", count: 5 }],
            [{ type: "WolfMonster", count: 5 }],
            [{ type: "DragonMonster", count: 5 }]
        ]
    },
    {
        id: 3,
        name: "Volcano",
        totalScore: 20,
        endTime: 15,
        waves: [
            [{ type: "DogMonster", count: 10 }, { type: "WolfMonster", count: 5 }],
            [{ type: "DragonMonster", count: 5 }]
        ]
    }
]

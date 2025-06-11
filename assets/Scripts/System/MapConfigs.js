export const MapConfigs = [
    {
        id: 1,
        name: "Forest",
        endTime: 15,
        waves: [
            [
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 },
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 },
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 }
            ],
            [
                { type: "DogMonster", level: 2, health: 90, damage: 7, speed: 120 },
                { type: "WolfMonster", level: 2, health: 120, damage: 10, speed: 130 },
                { type: "WolfMonster", level: 2, health: 120, damage: 10, speed: 130 },
            ],
            [
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 },
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 },
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 },
            ],
        ]
    },
    {
        id: 2,
        name: "Cave",
        endTime: 15,
        waves: [
            [
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 },
                { type: "DogMonster", level: 2, health: 90, damage: 7, speed: 120 },
                { type: "DogMonster", level: 2, health: 90, damage: 7, speed: 120 }
            ],
            [
                { type: "WolfMonster", level: 3, health: 160, damage: 14, speed: 140 },
                { type: "WolfMonster", level: 4, health: 180, damage: 18, speed: 100 },
                { type: "WolfMonster", level: 4, health: 180, damage: 18, speed: 100 },
            ],
            [
                { type: "DogMonster", level: 3, health: 110, damage: 9, speed: 130 },
                { type: "WolfMonster", level: 4, health: 180, damage: 18, speed: 150 },
                { type: "DragonMonster", level: 4, health: 250, damage: 25, speed: 110 },
            ],
        ]
    },
    {
        id: 3,
        name: "Volcano",
        endTime: 15,
        waves: [
            [
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 },
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 },
                { type: "DogMonster", level: 1, health: 70, damage: 5, speed: 100 }
            ],
            [
                { type: "DogMonster", level: 2, health: 90, damage: 7, speed: 120 },
                { type: "WolfMonster", level: 2, health: 120, damage: 10, speed: 130 },
                { type: "WolfMonster", level: 2, health: 120, damage: 10, speed: 130 },
            ],
            [
                { type: "DragonMonster", level: 3, health: 220, damage: 20, speed: 100 },
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 140 },
                { type: "DragonMonster", level: 3, health: 220, damage: 20, speed: 100 },
            ],
            [
                { type: "DragonMonster", level: 4, health: 250, damage: 25, speed: 110 },
                { type: "DragonMonster", level: 4, health: 250, damage: 25, speed: 110 },
                { type: "DragonMonster", level: 4, health: 250, damage: 25, speed: 110 },
            ],
        ]
    }
]

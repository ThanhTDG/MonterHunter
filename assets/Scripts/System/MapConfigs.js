
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
                { type: "WolfMonster", level: 2, health: 120, damage: 10, speed: 130 }
            ],
            [
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 },
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 },
                { type: "WolfMonster", level: 3, health: 160, damage: 15, speed: 90 }
            ]
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
                { type: "WolfMonster", level: 4, health: 180, damage: 18, speed: 100 }
            ],
            [
                { type: "DogMonster", level: 3, health: 110, damage: 9, speed: 130 },
                { type: "WolfMonster", level: 4, health: 180, damage: 18, speed: 150 },
                { type: "DragonMonster", level: 4, health: 250, damage: 25, speed: 110 }
            ]
        ]
    },
    {
        id: 3,
        name: "Volcano",
        endTime: 15,
        waves: [
            [
                { type: "WolfMonster", level: 2, health: 140, damage: 12, speed: 130 },
                { type: "WolfMonster", level: 2, health: 140, damage: 12, speed: 130 },
                { type: "DragonMonster", level: 3, health: 250, damage: 22, speed: 110 },
                { type: "WolfMonster", level: 2, health: 140, damage: 12, speed: 130 },
                { type: "WolfMonster", level: 2, health: 140, damage: 12, speed: 130 },
                { type: "DragonMonster", level: 3, health: 250, damage: 22, speed: 110 }
            ],
            [
                { type: "DragonMonster", level: 3, health: 270, damage: 24, speed: 100 },
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 140 },
                { type: "DragonMonster", level: 3, health: 270, damage: 24, speed: 100 }
            ],
            [
                { type: "DragonMonster", level: 4, health: 300, damage: 28, speed: 115 },
                { type: "DragonMonster", level: 4, health: 300, damage: 28, speed: 115 },
                { type: "DragonMonster", level: 4, health: 300, damage: 28, speed: 115 },
                { type: "DragonMonster", level: 4, health: 300, damage: 28, speed: 115 },
                { type: "DragonMonster", level: 4, health: 300, damage: 28, speed: 115 }
            ]
        ]
    },
    {
        id: 4,
        name: "Glacier",
        endTime: 18,
        waves: [
            [
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 110 },
                { type: "DragonMonster", level: 4, health: 300, damage: 26, speed: 100 },
                { type: "RobotMonster", level: 4, health: 380, damage: 30, speed: 85 },
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 110 },
                { type: "DragonMonster", level: 4, health: 300, damage: 26, speed: 100 },
                { type: "RobotMonster", level: 4, health: 380, damage: 30, speed: 85 },
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 110 },
                { type: "RobotMonster", level: 4, health: 380, damage: 30, speed: 85 }
            ],
            [
                { type: "RobotMonster", level: 5, health: 450, damage: 35, speed: 80 },
                { type: "DragonMonster", level: 5, health: 330, damage: 28, speed: 110 },
                { type: "WolfMonster", level: 5, health: 200, damage: 18, speed: 120 },
                { type: "DragonMonster", level: 5, health: 330, damage: 28, speed: 110 },
            ]
        ]
    },
    {
        id: 5,
        name: "Desert Outpost",
        endTime: 17,
        waves: [
            [
                { type: "RobotMonster", level: 4, health: 400, damage: 32, speed: 90 },
                { type: "DogMonster", level: 3, health: 130, damage: 14, speed: 130 },
                { type: "WolfMonster", level: 4, health: 220, damage: 20, speed: 120 },
                { type: "DogMonster", level: 3, health: 130, damage: 14, speed: 130 },
                { type: "WolfMonster", level: 4, health: 220, damage: 20, speed: 120 }
            ],
            [
                { type: "RobotMonster", level: 5, health: 500, damage: 38, speed: 80 },
                { type: "DragonMonster", level: 5, health: 370, damage: 30, speed: 105 },
                { type: "WolfMonster", level: 5, health: 250, damage: 25, speed: 125 },
                { type: "DragonMonster", level: 5, health: 370, damage: 30, speed: 105 },
                { type: "WolfMonster", level: 5, health: 250, damage: 25, speed: 125 }
            ]
        ]
    },
    {
        id: 6,
        name: "Swamp of Dread",
        endTime: 20,
        waves: [
            [
                { type: "DogMonster", level: 3, health: 120, damage: 10, speed: 110 },
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 100 },
                { type: "WolfMonster", level: 3, health: 180, damage: 16, speed: 100 }
            ],
            [
                { type: "DragonMonster", level: 4, health: 320, damage: 28, speed: 95 },
                { type: "RobotMonster", level: 4, health: 400, damage: 30, speed: 80 },
                { type: "WolfMonster", level: 4, health: 220, damage: 18, speed: 110 }
            ],
            [
                { type: "RobotMonster", level: 5, health: 450, damage: 35, speed: 75 },
                { type: "DragonMonster", level: 5, health: 380, damage: 30, speed: 100 },
                { type: "WolfMonster", level: 5, health: 250, damage: 22, speed: 120 }
            ]
        ]
    },
    {
        id: 7,
        name: "Sky Fortress",
        endTime: 22,
        waves: [
            [
                { type: "DragonMonster", level: 4, health: 320, damage: 30, speed: 100 },
                { type: "WolfMonster", level: 4, health: 200, damage: 20, speed: 120 },
                { type: "DragonMonster", level: 4, health: 320, damage: 30, speed: 100 },
                { type: "WolfMonster", level: 4, health: 200, damage: 20, speed: 120 },
                { type: "WolfMonster", level: 4, health: 200, damage: 20, speed: 120 }
            ],
            [
                { type: "RobotMonster", level: 5, health: 450, damage: 35, speed: 85 },
                { type: "DragonMonster", level: 5, health: 400, damage: 38, speed: 95 },
                { type: "WolfMonster", level: 5, health: 250, damage: 25, speed: 130 },
                { type: "WolfMonster", level: 5, health: 250, damage: 25, speed: 130 }
            ],
            [
                { type: "RobotMonster", level: 6, health: 600, damage: 45, speed: 80 },
                { type: "RobotMonster", level: 6, health: 600, damage: 45, speed: 80 },
                { type: "DragonMonster", level: 6, health: 500, damage: 42, speed: 90 },
                { type: "WolfMonster", level: 6, health: 300, damage: 30, speed: 140 }
            ]
        ]
    }
];

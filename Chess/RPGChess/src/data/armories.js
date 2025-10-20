const armorys = { //this is what the player has in their inventory
    gold: 70,
    pieces: {
        General: 0,
        Armored_Pawn: 0,
        Trench_Pawn: 0,
        Pawn:0,
        Knight: 0,
        Duck: 0,
        Puffer: 0,
    },
    savedArmories: [] // Array of 2D board configurations
}

const descriptions = { //this is what the player sees when they hover over a piece
    General: "The commanding general - mandatory for all armies. High leadership and strategic value.",
    Armored_Pawn: "A heavily armored pawn with increased defense.",
    Trench_Pawn: "A pawn that can dig a trench in front of it to deter oncoming enemies.",
    Pawn: "A standard pawn that would love to promote.",
    Knight: "A knight with high mobility and attack power.",
    Duck: "A duck can be placed anywhere, can't be killed, and does absolutly nothing.",
    Puffer: "A pufferfish that charges like a rook, pops to scare enemies.",
}

const costs = { //this is what the player pays to buy a piece
    General: 25,
    Armored_Pawn: 10,
    Trench_Pawn: 10,
    Pawn: 5,
    Knight: 15,
    Duck: 15,
    Puffer: 15,
}

export { armorys, descriptions, costs };

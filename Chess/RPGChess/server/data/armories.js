const armoryData = [
  {
    name: "Armored Pawn",
    description: "A heavily armored pawn with increased defense.",
    cost: 100,
    type: "pawn",
    stats: {
      defense: 15,
      attack: 5,
      health: 20
    }
  },
  {
    name: "Trench Pawn",
    description: "A pawn that can dig a trench in front of it to deter oncoming enemies.",
    cost: 80,
    type: "pawn",
    stats: {
      defense: 10,
      attack: 8,
      health: 15,
      special: "trench_digging"
    }
  },
  {
    name: "Standard Pawn",
    description: "A standard pawn that would love to promote.",
    cost: 50,
    type: "pawn",
    stats: {
      defense: 5,
      attack: 5,
      health: 10
    }
  },
  {
    name: "Knight",
    description: "A knight with high mobility and attack power.",
    cost: 120,
    type: "knight",
    stats: {
      defense: 8,
      attack: 15,
      health: 18,
      mobility: "high"
    }
  },
  {
    name: "Duck",
    description: "A duck can be placed anywhere, can't be killed, and does absolutely nothing.",
    cost: 30,
    type: "special",
    stats: {
      defense: 999,
      attack: 0,
      health: 1,
      special: "immortal"
    }
  },
  {
    name: "Puffer",
    description: "A pufferfish that charges like a rook, pops to scare enemies.",
    cost: 60,
    type: "special",
    stats: {
      defense: 12,
      attack: 10,
      health: 12,
      special: "puff_attack"
    }
  }
];

export default armoryData;
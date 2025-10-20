const API_BASE = 'http://localhost:3002';

class UserService {
  constructor() {
    this.userId = 1; // Simple hardcoded user
    this.playerData = null;
  }

  // Get player data from server
  async getPlayerData() {
    const response = await fetch(`${API_BASE}/users/player-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    this.playerData = await response.json();
    return this.playerData;
  }

  // Update player data (gold and pieces)
  async updatePlayerData(gold, pieces) {
    const response = await fetch(`${API_BASE}/users/player-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: this.userId,
        gold,
        pieces
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Save armory
  async saveArmory(name, board, pieces, cost) {
    const response = await fetch(`${API_BASE}/users/armories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: this.userId,
        name,
        board,
        pieces,
        cost
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Update armory
  async updateArmory(armoryId, name, board, pieces, cost) {
    const response = await fetch(`${API_BASE}/users/armories/${armoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        board,
        pieces,
        cost
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Delete armory
  async deleteArmory(armoryId) {
    const response = await fetch(`${API_BASE}/users/armories/${armoryId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get user's saved armories
  async getUserArmories() {
    const response = await fetch(`${API_BASE}/users/${this.userId}/armories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new UserService();

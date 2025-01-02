class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize database if not exists
        if (!localStorage.getItem('dominoDB')) {
            const initialData = {
                Settings: {
                    DefaultGameMode: 2
                },
                GameMode: [
                    { 
                        id: 1, 
                        title: 'natural',
                        description: 'Traditional scoring method where points are counted naturally',
                        active: true
                    },
                    { 
                        id: 2, 
                        title: 'american',
                        description: 'American style scoring with special rules and combinations',
                        active: true
                    },
                    { 
                        id: 3, 
                        title: 'natural2',
                        description: 'Alternative natural scoring method with modified rules',
                        active: true
                    }
                ],
                Players: [],
                Scores: []
            };
            this.saveData(initialData);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem('dominoDB'));
    }

    saveData(data) {
        localStorage.setItem('dominoDB', JSON.stringify(data));
    }

    getCurrentTimestamp() {
        return new Date().toISOString();
    }

    // Settings Methods
    getSettings() {
        return this.getData().Settings;
    }

    updateSettings(updates) {
        const data = this.getData();
        data.Settings = { ...data.Settings, ...updates };
        this.saveData(data);
        return data.Settings;
    }

    // Game Mode Methods
    getGameModes() {
        return this.getData().GameMode.filter(mode => mode.active);
    }

    getAllGameModes() {
        return this.getData().GameMode;
    }

    getGameModeById(id) {
        return this.getData().GameMode.find(mode => mode.id === id);
    }

    updateGameMode(id, updates) {
        const data = this.getData();
        const modeIndex = data.GameMode.findIndex(mode => mode.id === id);
        if (modeIndex === -1) return null;

        data.GameMode[modeIndex] = {
            ...data.GameMode[modeIndex],
            ...updates
        };

        this.saveData(data);
        return data.GameMode[modeIndex];
    }

    // Player Methods
    addPlayer(gameModeId, name) {
        const data = this.getData();
        const timestamp = this.getCurrentTimestamp();
        const newPlayer = {
            id: data.Players.length ? Math.max(...data.Players.map(p => p.id)) + 1 : 1,
            Id_GameMode: gameModeId,
            name: name,
            totalScore: 0,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        data.Players.push(newPlayer);
        this.saveData(data);
        return newPlayer;
    }

    updatePlayer(playerId, updates) {
        const data = this.getData();
        const playerIndex = data.Players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return null;

        data.Players[playerIndex] = {
            ...data.Players[playerIndex],
            ...updates,
            updatedAt: this.getCurrentTimestamp()
        };

        this.saveData(data);
        return data.Players[playerIndex];
    }

    deletePlayer(playerId) {
        const data = this.getData();
        data.Players = data.Players.filter(p => p.id !== playerId);
        data.Scores = data.Scores.filter(s => s.Id_Players !== playerId);
        this.saveData(data);
    }

    getPlayersByGameMode(gameModeId) {
        return this.getData().Players.filter(p => p.Id_GameMode === gameModeId);
    }

    // Score Methods
    addScore(playerId, score) {
        const data = this.getData();
        const timestamp = this.getCurrentTimestamp();
        const newScore = {
            id: data.Scores.length ? Math.max(...data.Scores.map(s => s.id)) + 1 : 1,
            Id_Players: playerId,
            Score: score,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        data.Scores.push(newScore);

        // Update player's total score
        const playerIndex = data.Players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            data.Players[playerIndex].totalScore += score;
            data.Players[playerIndex].updatedAt = timestamp;
        }

        this.saveData(data);
        return newScore;
    }

    deleteScore(scoreId) {
        const data = this.getData();
        const score = data.Scores.find(s => s.id === scoreId);
        if (!score) return null;

        // Update player's total score
        const playerIndex = data.Players.findIndex(p => p.id === score.Id_Players);
        if (playerIndex !== -1) {
            data.Players[playerIndex].totalScore -= score.Score;
            data.Players[playerIndex].updatedAt = this.getCurrentTimestamp();
        }

        // Remove score
        data.Scores = data.Scores.filter(s => s.id !== scoreId);
        this.saveData(data);
        return score;
    }

    clearPlayerScores(playerId) {
        const data = this.getData();
        const player = data.Players.find(p => p.id === playerId);
        if (!player) return false;

        // Remove all scores for this player
        data.Scores = data.Scores.filter(s => s.Id_Players !== playerId);
        
        // Reset player's total score
        player.totalScore = 0;
        player.updatedAt = this.getCurrentTimestamp();
        
        this.saveData(data);
        return true;
    }

    getPlayerScores(playerId) {
        return this.getData().Scores.filter(s => s.Id_Players === playerId);
    }

    // Helper Methods
    calculatePlayerTotal(playerId) {
        const scores = this.getPlayerScores(playerId);
        return scores.reduce((total, score) => total + score.Score, 0);
    }

    getPlayerHistory(playerId) {
        const scores = this.getPlayerScores(playerId);
        return scores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

// Initialize database instance
const db = new Database();

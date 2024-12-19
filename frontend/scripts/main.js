let players = [];

// تهيئة اللعبة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', async () => {
    const savedState = await api.loadGameState();
    if (savedState) {
        players = savedState.players;
        renderPlayers();
        document.getElementById('playersSection').style.display = 'block';
        document.getElementById('scoreSection').style.display = 'block';
    }
});

function setupPlayers() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    players = [];
    
    for (let i = 0; i < playerCount; i++) {
        players.push({
            name: `لاعب ${i + 1}`,
            score: 0
        });
    }
    
    renderPlayers();
    document.getElementById('playersSection').style.display = 'block';
    document.getElementById('scoreSection').style.display = 'block';
    
    // حفظ حالة اللعبة
    api.saveGameState({ players });
}

function renderPlayers() {
    const scoreCards = document.getElementById('scoreCards');
    scoreCards.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerCard = utils.createElement('div', 'player-card');
        
        playerCard.innerHTML = `
            <div class="player-name">
                <input type="text" value="${player.name}" 
                       onchange="updatePlayerName(${index}, this.value)" 
                       placeholder="اسم اللاعب">
            </div>
            <div class="score-controls">
                <div class="score-display">النقاط: ${utils.formatNumber(player.score)}</div>
                <div class="action-buttons">
                    <button class="add-score" onclick="addScore(${index})">+1</button>
                    <button class="subtract-score" onclick="subtractScore(${index})">-1</button>
                    <button class="reset-score" onclick="resetScore(${index})">تصفير</button>
                </div>
            </div>
        `;
        
        scoreCards.appendChild(playerCard);
    });
}

function updatePlayerName(playerIndex, newName) {
    players[playerIndex].name = newName;
    api.saveGameState({ players });
}

function addScore(playerIndex) {
    players[playerIndex].score += 1;
    renderPlayers();
    api.saveGameState({ players });
}

function subtractScore(playerIndex) {
    players[playerIndex].score -= 1;
    renderPlayers();
    api.saveGameState({ players });
}

function resetScore(playerIndex) {
    players[playerIndex].score = 0;
    renderPlayers();
    api.saveGameState({ players });
}
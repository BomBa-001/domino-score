// Theme management
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Show main content after splash screen
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    
    setTimeout(() => {
        document.getElementById('app').style.display = 'flex';
    }, 3500);

    initializeGame();
});

// Initialize game
async function initializeGame() {
    const savedState = await api.loadGameState();
    if (savedState) {
        players = savedState.players;
        renderPlayers();
        document.getElementById('scoreSection').style.display = 'block';
    }
}

let players = [];

function setupPlayers() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    players = [];
    
    for (let i = 0; i < playerCount; i++) {
        players.push({
            name: `Player ${i + 1}`,
            score: 0
        });
    }
    
    renderPlayers();
    document.getElementById('scoreSection').style.display = 'block';
    
    // Save game state
    api.saveGameState({ players });
}

function renderPlayers() {
    const scoreCards = document.getElementById('scoreCards');
    scoreCards.innerHTML = '';
    
    players.forEach((player, index) => {
        const playerCard = utils.createElement('div', 'glass-card player-card');
        
        playerCard.innerHTML = `
            <div class="player-name">
                <input type="text" value="${player.name}" 
                       onchange="updatePlayerName(${index}, this.value)" 
                       placeholder="Player Name">
            </div>
            <div class="score-controls">
                <div class="score-display">Score: ${utils.formatNumber(player.score)}</div>
                <div class="action-buttons">
                    <button class="add-score" onclick="addScore(${index})">+1</button>
                    <button class="subtract-score" onclick="subtractScore(${index})">-1</button>
                    <button class="reset-score" onclick="resetScore(${index})">Reset</button>
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

// Configuration
const CONFIG = {
    SPLASH_SCREEN_DURATION: 35, // Duration in milliseconds
    TAB_SWITCH_DELAY: 500, // Delay for tab switching animation
};

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

// Tab Control
function initTabControl() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const loader = document.querySelector('.loader');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            if (!button.classList.contains('active')) {
                switchTab(targetTab);
            }
        });
    });
}

async function switchTab(targetTab) {
    const buttons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    const loader = document.querySelector('.loader');
    
    // Update buttons
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });
    
    // Show loader
    loader.classList.add('active');
    
    // Hide all panels
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, CONFIG.TAB_SWITCH_DELAY));
    
    // Hide loader and show target panel
    loader.classList.remove('active');
    const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
    targetPanel.classList.add('active');
}

// Splash Screen
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initTabControl();
    
    const splashScreen = document.getElementById('splash-screen');
    const app = document.getElementById('app');

    // Show app after delay
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        app.style.display = 'flex';
    }, CONFIG.SPLASH_SCREEN_DURATION);

    // Clean up splash screen after transition
    splashScreen.addEventListener('transitionend', () => {
        if (splashScreen.classList.contains('hidden')) {
            splashScreen.style.display = 'none';
        }
    });

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

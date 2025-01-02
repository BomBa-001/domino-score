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
    loadPlayersFromLocalStorage();
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

// Player Management
let playerCounter = 1;

let currentGameMode = db.getSettings().DefaultGameMode; // Initialize with default game mode from settings

function showAddPlayerDialog() {
    // Get active tab panel ID and extract game mode ID
    const activePanel = document.querySelector('.tab-panel.active');
    const panelId = activePanel.id;
    const gameModeId = parseInt(panelId.replace('tab-panel_', ''));
    
    Swal.fire({
        title: 'Add New Player',
        html: `
            <input id="playerName" 
                   class="swal2-input" 
                   placeholder="Player Name" 
                   value="Player ${db.getData().Players.length + 1}"
                   maxlength="10"
                   oninput="this.value = this.value.slice(0, 10)">
            <div class="name-counter">
                <small class="counter-text">Maximum 10 characters</small>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add Player',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const name = document.getElementById('playerName').value.trim();
            
            if (name.length === 0) {
                Swal.showValidationMessage('Player name cannot be empty');
                return false;
            }
            
            if (name.length > 10) {
                Swal.showValidationMessage('Player name cannot exceed 10 characters');
                return false;
            }
            
            return { name, gameModeId };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addPlayer(result.value.name, result.value.gameModeId);
        }
    });
}

function addPlayer(name, gameModeId) {
    const player = db.addPlayer(gameModeId, name);
    renderPlayers();
    showNotification(`${player.name} has been added successfully!`);
}

// Tab switching
function switchTab(tabId) {
    const gameModeId = tabId === 'natural' ? 1 : 2;
    currentGameMode = gameModeId;
    renderPlayers();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial game mode from settings
    currentGameMode = db.getSettings().DefaultGameMode;
    
    renderTabControl();
    
    // Add Player button handler
    document.getElementById('addPlayerBtn')?.addEventListener('click', showAddPlayerDialog);
});

function renderTabControl() {
    const tabControl = document.getElementById('tabControl');
    if (!tabControl) return;

    const gameModes = db.getGameModes(); // Only get active game modes
    
    // Render tab buttons
    const tabButtons = gameModes.map(mode => `
        <button class="tab-button ${mode.id === currentGameMode ? 'active' : ''}" 
                data-tab="${mode.title.toLowerCase()}"
                data-mode-id="${mode.id}">
            ${mode.title}
        </button>
    `).join('');
    
    // Render tab panels
    const tabPanels = gameModes.map(mode => `
        <div class="tab-panel ${mode.id === currentGameMode ? 'active' : ''}" 
             id="tab-panel_${mode.id}" 
             data-panel="${mode.title.toLowerCase()}">
            <div class="Components__Player glass-card">
                <div id="playersList_${mode.id}" class="players-list">
                    <!-- Players will be added here dynamically -->
                </div>
            </div>
        </div>
    `).join('');
    
    // Update DOM
    tabControl.innerHTML = `
        <div class="tab-buttons">
            ${tabButtons}
        </div>
        <div class="tab-content">
            ${tabPanels}
        </div>
    `;
    
    // Reattach event listeners
    attachTabEventListeners();
    renderPlayers();
}

function attachTabEventListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const modeId = parseInt(button.getAttribute('data-mode-id'));
            const tabId = button.getAttribute('data-tab');
            
            // Update active states
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            button.classList.add('active');
            document.querySelector(`#tab-panel_${modeId}`).classList.add('active');
            
            // Switch game mode
            currentGameMode = modeId;
            renderPlayers();
        });
    });
}

function renderPlayers() {
    const players = db.getPlayersByGameMode(currentGameMode);
    const playersList = document.getElementById(`playersList_${currentGameMode}`);
    
    if (!playersList) return;
    
    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="empty-state">
                <p>No players added yet.</p>
            </div>
        `;
        return;
    }
    
    playersList.innerHTML = players.map(player => {
        const scoreHistory = db.getPlayerHistory(player.id);
        const scoreItems = scoreHistory.map(score => `
            <div class="score-item ${score.Score > 0 ? 'positive' : 'negative'}">
                <div class="score-info">
                    <span class="score-time">${new Date(score.createdAt).toLocaleTimeString()}</span>
                    <span class="score-value">${score.Score > 0 ? '+' + score.Score : score.Score}</span>
                </div>
                <button onclick="deleteScore(${score.id}, ${player.id})" class="delete-score" title="Delete Score">
                    <span class="delete-icon">×</span>
                </button>
            </div>
        `).join('');

        return `
            <div class="player-card">
                <div class="player-header">
                    <div class="player-info">
                        <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
                        <div class="player-details">
                            <span class="player-name">${player.name}</span>
                        </div>
                    </div>
                    <div class="total-score">
                        <span class="score-label">Total</span>
                        <span class="player-score">${player.totalScore}</span>
                    </div>
                </div>
                
                <div class="player-content">
                    <div class="action-buttons">
                        <button onclick="adjustScore(${player.id}, 1)" class="action-button" title="Add Point">+</button>
                        <button onclick="adjustScore(${player.id}, -1)" class="action-button" title="Subtract Point">-</button>
                        <button onclick="editPlayer(${player.id})" class="action-button" title="Edit Player">✏️</button>
                        <button onclick="deletePlayer(${player.id})" class="action-button" title="Delete Player">🗑️</button>
                        <button onclick="clearPlayerScores(${player.id})" class="action-button clear-scores" title="Clear Scores">🧹</button>
                    </div>
                    
                    <div class="score-list">
                        ${scoreItems}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function adjustScore(playerId, amount) {
    const player = db.getData().Players.find(p => p.id === playerId);
    if (!player) return;
    
    db.addScore(playerId, amount);
    renderPlayers();
    
    const action = amount > 0 ? 'increased' : 'decreased';
    showNotification(`${player.name}'s score ${action} by ${Math.abs(amount)}`, 'info');
}

function editPlayer(playerId) {
    const player = db.getData().Players.find(p => p.id === playerId);
    if (!player) return;
    
    Swal.fire({
        title: 'Edit Player',
        html: `
            <input id="playerName" class="swal2-input" placeholder="Player Name" value="${player.name}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        preConfirm: () => {
            const name = document.getElementById('playerName').value;
            return { name };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const oldName = player.name;
            db.updatePlayer(playerId, { name: result.value.name });
            renderPlayers();
            showNotification(`${oldName} has been updated to ${result.value.name}!`, 'success');
        }
    });
}

function deletePlayer(playerId) {
    const player = db.getData().Players.find(p => p.id === playerId);
    if (!player) return;

    Swal.fire({
        title: 'Delete Player',
        text: `Are you sure you want to delete ${player.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            const playerName = player.name;
            db.deletePlayer(playerId);
            renderPlayers();
            showNotification(`${playerName} has been deleted!`, 'success');
        }
    });
}

function deleteScore(scoreId, playerId) {
    Swal.fire({
        title: 'Delete Score',
        text: 'Are you sure you want to delete this score?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            const score = db.deleteScore(scoreId);
            if (score) {
                renderPlayers();
                showNotification('Score has been deleted!', 'success');
            }
        }
    });
}

function clearPlayerScores(playerId) {
    const player = db.getData().Players.find(p => p.id === playerId);
    if (!player) return;

    Swal.fire({
        title: 'Clear All Scores',
        text: `Are you sure you want to clear all scores for ${player.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear all!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            if (db.clearPlayerScores(playerId)) {
                renderPlayers();
                showNotification(`All scores for ${player.name} have been cleared!`, 'success');
            }
        }
    });
}

// Notification helper function
function showNotification(title, icon = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'var(--card-bg)',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: icon,
        title: title,
        iconColor: 'var(--primary-color)'
    });
}

function savePlayersToLocalStorage() {
    localStorage.setItem('domino-players', JSON.stringify(players));
}

function loadPlayersFromLocalStorage() {
    const savedPlayers = localStorage.getItem('domino-players');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        playerCounter = Math.max(...players.map(p => parseInt(p.name.replace('Player ', '')) || 0)) + 1;
        renderPlayers();
    }
}

// 遊戲狀態
let board = [];
let currentPlayer = 1;
let gameOver = false;
const boardSize = 10;
const winLength = 5;
let gameMode = 'local';

// 初始化遊戲
function initGame() {
    createBoard();
    updateStatus();
    setupEventListeners();
}

// 創建棋盤
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    for (let i = 0; i < boardSize; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', () => makeMove(i, j));
            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
}

// 設定事件監聽器
function setupEventListeners() {
    // 模式選擇
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameMode = e.target.dataset.mode;
            document.getElementById('onlineSection').style.display = 
                gameMode === 'online' ? 'block' : 'none';
            resetGame();
        });
    });
}

// 下棋
function makeMove(row, col) {
    if (gameOver || board[row][col] !== 0) return;
    
    board[row][col] = currentPlayer;
    updateBoard();
    
    if (isBoardFull()) {
        document.getElementById('status').textContent = '🎯 棋盤已滿！點擊計算分數';
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateStatus();
    }
    
    // 如果是線上模式，同步狀態
    if (gameMode === 'online') {
        syncGameState();
    }
}

// 更新棋盤顯示
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = board[row][col];
        
        cell.textContent = '';
        cell.classList.remove('player1', 'player2');
        
        if (value === 1) {
            cell.textContent = '○';
            cell.classList.add('player1');
        } else if (value === 2) {
            cell.textContent = '✕';
            cell.classList.add('player2');
        }
    });
}

// 更新狀態顯示
function updateStatus() {
    const statusElement = document.getElementById('status');
    if (currentPlayer === 1) {
        statusElement.innerHTML = '<span class="player1">玩家1</span>的回合 (○)';
    } else {
        statusElement.innerHTML = '<span class="player2">玩家2</span>的回合 (✕)';
    }
}

// 切換玩家
function switchPlayer() {
    if (gameOver) return;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStatus();
}

// 檢查棋盤是否已滿
function isBoardFull() {
    return board.flat().every(cell => cell !== 0);
}

// 計算分數
function calculateScores() {
    let score1 = 0, score2 = 0;
    
    // 檢查所有可能連線方向
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 右下對角
        [1, -1]   // 左下對角
    ];
    
    for (let dir of directions) {
        const [dx, dy] = dir;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (i + dx * (winLength - 1) < boardSize && 
                    j + dy * (winLength - 1) >= 0 && 
                    j + dy * (winLength - 1) < boardSize) {
                    
                    let line = [];
                    for (let k = 0; k < winLength; k++) {
                        line.push(board[i + dx * k][j + dy * k]);
                    }
                    
                    if (line.every(cell => cell === 1)) score1++;
                    if (line.every(cell => cell === 2)) score2++;
                }
            }
        }
    }
    
    // 更新分數顯示
    document.getElementById('score1').textContent = score1;
    document.getElementById('score2').textContent = score2;
    
    // 顯示結果
    showResult(score1, score2);
    gameOver = true;
}

// 顯示遊戲結果
function showResult(score1, score2) {
    const resultElement = document.getElementById('result');
    let resultHTML = '';
    
    if (score1 > score2) {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 玩家1 獲勝！</div>
            <div class="player1" style="font-size: 1.2em;">○: ${score1} 條連線</div>
            <div class="player2">✕: ${score2} 條連線</div>
        `;
    } else if (score2 > score1) {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 玩家2 獲勝！</div>
            <div class="player1">○: ${score1} 條連線</div>
            <div class="player2" style="font-size: 1.2em;">✕: ${score2} 條連線</div>
        `;
    } else {
        resultHTML = `
            <div style="font-size: 1.5em; margin-bottom: 10px;">🤝 平手！</div>
            <div class="player1">○: ${score1} 條連線</div>
            <div class="player2">✕: ${score2} 條連線</div>
        `;
    }
    
    resultElement.innerHTML = resultHTML;
    resultElement.style.display = 'block';
}

// 重置遊戲
function resetGame() {
    currentPlayer = 1;
    gameOver = false;
    document.getElementById('result').style.display = 'none';
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
    createBoard();
    updateStatus();
}

// 分享遊戲
function shareGame() {
    const gameState = {
        board: board,
        currentPlayer: currentPlayer,
        gameOver: gameOver,
        mode: gameMode
    };
    
    const encodedState = btoa(JSON.stringify(gameState));
    const shareUrl = `${window.location.origin}${window.location.pathname}?game=${encodedState}`;
    
    document.getElementById('shareUrl').value = shareUrl;
    document.getElementById('shareModal').style.display = 'flex';
    
    // 生成 QR Code
    generateQRCode(shareUrl);
}

// 複製分享連結
function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    navigator.clipboard.writeText(shareUrl.value)
        .then(() => alert('連結已複製到剪貼簿！'))
        .catch(() => {
            // 降級方案
            document.execCommand('copy');
            alert('連結已複製！');
        });
}

// 關閉模態框
function closeModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// 生成 QR Code
function generateQRCode(url) {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    // 簡單的 QR Code 生成（實際使用時可以集成專業庫）
    const qrText = document.createElement('div');
    qrText.style.padding = '20px';
    qrText.style.background = 'white';
    qrText.style.border = '2px solid #3498db';
    qrText.style.borderRadius = '8px';
    qrText.innerHTML = `
        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">掃描 QR Code 或複製連結</div>
        <div style="font-size: 10px; word-break: break-all; color: #333;">${url}</div>
    `;
    qrContainer.appendChild(qrText);
}

// 線上模式功能
function createRoom() {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('roomId').value = roomId;
    document.getElementById('roomStatus').textContent = `房間已創建: ${roomId}`;
    document.getElementById('playerCount').textContent = '玩家: 1/2';
    
    // 模擬 WebSocket 連接
    simulateOnlineConnection(roomId, true);
}

function joinRoom() {
    const roomId = document.getElementById('roomId').value.trim().toUpperCase();
    if (!roomId) {
        alert('請輸入房間ID');
        return;
    }
    
    document.getElementById('roomStatus').textContent = `已加入房間: ${roomId}`;
    document.getElementById('playerCount').textContent = '玩家: 2/2';
    
    // 模擬 WebSocket 連接
    simulateOnlineConnection(roomId, false);
}

function simulateOnlineConnection(roomId, isHost) {
    console.log(`模擬連接到房間: ${roomId}, 身份: ${isHost ? '房主' : '玩家'}`);
    // 實際項目中這裡會是 WebSocket 連接
}

function syncGameState() {
    // 線上模式同步遊戲狀態
    console.log('同步遊戲狀態到伺服器');
}

// 載入 URL 中的遊戲狀態
function loadGameStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameState = urlParams.get('game');
    
    if (gameState) {
        try {
            const state = JSON.parse(atob(gameState));
            board = state.board;
            currentPlayer = state.currentPlayer;
            gameOver = state.gameOver;
            gameMode = state.mode || 'local';
            
            // 更新 UI
            document.querySelector(`[data-mode="${gameMode}"]`).click();
            updateBoard();
            updateStatus();
            
            if (gameOver) {
                calculateScores();
            }
        } catch (e) {
            console.error('載入遊戲狀態失敗:', e);
        }
    }
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadGameStateFromURL();
});

// 防止拖動圖像
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
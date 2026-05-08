// 扫雷游戏 - 复古未来主义版本
// 核心游戏逻辑引擎

// ==================== 常量定义 ====================
const CELL_STATE = {
    UNREVEALED: 0,
    REVEALED: 1,
    FLAGGED: 2
};

const GAME_STATE = {
    READY: 'ready',
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost'
};

const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

// 数字颜色配置
const NUMBER_COLORS = {
    1: '#00ff88',
    2: '#00b4d8',
    3: '#ff6b6b',
    4: '#9b5de5',
    5: '#f72585',
    6: '#4cc9f0',
    7: '#ffffff',
    8: '#6c757d'
};

// ==================== 游戏类定义 ====================
class MinesweeperGame {
    constructor() {
        this.grid = [];
        this.rows = 0;
        this.cols = 0;
        this.mines = 0;
        this.totalCells = 0;
        this.revealedCount = 0;
        this.flagCount = 0;
        this.gameState = GAME_STATE.READY;
        this.startTime = null;
        this.timerInterval = null;
        this.currentDifficulty = 'beginner';

        this.boardElement = document.getElementById('gameBoard');
        this.mineCountElement = document.getElementById('mineCount');
        this.timerElement = document.getElementById('timerDisplay');
        this.resetBtn = document.getElementById('resetBtn');
        this.faceIcon = document.getElementById('faceIcon');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.finalTimeElement = document.getElementById('finalTime');
        this.victoryOverlay = document.getElementById('victoryOverlay');
        this.gameOverOverlay = document.getElementById('gameOverOverlay');

        this.init();
    }

    // ==================== 初始化 ====================
    init() {
        this.initGame();
        this.bindEvents();
    }

    initGame() {
        const config = DIFFICULTIES[this.currentDifficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mines = config.mines;
        this.totalCells = this.rows * this.cols;
        this.revealedCount = 0;
        this.flagCount = 0;
        this.gameState = GAME_STATE.READY;
        this.startTime = null;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.grid = [];
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    isMine: false,
                    adjacentMines: 0,
                    state: CELL_STATE.UNREVEALED
                };
            }
        }

        this.updateMineCounter();
        this.updateTimer(0);
        this.updateFace('😊');
        this.updateGameStatus('就绪');
        this.updateFinalTime('--');
        this.hideOverlays();
        this.renderBoard();
    }

    // ==================== 地雷生成 ====================
    generateMines(firstClickX, firstClickY) {
        const excludedCells = new Set();
        excludedCells.add(`${firstClickX},${firstClickY}`);

        const neighbors = this.getNeighbors(firstClickX, firstClickY);
        neighbors.forEach(cell => {
            excludedCells.add(`${cell.x},${cell.y}`);
        });

        const availableCells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (!excludedCells.has(`${x},${y}`)) {
                    availableCells.push({ x, y });
                }
            }
        }

        // Fisher-Yates 洗牌算法
        for (let i = availableCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCells[i], availableCells[j]] = [availableCells[j], availableCells[i]];
        }

        const minesToPlace = Math.min(this.mines, availableCells.length);
        for (let i = 0; i < minesToPlace; i++) {
            const { x, y } = availableCells[i];
            this.grid[y][x].isMine = true;
        }

        // 计算所有格子的相邻地雷数
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (!this.grid[y][x].isMine) {
                    this.grid[y][x].adjacentMines = this.countAdjacentMines(x, y);
                }
            }
        }
    }

    // ==================== 邻居格子 ====================
    getNeighbors(x, y) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                    neighbors.push(this.grid[ny][nx]);
                }
            }
        }
        return neighbors;
    }

    countAdjacentMines(x, y) {
        return this.getNeighbors(x, y).filter(cell => cell.isMine).length;
    }

    // ==================== 揭示格子 ====================
    revealCell(x, y, isChainCall = false) {
        const cell = this.grid[y][x];

        if (cell.state !== CELL_STATE.UNREVEALED) {
            return;
        }

        cell.state = CELL_STATE.REVEALED;
        this.revealedCount++;

        const cellElement = this.getCellElement(x, y);
        if (cellElement) {
            cellElement.classList.add('revealed');
            cellElement.classList.remove('flagged');
            cellElement.classList.add('reveal-animation');

            if (cell.isMine) {
                cellElement.classList.add('mine');
                cellElement.innerHTML = '💣';
            } else if (cell.adjacentMines > 0) {
                cellElement.innerHTML = `<span style="color: ${NUMBER_COLORS[cell.adjacentMines]}">${cell.adjacentMines}</span>`;
            } else {
                cellElement.innerHTML = '';
            }
        }

        if (cell.isMine) {
            this.handleGameOver();
            return;
        }

        if (cell.adjacentMines === 0) {
            setTimeout(() => {
                const neighbors = this.getNeighbors(x, y);
                neighbors.forEach(neighbor => {
                    if (neighbor.state === CELL_STATE.UNREVEALED) {
                        this.revealCell(neighbor.x, neighbor.y, true);
                    }
                });
            }, 30);
        }

        this.checkWinCondition();
    }

    // ==================== 标记格子 ====================
    toggleFlag(x, y) {
        if (this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST) {
            return;
        }

        const cell = this.grid[y][x];

        if (cell.state === CELL_STATE.REVEALED) {
            return;
        }

        if (cell.state === CELL_STATE.FLAGGED) {
            cell.state = CELL_STATE.UNREVEALED;
            this.flagCount--;
        } else {
            cell.state = CELL_STATE.FLAGGED;
            this.flagCount++;
        }

        this.updateMineCounter();
        this.renderCell(x, y);
    }

    // ==================== 游戏状态 ====================
    startGame() {
        if (this.gameState === GAME_STATE.PLAYING) {
            return;
        }

        this.gameState = GAME_STATE.PLAYING;
        this.startTime = Date.now();
        this.updateGameStatus('进行中');

        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimer(elapsed);
        }, 1000);
    }

    checkWinCondition() {
        const nonMineCells = this.totalCells - this.mines;

        if (this.revealedCount === nonMineCells) {
            this.handleVictory();
        }
    }

    handleVictory() {
        this.gameState = GAME_STATE.WON;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateFace('😎');
        this.updateGameStatus('胜利！');
        this.updateFinalTime(elapsed);

        document.getElementById('victoryTime').textContent = elapsed;
        this.victoryOverlay.classList.add('active');
        this.victoryOverlay.style.display = 'flex';

        // 标记所有地雷
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x].isMine) {
                    const cellElement = this.getCellElement(x, y);
                    if (cellElement && cellElement.classList.contains('unrevealed')) {
                        cellElement.classList.add('victory-flag');
                        cellElement.innerHTML = '🚩';
                    }
                }
            }
        }
    }

    handleGameOver() {
        this.gameState = GAME_STATE.LOST;

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateFace('😵');
        this.updateGameStatus('失败');
        this.updateFinalTime(elapsed);

        this.boardElement.classList.add('shake-animation');

        setTimeout(() => {
            this.boardElement.classList.remove('shake-animation');
        }, 500);

        // 显示所有地雷
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.grid[y][x];
                if (cell.isMine) {
                    const cellElement = this.getCellElement(x, y);
                    if (cellElement && cellElement.classList.contains('unrevealed')) {
                        cellElement.classList.add('revealed', 'mine-reveal');
                        cellElement.innerHTML = '💣';
                    }
                }
            }
        }

        setTimeout(() => {
            this.gameOverOverlay.classList.add('active');
            this.gameOverOverlay.style.display = 'flex';
        }, 600);
    }

    // ==================== 重置游戏 ====================
    resetGame() {
        this.hideOverlays();
        this.initGame();
    }

    changeDifficulty(difficulty) {
        if (DIFFICULTIES[difficulty]) {
            this.currentDifficulty = difficulty;
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
            this.resetGame();
        }
    }

    // ==================== UI 更新 ====================
    updateMineCounter() {
        const remaining = this.mines - this.flagCount;
        this.mineCountElement.textContent = String(Math.max(0, remaining)).padStart(3, '0');
    }

    updateTimer(seconds) {
        this.timerElement.textContent = String(Math.min(999, seconds)).padStart(3, '0');
    }

    updateFace(emoji) {
        this.faceIcon.textContent = emoji;
    }

    updateGameStatus(status) {
        this.gameStatusElement.textContent = status;
    }

    updateFinalTime(time) {
        this.finalTimeElement.textContent = time;
    }

    hideOverlays() {
        this.victoryOverlay.classList.remove('active');
        this.gameOverOverlay.classList.remove('active');
        this.victoryOverlay.style.display = 'none';
        this.gameOverOverlay.style.display = 'none';
    }

    // ==================== 渲染 ====================
    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 32px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.rows}, 32px)`;

        const fragment = document.createDocumentFragment();

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell unrevealed';
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;
                cellElement.setAttribute('role', 'gridcell');
                cellElement.setAttribute('tabindex', '0');
                fragment.appendChild(cellElement);
            }
        }

        this.boardElement.appendChild(fragment);
    }

    renderCell(x, y) {
        const cell = this.grid[y][x];
        const cellElement = this.getCellElement(x, y);

        if (!cellElement) return;

        cellElement.className = 'cell';
        cellElement.innerHTML = '';

        if (cell.state === CELL_STATE.UNREVEALED) {
            cellElement.classList.add('unrevealed');
        } else if (cell.state === CELL_STATE.REVEALED) {
            cellElement.classList.add('revealed');
            if (cell.isMine) {
                cellElement.classList.add('mine');
                cellElement.innerHTML = '💣';
            } else if (cell.adjacentMines > 0) {
                cellElement.innerHTML = `<span style="color: ${NUMBER_COLORS[cell.adjacentMines]}">${cell.adjacentMines}</span>`;
            }
        } else if (cell.state === CELL_STATE.FLAGGED) {
            cellElement.classList.add('unrevealed', 'flagged');
            cellElement.innerHTML = '🚩';
        }
    }

    getCellElement(x, y) {
        const index = y * this.cols + x;
        return this.boardElement.children[index];
    }

    // ==================== 事件绑定 ====================
    bindEvents() {
        // 网格点击事件
        this.boardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;

            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);

            this.handleCellClick(x, y);
        });

        // 右键点击事件
        this.boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.cell');
            if (!cell) return;

            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);

            this.handleCellRightClick(x, y);
        });

        // 重置按钮
        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });

        // 表情按钮按下效果
        this.boardElement.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('unrevealed') && 
                this.gameState !== GAME_STATE.WON && 
                this.gameState !== GAME_STATE.LOST) {
                this.updateFace('😮');
            }
        });

        this.boardElement.addEventListener('mouseup', () => {
            if (this.gameState === GAME_STATE.PLAYING) {
                this.updateFace('😊');
            }
        });

        this.boardElement.addEventListener('mouseleave', () => {
            if (this.gameState === GAME_STATE.PLAYING) {
                this.updateFace('😊');
            }
        });

        // 难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.changeDifficulty(difficulty);
            });
        });

        // 键盘支持
        this.boardElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const cell = e.target.closest('.cell');
                if (cell) {
                    e.preventDefault();
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    this.handleCellClick(x, y);
                }
            } else if (e.key.toLowerCase() === 'f') {
                const cell = e.target.closest('.cell');
                if (cell) {
                    e.preventDefault();
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    this.handleCellRightClick(x, y);
                }
            }
        });

        // 长按支持（移动端）
        let longPressTimer = null;
        let longPressTriggered = false;

        this.boardElement.addEventListener('touchstart', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;

            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                this.handleCellRightClick(x, y);
                cell.classList.add('long-press');
            }, 500);
        });

        this.boardElement.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }

            const cell = e.target.closest('.cell');
            if (cell) {
                cell.classList.remove('long-press');

                if (!longPressTriggered) {
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    this.handleCellClick(x, y);
                }
            }
        });

        this.boardElement.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
    }

    // ==================== 事件处理 ====================
    handleCellClick(x, y) {
        if (this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST) {
            return;
        }

        const cell = this.grid[y][x];

        if (cell.state === CELL_STATE.REVEALED) {
            return;
        }

        if (cell.state === CELL_STATE.FLAGGED) {
            return;
        }

        if (this.gameState === GAME_STATE.READY) {
            this.generateMines(x, y);
            this.startGame();
        }

        this.revealCell(x, y);
    }

    handleCellRightClick(x, y) {
        if (this.gameState === GAME_STATE.WON || this.gameState === GAME_STATE.LOST) {
            return;
        }

        this.toggleFlag(x, y);
    }
}

// ==================== 游戏实例化 ====================
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MinesweeperGame();
});

// 暴露到全局，供 HTML 中的按钮调用
window.game = game;

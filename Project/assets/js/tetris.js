let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let changeScore = document.getElementById('score');
let music = document.getElementById('music');

const rowBoard = 20;
const colBoard = 10;
const SQ = 40;
const COLOR = "#000000";
let score = 0;
let gameOver = false;


// Vẽ hình vuông
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Vẽ board
let board = [];
for (i = 0; i < rowBoard; i++) {
    board[i] = [];
    for (j = 0; j < colBoard; j++) {
        board[i][j] = COLOR;
    }
}

function drawBoard() {
    for (i = 0; i < rowBoard; i++) {
        for (j = 0; j < colBoard; j++) {
            drawSquare(j, i, board[i][j]);
        }
    }
}
drawBoard();

// Các hình và màu
const SHAPES = [
    [I, "#A60321"],
    [O, "#04BFAD"],
    [T, "#0DFF72"],
    [L, "#F538FF"],
    [J, "#FF8E0D"],
    [S, "#FFE138"],
    [Z, "#3877FF"]
];
console.log(SHAPES);

// Tạo class của hình
class Shape {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        this.firstRotation = 0; // Góc quay mặc định
        this.rotateTetromino = this.tetromino[this.firstRotation];
        // Tọa độ mặc định trước khi rơi
        this.x = 3;
        this.y = -2;
    }
    fillShape(color) {
        for (i = 0; i < this.rotateTetromino.length; i++) {
            for (j = 0; j < this.rotateTetromino.length; j++) {
                if (this.rotateTetromino[i][j]) {
                    drawSquare(this.x + j, this.y + i, color);
                }
            }
        }
    }
    drawShape() {
        this.fillShape(this.color);
    }
    clearShape() {
        this.fillShape(COLOR);
    }
    moveDown() {
        if (!this.collision(0, 1, this.rotateTetromino)) {
            this.clearShape();
            this.y++;
            this.drawShape();
        } else {
            this.lockShape();
            shape = randomShape();
        }
    }
    moveLeft() {
        if (!this.collision(-1, 0, this.rotateTetromino)) {
            this.clearShape();
            this.x--;
            this.drawShape();
        }
    }
    moveRight() {
        if (!this.collision(1, 0, this.rotateTetromino)) {
            this.clearShape();
            this.x++;
            this.drawShape();
        }
    }
    rotate() {
        let nextRotation = this.tetromino[(this.firstRotation + 1) % this.tetromino.length];
        let kickWall = 0;
        // Xử lí khi xoay hình sát 2 cạnh canvas
        if (this.collision(0, 0, nextRotation)) {
            if (this.x > colBoard / 2) {
                kickWall = -1; // Cạnh phải
            } else {
                kickWall = 1; // Cạnh trái
            }
        }
        if (!this.collision(kickWall, 0, nextRotation)) {
            this.clearShape();
            this.x += kickWall;
            this.firstRotation = (this.firstRotation + 1) % this.tetromino.length;
            this.rotateTetromino = this.tetromino[this.firstRotation];
            this.drawShape();
        }
    }
    collision(x, y, shape) {
        for (i = 0; i < shape.length; i++) {
            for (j = 0; j < shape.length; j++) {
                if (!shape[i][j]) { // Bỏ qua nếu hình rỗng
                    continue;
                }
                // Tọa độ sau khi di chuyển
                let newX = this.x + j + x;
                let newY = this.y + i + y;
                if (newX < 0 || newX >= colBoard || newY >= rowBoard) {
                    return true;
                }
                if (newY < 0) {
                    continue;
                }
                if (board[newY][newX] != COLOR) { // Kiểm tra đã có hình tại vị trí đó chưa
                    return true;
                }
            }
        }
        return false;
    }
    lockShape() {
        for (i = 0; i < this.rotateTetromino.length; i++) {
            for (j = 0; j < this.rotateTetromino.length; j++) {
                if (!this.rotateTetromino[i][j]) { // Bỏ qua nếu hình rỗng
                    continue;
                }
                // Khóa hình chạm cạnh trên
                if (this.y + i < 0) {
                    music.pause();
                    gameOver = true; // Dừng requestAnimationFrame
                    canvas.innerHTML = '<audio autoplay src="media/audio/Mario.mp3"></audio>';
                    alert("Game Over! You got " + score + " points.");
                    break;
                }
                board[this.y + i][this.x + j] = this.color;
            }
        }
        // Xóa dòng khi đã lấp đầy
        for (i = 0; i < rowBoard; i++) {
            let isRowFull = true;
            for (j = 0; j < colBoard; j++) {
                isRowFull = isRowFull && (board[i][j] != COLOR);
            }
            if (isRowFull) {
                for (let y = i; y > 1; y--) {
                    for (j = 0; j < colBoard; j++) {
                        board[y][j] = board[y - 1][j]; //Nếu dòng đầy thì hạ các dòng trên xuống
                    }
                }
                for (j = 0; j < colBoard; j++) {
                    board[0][j] = COLOR;
                }
                canvas.innerHTML = '<audio autoplay src="media/audio/clear.wav"></audio>';
                // Tăng điểm
                score += 10;
            }
        }
        // Update board và score
        drawBoard();
        changeScore.innerHTML = score;
    }
}

// Tạo random hình
function randomShape() {
    let rd = Math.floor(Math.random() * SHAPES.length);
    return new Shape(SHAPES[rd][0], SHAPES[rd][1]);
}
let shape = randomShape();
console.log(shape);

// Di chuyển
function playMovingMusic() {
    canvas.innerHTML = '<audio autoplay src="media/audio/move.wav">';
}
document.addEventListener("keydown", control);

function control(e) { // Có thể dùng phím arrow hoặc ASDW 
    if (e.keyCode == 37 || e.keyCode == 65) {
        shape.moveLeft();
        playMovingMusic();
        dropStart = Date.now();
    } else if (e.keyCode == 38 || e.keyCode == 87) {
        shape.rotate();
        playMovingMusic();
        dropStart = Date.now();
    } else if (e.keyCode == 39 || e.keyCode == 68) {
        shape.moveRight();
        playMovingMusic();
        dropStart = Date.now();
    } else if (e.keyCode == 40 || e.keyCode == 83) {
        shape.moveDown();
        // playMovingMusic();
    }
}

// Làm hình rơi từ trên xuống
let dropStart = Date.now();

function dropShape() {
    let now = Date.now();
    let minus = now - dropStart;
    if (minus > 1000) {
        music.play();
        shape.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(dropShape);
    }
}
dropShape();
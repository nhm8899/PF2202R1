const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let changeScore = document.getElementById('score');

const rowBoard = 20;
const colBoard = 10;
const SQ = 40;
const COLOR = "#AAAAAA";

// Vẽ 1 hình vuông
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
    ctx.strokeStyle = "#000000";
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

let score = 0;

// Các hình và màu
const SHAPES = [
    [I, "#00FF00"],
    [O, "#FFFF00"],
    [T, "#361616"],
    [L, "#DF0101"],
    [J, "#0000FF"],
    [S, "#EE7600"],
    [Z, "#FE2E9A"]
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
                    alert("Game Over! Bạn được "+ score + " điểm");
                    gameOver = true; // Dừng requestAnimationFrame
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
document.addEventListener("keydown", control);

function control(e) { // Có thể dùng phím arrow hoặc ASDW 
    if (e.keyCode == 37 || e.keyCode == 65) {
        shape.moveLeft();
        dropStart = Date.now();
    } else if (e.keyCode == 38 || e.keyCode == 87) {
        shape.rotate();
        dropStart = Date.now();
    } else if (e.keyCode == 39 || e.keyCode == 68) {
        shape.moveRight();
        dropStart = Date.now();
    } else if (e.keyCode == 40 || e.keyCode == 83) {
        shape.moveDown();
    }
}

// Làm hình rơi từ trên xuống
let dropStart = Date.now();
let gameOver = false;

function dropShape() {
    let now = Date.now();
    let minus = now - dropStart;
    if (minus > 1000) {
        shape.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(dropShape);
    }
}
dropShape();
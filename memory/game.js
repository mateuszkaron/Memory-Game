function startGame() {
    score = 0;
    moves = 0;
    updateScoreAndMoves();
    const board = countGrid();
    renderBoard(board); 
}

function countGrid() {
let grid = document.getElementById('board-size').value;
let [row, col] = grid.split('x').map(Number);
let gridSize = row * col;

// Generuj losowe pary obrazków
let images = generatePairs(gridSize);

// Twórz planszę na podstawie losowych par
return createBoard(row, col, images);
}

function generatePairs(number) {
const animals = [
    "lion", "elephant", "tiger", "dog", "cat", "bear", "giraffe", "zebra",
    "wolf", "fox", "rabbit", "deer", "horse", "panda", "koala", "leopard",
    "kangaroo", "hippopotamus"
];

shuffle(animals);

// Tworzenie par obrazków
let pairs = [];
for (let i = 0; i < number / 2; i++) {
    pairs.push(animals[i % animals.length]); // Dodaj pierwszą kopię
    pairs.push(animals[i % animals.length]); // Dodaj drugą kopię
}

return shuffle(pairs); // Tasowanie par
}

function shuffle(array) {
for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; 
}
return array;
}

function createBoard(rows, cols, shuffledPairs) {
// Tworzenie planszy w postaci tablicy dwuwymiarowej
let board = [];
let index = 0;

for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
        row.push(shuffledPairs[index]);
        index++;
    }
    board.push(row);
}

return board;
}

function renderBoard(board) {
const table = document.createElement("table");
table.className = "gameboard";

for (let i = 0; i < board.length; i++) {
    const row = document.createElement("tr"); 

    for (let j = 0; j < board[i].length; j++) {
        const cell = document.createElement("td"); 
        cell.className = "tile";
        cell.dataset.animal = board[i][j]; 
        cell.textContent = "";

        const img = document.createElement("img");
        img.src = `images/${board[i][j]}.jpg`;
        img.alt = board[i][j];
        cell.appendChild(img);

        row.appendChild(cell);
        cell.addEventListener('click', flipCard);
    }

    table.appendChild(row);
}

const container = document.getElementById("game-container");
container.innerHTML = "";
container.appendChild(table); 
}

let flippedCards = []; 
let matchedCards = [];
let isGameBlocked = false;

function flipCard(event) {

    if (isGameBlocked || event.target.classList.contains('flipped') || matchedCards.includes(event.target)) {
        return;
    }

    const clickedCard = event.target; 
    if (flippedCards.length === 2 || clickedCard.classList.contains('flipped') || matchedCards.includes(clickedCard)) {
        return; 
    }


    clickedCard.classList.add('flipped');
    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        isGameBlocked = true;
        checkMatch();
        
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    moves++;
    updateScoreAndMoves();
    if (card1.dataset.animal === card2.dataset.animal) {
        // Jeśli pasują
        score += 10;
        updateScoreAndMoves();
        setTimeout(() => {
            matchedCards.push(card1, card2);
            isGameBlocked = false;
        }, 1000);
    } else {
        // Jeśli nie pasują
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            isGameBlocked = false;
        }, 1000);
    }

    flippedCards = [];
}

document.querySelectorAll('.tile').forEach(card => {
    card.addEventListener('click', flipCard);
});

let score = 0;
let moves = 0;

function updateScoreAndMoves() {
    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
}

function checkEndGame() {
    const grid = document.getElementById('board-size').value;
    const [rows, cols] = grid.split('x').map(Number);
    const totalPairs = (rows * cols) / 2;

    if (matchedCards.length / 2 === totalPairs) {
        endGame();
    }
}

function endGame() {
    const container = document.getElementById('game-container');
    const endDiv = document.createElement('div');
    endDiv.id = 'end-game';
    endDiv.className = 'end-game';
    endDiv.innerHTML = `
        <h2>Gratulacje! Wygrałeś!</h2>
        <p>Twoje punkty: ${score}</p>
        <p>Liczba ruchów: ${moves}</p>
        <label for="username">Wpisz swoją nazwę (max 10 znaków):</label>
        <input type="text" id="username" maxlength="10">
        <button id="save-score">Zapisz wynik</button>
    `;
    container.innerHTML = '';
    container.appendChild(endDiv);

    document.getElementById('save-score').addEventListener('click', saveScore);
}

function saveScore() {
    const username = document.getElementById('username').value.trim();
    if (username === '') {
        alert('Podaj swoją nazwę!');
        return;
    }

    const grid = document.getElementById('board-size').value;

    fetch('http://localhost/memory/save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            score,
            moves,
            boardSize: grid,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                startGame();
            } else if (data.error) {
                alert(`Błąd: ${data.error}`);
            }
        })
        .catch(error => console.error('Error:', error));
}



// ------------------CHEAT----------------------

function cheatGame() {
    const tiles = document.querySelectorAll('.tile');
    const pairs = {};

    // Grupowanie kafelków według zwierząt
    tiles.forEach(tile => {
        const animal = tile.dataset.animal;
        if (!pairs[animal]) {
            pairs[animal] = [];
        }
        pairs[animal].push(tile);
    });

    // Dopasowanie wszystkich par
    for (const animal in pairs) {
        if (pairs[animal].length === 2) {
            const [card1, card2] = pairs[animal];
            card1.classList.add('flipped');
            card2.classList.add('flipped');
            matchedCards.push(card1, card2);
        }
    }

    // Zakończenie gry
    setTimeout(() => {
        checkGameOver();
    }, 500);
}

function checkGameOver() {
    if (matchedCards.length === document.querySelectorAll('.tile').length) {
        showEndGameForm();
    }
}

function showEndGameForm() {
    const formHtml = `
        <div id="end-game" class="end-game">
            <h2>YOU WON!</h2>
            <label for="username">Type your name (10):</label>
            <input type="text" id="username" maxlength="10" />
            <button onclick="saveScore()">Save score</button>
        </div>
    `;

    const container = document.getElementById('game-container');
    container.innerHTML += formHtml;
}

function showTopScores() {
    const topScoresContainer = document.getElementById('top-scores-container');
    if (topScoresContainer.style.display === 'block') {
        topScoresContainer.style.display = 'none';
        return;
    }

    fetch('http://localhost/memory/get_top_scores.php')
        .then(response => response.json())
        .then(data => {
            const topScores = document.getElementById('top-scores');
            topScores.innerHTML = '';

            data.forEach(board => {
                const boardDiv = document.createElement('div');
                boardDiv.innerHTML = `<h3>Board size: ${board.board_size}</h3>`;
                const list = document.createElement('ol');

                board.scores.forEach(score => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${score.username} - Punkty: ${score.score}, Ruchy: ${score.moves}`;
                    list.appendChild(listItem);
                });

                boardDiv.appendChild(list);
                topScores.appendChild(boardDiv);
            });

            topScoresContainer.style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

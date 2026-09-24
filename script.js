let totalScores = JSON.parse(localStorage.getItem("gameHubScores")) || {
    p1: 0,
    p2: 0,
    computer: 0
};

function updateLeaderboard() {
    document.getElementById("p1Total").textContent = totalScores.p1;
    document.getElementById("p2Total").textContent = totalScores.p2;
    document.getElementById("computerTotal").textContent = totalScores.computer;

    localStorage.setItem(
        "gameHubScores",
        JSON.stringify(totalScores)
    );
}

function resetAllScores() {
    totalScores = {
        p1: 0,
        p2: 0,
        computer: 0
    };

    updateLeaderboard();
}

function hidePages() {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
}

function openGame(game) {
    hidePages();

    if (game === "pen") {
        document.getElementById("penPage").classList.add("active");
    }

    if (game === "cricket") {
        document.getElementById("cricketPage").classList.add("active");
    }

    if (game === "dots") {
        document.getElementById("dotsPage").classList.add("active");
    }
}

function goHome() {
    hidePages();
    document.getElementById("homePage").classList.add("active");
}

/* ================= PEN FIGHTING ================= */

let penMode = "pvp";
let penScore1 = 0;
let penScore2 = 0;
let draggingPen = false;

function startPen(mode) {
    penMode = mode;

    document.getElementById("penGame").classList.remove("hidden");

    resetPen();
}

function resetPen() {
    penScore1 = 0;
    penScore2 = 0;

    document.getElementById("penP1").textContent = 0;
    document.getElementById("penP2").textContent = 0;

    document.getElementById("penMessage").textContent =
        "Drag your pen, aim and release!";
}

const pen1 = document.getElementById("pen1");

pen1.addEventListener("pointerdown", function () {
    draggingPen = true;
    pen1.setPointerCapture(event.pointerId);
});

pen1.addEventListener("pointermove", function (event) {

    if (!draggingPen) return;

    const table = document.getElementById("penTable");
    const rect = table.getBoundingClientRect();

    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    pen1.style.left = x + "px";
    pen1.style.top = y + "px";
});

pen1.addEventListener("pointerup", function () {

    draggingPen = false;

    const rect = document
        .querySelector(".hole2")
        .getBoundingClientRect();

    const penRect = pen1.getBoundingClientRect();

    const distance = Math.hypot(
        penRect.left - rect.left,
        penRect.top - rect.top
    );

    if (distance < 100) {

        penScore1++;

        document.getElementById("penP1").textContent =
            penScore1;

        totalScores.p1++;
        updateLeaderboard();

        document.getElementById("penMessage").textContent =
            "🎯 Player 1 scored!";
    } else {

        document.getElementById("penMessage").textContent =
            "Missed! Try again.";
    }

    if (penMode === "pvc") {
        setTimeout(computerPenMove, 700);
    }
});

function computerPenMove() {

    penScore2++;

    document.getElementById("penP2").textContent =
        penScore2;

    totalScores.computer++;
    updateLeaderboard();

    document.getElementById("penMessage").textContent =
        "🤖 Computer scored!";
}

/* ================= BOOK CRICKET ================= */

let cricketMode = "pvp";

let cricketData = {
    p1: {
        score: 0,
        ball: 0
    },

    p2: {
        score: 0,
        ball: 0
    }
};

const cricketers = [
    "Virat Kohli",
    "Rohit Sharma",
    "MS Dhoni",
    "Jasprit Bumrah",
    "Hardik Pandya",
    "Ravindra Jadeja",
    "Shubman Gill",
    "KL Rahul",
    "Rishabh Pant",
    "Suryakumar Yadav"
];

function startCricket(mode) {

    cricketMode = mode;

    document
        .getElementById("cricketGame")
        .classList.remove("hidden");

    resetCricket();

    document.getElementById("cricketMessage").textContent =
        "Choose your batter and click the book!";
}

function resetCricket() {

    cricketData = {
        p1: {
            score: 0,
            ball: 0
        },

        p2: {
            score: 0,
            ball: 0
        }
    };

    document.getElementById("cricketP1Score").textContent = 0;
    document.getElementById("cricketP2Score").textContent = 0;
    document.getElementById("ballCount").textContent = "Ball: 0 / 6";
    document.getElementById("currentBatter").textContent =
        "Batter: Player 1";
}

function bookFlip() {

    let left = Math.floor(Math.random() * 100) + 1;
    let right = Math.floor(Math.random() * 100) + 1;

    document.getElementById("leftNumber").textContent = left;
    document.getElementById("rightNumber").textContent = right;

    let number = right % 10;

    if (number === 8) {

        document.getElementById("cricketMessage").textContent =
            "OUT! Next batter.";

        cricketData.p1.ball++;

    } else {

        cricketData.p1.score += number;
        cricketData.p1.ball++;

        document.getElementById("cricketP1Score").textContent =
            cricketData.p1.score;
    }

    document.getElementById("ballCount").textContent =
        "Ball: " + cricketData.p1.ball + " / 6";

    if (cricketData.p1.ball >= 6) {

        document.getElementById("cricketMessage").textContent =
            "Player 1 batting finished!";

        if (cricketMode === "pvc") {
            setTimeout(computerCricketTurn, 700);
        }
    }

    totalScores.p1 = cricketData.p1.score;
    updateLeaderboard();
}

function computerCricketTurn() {

    let score = 0;

    for (let i = 0; i < 6; i++) {

        let n = Math.floor(Math.random() * 10);

        if (n !== 8) {
            score += n;
        }
    }

    cricketData.p2.score = score;

    document.getElementById("cricketP2Score").textContent =
        score;

    totalScores.computer = score;

    updateLeaderboard();

    document.getElementById("cricketMessage").textContent =
        "🤖 Computer finished batting!";
}

/* ================= DOTS & BLOCKS ================= */

const ROWS = 7;
const COLS = 8;

let dotsMode = "pvp";
let currentPlayer = 1;

let horizontalLines = [];
let verticalLines = [];
let boxes = [];

let dotsScore = {
    p1: 0,
    p2: 0
};

function startDots(mode) {

    dotsMode = mode;

    document
        .getElementById("dotsGame")
        .classList.remove("hidden");

    resetDots();
}

function resetDots() {

    currentPlayer = 1;

    dotsScore = {
        p1: 0,
        p2: 0
    };

    horizontalLines = [];
    verticalLines = [];
    boxes = [];

    createDotsBoard();

    updateDotsScore();

    document.getElementById("dotsMessage").textContent =
        "Connect two adjacent dots";
}

function createDotsBoard() {

    const board = document.getElementById("dotsBoard");

    board.innerHTML = "";

    const boardWidth = board.clientWidth;
    const boardHeight = board.clientHeight;

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS; c++) {

            const dot = document.createElement("div");

            dot.className = "dot";

            dot.style.left =
                (c / (COLS - 1) * 100) + "%";

            dot.style.top =
                (r / (ROWS - 1) * 100) + "%";

            board.appendChild(dot);
        }
    }

    createLines();

    createBoxes();
}

function createLines() {

    const board = document.getElementById("dotsBoard");

    const rect = board.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const xGap = 100 / (COLS - 1);
    const yGap = 100 / (ROWS - 1);

    horizontalLines = [];
    verticalLines = [];

    for (let r = 0; r < ROWS; r++) {

        for (let c = 0; c < COLS - 1; c++) {

            const line = document.createElement("div");

            line.className = "line horizontal";

            line.style.left =
                (c * xGap) + "%";

            line.style.top =
                (r * yGap) + "%";

            line.style.width =
                xGap + "%";

            line.dataset.type = "h";
            line.dataset.r = r;
            line.dataset.c = c;

            line.onclick = () =>
                playLine("h", r, c, line);

            board.appendChild(line);

            horizontalLines.push({
                r,
                c,
                used: false,
                element: line
            });
        }
    }

    for (let r = 0; r < ROWS - 1; r++) {

        for (let c = 0; c < COLS; c++) {

            const line = document.createElement("div");

            line.className = "line vertical";

            line.style.left =
                (c * xGap) + "%";

            line.style.top =
                (r * yGap) + "%";

            line.style.height =
                yGap + "%";

            line.dataset.type = "v";
            line.dataset.r = r;
            line.dataset.c = c;

            line.onclick = () =>
                playLine("v", r, c, line);

            board.appendChild(line);

            verticalLines.push({
                r,
                c,
                used: false,
                element: line
            });
        }
    }
}

function createBoxes() {

    boxes = [];

    for (let r = 0; r < ROWS - 1; r++) {

        for (let c = 0; c < COLS - 1; c++) {

            boxes.push({
                r,
                c,
                owner: 0
            });
        }
    }
}

function getHorizontal(r, c) {

    return horizontalLines.find(
        x => x.r === r && x.c === c
    );
}

function getVertical(r, c) {

    return verticalLines.find(
        x => x.r === r && x.c === c
    );
}

function boxCompleted(r, c) {

    const top = getHorizontal(r, c);
    const bottom = getHorizontal(r + 1, c);

    const left = getVertical(r, c);
    const right = getVertical(r, c + 1);

    return (
        top.used &&
        bottom.used &&
        left.used &&
        right.used
    );
}

function playLine(type, r, c, element) {

    let line;

    if (type === "h") {
        line = getHorizontal(r, c);
    } else {
        line = getVertical(r, c);
    }

    if (!line || line.used) return;

    line.used = true;

    element.classList.add(
        currentPlayer === 1 ? "red" : "blue"
    );

    let scored = false;

    if (type === "h") {

        if (r > 0 && boxCompleted(r - 1, c)) {

            claimBox(r - 1, c);
            scored = true;
        }

        if (r < ROWS - 1 && boxCompleted(r, c)) {

            claimBox(r, c);
            scored = true;
        }

    } else {

        if (c > 0 && boxCompleted(r, c - 1)) {

            claimBox(r, c - 1);
            scored = true;
        }

        if (c < COLS - 1 && boxCompleted(r, c)) {

            claimBox(r, c);
            scored = true;
        }
    }

    if (!scored) {

        currentPlayer =
            currentPlayer === 1 ? 2 : 1;
    }

    updateDotsScore();

    checkDotsGameOver();

    if (
        dotsMode === "pvc" &&
        currentPlayer === 2
    ) {

        setTimeout(computerDotsMove, 350);
    }
}

function claimBox(r, c) {

    const box = boxes.find(
        b => b.r === r && b.c === c
    );

    if (!box || box.owner !== 0) return;

    box.owner = currentPlayer;

    const board = document.getElementById("dotsBoard");

    const div = document.createElement("div");

    div.className =
        "box " +
        (currentPlayer === 1 ? "red" : "blue");

    div.textContent =
        currentPlayer === 1 ? "P1" : "P2";

    const x = c / (COLS - 1) * 100;
    const y = r / (ROWS - 1) * 100;

    div.style.left = x + "%";
    div.style.top = y + "%";

    div.style.width =
        (100 / (COLS - 1)) + "%";

    div.style.height =
        (100 / (ROWS - 1)) + "%";

    board.appendChild(div);

    if (currentPlayer === 1) {
        dotsScore.p1++;
    } else {
        dotsScore.p2++;
    }
}

function updateDotsScore() {

    document.getElementById("dotsP1").textContent =
        dotsScore.p1;

    document.getElementById("dotsP2").textContent =
        dotsScore.p2;

    document.getElementById("dotsTurn").textContent =
        currentPlayer === 1 ? "P1" : "P2";
}

function computerDotsMove() {

    const available = [
        ...horizontalLines,
        ...verticalLines
    ].filter(line => !line.used);

    if (available.length === 0) return;

    let best = null;

    for (const line of available) {

        if (wouldCompleteBox(line)) {
            best = line;
            break;
        }
    }

    if (!best) {

        best =
            available[
                Math.floor(Math.random() * available.length)
            ];
    }

    playLine(
        best.r !== undefined &&
        horizontalLines.includes(best)
            ? "h"
            : "v",
        best.r,
        best.c,
        best.element
    );
}

function wouldCompleteBox(line) {

    if (horizontalLines.includes(line)) {

        if (
            line.r > 0 &&
            boxCompleted(line.r - 1, line.c)
        ) return true;

        if (
            line.r < ROWS - 1 &&
            boxCompleted(line.r, line.c)
        ) return true;
    }

    if (verticalLines.includes(line)) {

        if (
            line.c > 0 &&
            boxCompleted(line.r, line.c - 1)
        ) return true;

        if (
            line.c < COLS - 1 &&
            boxCompleted(line.r, line.c)
        ) return true;
    }

    return false;
}

function checkDotsGameOver() {

    const totalBoxes =
        (ROWS - 1) * (COLS - 1);

    const captured =
        dotsScore.p1 + dotsScore.p2;

    if (captured !== totalBoxes) return;

    let message;

    if (dotsScore.p1 > dotsScore.p2) {
        message = "🏆 Player 1 Wins!";
    } else if (dotsScore.p2 > dotsScore.p1) {
        message = "🏆 Player 2 Wins!";
    } else {
        message = "🤝 Draw!";
    }

    document.getElementById("dotsMessage").textContent =
        message;

    totalScores.p1 += dotsScore.p1;
    totalScores.p2 += dotsScore.p2;

    updateLeaderboard();
}

updateLeaderboard();

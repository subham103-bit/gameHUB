/* =========================================================
   GLOBAL
========================================================= */

const screens = {
    home: document.getElementById("homeScreen"),
    cricketSelect: document.getElementById("cricketSelectScreen"),
    cricketGame: document.getElementById("cricketGameScreen"),
    pen: document.getElementById("penScreen")
};

let leaderboard = {
    p1Cricket: 0,
    p2Cricket: 0,
    cpuCricket: 0,
    p1Pen: 0,
    p2Pen: 0,
    cpuPen: 0
};

function showScreen(screen) {
    Object.values(screens).forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
}

function goHome() {
    stopPenAnimation();
    document.getElementById("cricketResultOverlay").classList.remove("show");
    document.getElementById("penResultOverlay").classList.remove("show");
    showScreen(screens.home);
    updateLeaderboard();
}

function updateLeaderboard() {

    document.getElementById("lbP1Cricket").textContent =
        leaderboard.p1Cricket;

    document.getElementById("lbP2Cricket").textContent =
        leaderboard.p2Cricket;

    document.getElementById("lbCpuCricket").textContent =
        leaderboard.cpuCricket;

    document.getElementById("lbP1Pen").textContent =
        leaderboard.p1Pen;

    document.getElementById("lbP2Pen").textContent =
        leaderboard.p2Pen;

    document.getElementById("lbCpuPen").textContent =
        leaderboard.cpuPen;

    document.getElementById("lbP1Total").textContent =
        leaderboard.p1Cricket + leaderboard.p1Pen;

    document.getElementById("lbP2Total").textContent =
        leaderboard.p2Cricket + leaderboard.p2Pen;

    document.getElementById("lbCpuTotal").textContent =
        leaderboard.cpuCricket + leaderboard.cpuPen;
}


/* =========================================================
   BOOK CRICKET
========================================================= */

const cricketers = [
    "Virat Kohli",
    "Rohit Sharma",
    "MS Dhoni",
    "Jasprit Bumrah",
    "Hardik Pandya",
    "KL Rahul",
    "Ravindra Jadeja",
    "Shubman Gill",
    "Rishabh Pant",
    "Suryakumar Yadav"
];

let cricket = {
    mode: "pvp",

    selected: [],

    teams: {
        p1: [],
        p2: []
    },

    score: [0, 0],
    balls: [0, 0],
    out: [false, false],

    currentInnings: 0,

    pageBusy: false,
    matchOver: false
};


function openCricket(mode) {

    cricket.mode = mode;

    resetCricketState();

    renderPlayerSelection();

    showScreen(screens.cricketSelect);
}


function resetCricketState() {

    cricket.selected = [];

    cricket.teams = {
        p1: [],
        p2: []
    };

    cricket.score = [0, 0];
    cricket.balls = [0, 0];
    cricket.out = [false, false];

    cricket.currentInnings = 0;
    cricket.pageBusy = false;
    cricket.matchOver = false;

    document.getElementById("cricketResultOverlay")
        .classList.remove("show");
}


function renderPlayerSelection() {

    const grid = document.getElementById("playerSelectionGrid");

    grid.innerHTML = "";

    cricketers.forEach((name, index) => {

        const card = document.createElement("button");

        card.className = "player-choice";

        card.innerHTML = `
            <div class="player-avatar">🏏</div>
            <h3>${name}</h3>
            <span>Player ${index + 1}</span>
        `;

        card.onclick = () => toggleCricketer(index, card);

        grid.appendChild(card);
    });

    updateSelectionUI();
}


function toggleCricketer(index, card) {

    const name = cricketers[index];

    if (cricket.selected.includes(name)) {

        cricket.selected =
            cricket.selected.filter(p => p !== name);

        card.classList.remove("selected");

    } else {

        if (cricket.selected.length >= 3) {
            return;
        }

        cricket.selected.push(name);

        card.classList.add("selected");
    }

    updateSelectionUI();
}


function updateSelectionUI() {

    const count = cricket.selected.length;

    document.getElementById("selectedCount").textContent = count;

    const button = document.getElementById("startCricketBtn");

    button.disabled = count !== 3;

    if (count === 3) {
        button.textContent = "START MATCH";
    } else {
        button.textContent = `SELECT ${3 - count} MORE`;
    }
}


function startCricketMatch() {

    if (cricket.selected.length !== 3) {
        return;
    }

    cricket.teams.p1 = [...cricket.selected];

    const remaining = cricketers.filter(
        p => !cricket.selected.includes(p)
    );

    cricket.teams.p2 =
        shuffleArray(remaining).slice(0, 3);

    cricket.score = [0, 0];
    cricket.balls = [0, 0];
    cricket.out = [false, false];

    cricket.currentInnings = 0;

    document.getElementById("teamTwoName").textContent =
        cricket.mode === "pvc" ? "COMPUTER" : "PLAYER 2";

    resetBookDisplay();

    showScreen(screens.cricketGame);

    updateCricketUI();
}


function shuffleArray(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}


/* ================= BOOK MECHANICS ================= */

function playBookBall() {

    if (cricket.pageBusy || cricket.matchOver) {
        return;
    }

    cricket.pageBusy = true;

    const button = document.getElementById("openPageBtn");

    button.disabled = true;

    document.getElementById("bookStatus").textContent =
        "Opening page...";

    const book = document.querySelector(".book");

    book.classList.add("book-opening");

    setTimeout(() => {

        const pageNumber =
            Math.floor(Math.random() * 900) + 100;

        const lastDigit = pageNumber % 10;

        document.getElementById("pageNumber").textContent =
            pageNumber;

        let resultText;

        if (lastDigit === 8) {

            resultText = "OUT!";

            document.getElementById("runsResult").innerHTML =
                `<span style="color:#ff5c6c">💥 OUT!</span>`;

            cricket.out[cricket.currentInnings] = true;

        } else {

            cricket.score[cricket.currentInnings] += lastDigit;

            resultText =
                lastDigit === 0
                    ? "DOT BALL"
                    : `+${lastDigit} RUN${lastDigit === 1 ? "" : "S"}`;

            document.getElementById("runsResult").innerHTML =
                `<span>🏏 ${resultText}</span>`;
        }

        cricket.balls[cricket.currentInnings]++;

        updateCricketUI();

        setTimeout(() => {

            book.classList.remove("book-opening");

            finishCricketBall();

        }, 900);

    }, 700);
}


function finishCricketBall() {

    const innings = cricket.currentInnings;

    /*
       IMPORTANT:
       OUT immediately ends the current innings.
       Otherwise the innings continues until 6 balls.
    */

    if (cricket.out[innings]) {

        setTimeout(() => {
            moveToNextInnings();
        }, 900);

        return;
    }

    /*
       Six balls complete = innings over.
    */

    if (cricket.balls[innings] >= 6) {

        setTimeout(() => {
            moveToNextInnings();
        }, 900);

        return;
    }

    cricket.pageBusy = false;

    document.getElementById("openPageBtn").disabled = false;

    document.getElementById("bookStatus").textContent =
        "Ready for next ball";
}


function moveToNextInnings() {

    if (cricket.currentInnings === 0) {

        cricket.currentInnings = 1;

        cricket.pageBusy = false;

        resetBookDisplay();

        document.getElementById("openPageBtn").disabled = false;

        document.getElementById("bookStatus").textContent =
            "Player 2 is batting!";

        updateCricketUI();

        return;
    }

    finishCricketMatch();
}


function resetBookDisplay() {

    document.getElementById("pageNumber").textContent = "?";

    document.getElementById("runsResult").innerHTML =
        "<span>PRESS OPEN PAGE</span>";

    document.getElementById("currentBall").textContent =
        cricket.balls[cricket.currentInnings] + 1;

    document.getElementById("bookStatus").textContent =
        cricket.currentInnings === 0
            ? "Player 1 is batting"
            : "Player 2 is batting";
}


function updateCricketUI() {

    document.getElementById("scoreOne").textContent =
        cricket.score[0];

    document.getElementById("scoreTwo").textContent =
        cricket.score[1];

    document.getElementById("ballsOne").textContent =
        `${cricket.balls[0]} / 6 balls`;

    document.getElementById("ballsTwo").textContent =
        `${cricket.balls[1]} / 6 balls`;

    document.getElementById("wicketOne").textContent =
        cricket.out[0] ? "OUT" : "NOT OUT";

    document.getElementById("wicketTwo").textContent =
        cricket.out[1] ? "OUT" : "NOT OUT";

    document.getElementById("teamOneCard")
        .classList.toggle(
            "active-team",
            cricket.currentInnings === 0
        );

    document.getElementById("teamTwoCard")
        .classList.toggle(
            "active-team",
            cricket.currentInnings === 1
        );

    document.getElementById("cricketInningsTitle").textContent =
        cricket.currentInnings === 0
            ? "Player 1 Batting"
            : cricket.mode === "pvc"
                ? "Computer Batting"
                : "Player 2 Batting";

    document.getElementById("currentBall").textContent =
        Math.min(
            cricket.balls[cricket.currentInnings] + 1,
            6
        );
}


function finishCricketMatch() {

    cricket.matchOver = true;

    const score1 = cricket.score[0];
    const score2 = cricket.score[1];

    let winner;

    if (score1 > score2) {

        winner = "PLAYER 1";

        leaderboard.p1Cricket++;

    } else if (score2 > score1) {

        winner =
            cricket.mode === "pvc"
                ? "COMPUTER"
                : "PLAYER 2";

        if (cricket.mode === "pvc") {
            leaderboard.cpuCricket++;
        } else {
            leaderboard.p2Cricket++;
        }

    } else {

        winner = "MATCH DRAW";
    }

    document.getElementById("finalScoreOne").textContent =
        score1;

    document.getElementById("finalScoreTwo").textContent =
        score2;

    document.getElementById("finalTeamTwoName").textContent =
        cricket.mode === "pvc"
            ? "COMPUTER"
            : "PLAYER 2";

    document.getElementById("cricketWinnerText").textContent =
        winner === "MATCH DRAW"
            ? "Match Draw!"
            : `${winner} Wins!`;

    document.getElementById("cricketResultDescription").textContent =
        `Final score: ${score1} - ${score2}`;

    document.getElementById("cricketResultOverlay")
        .classList.add("show");

    updateLeaderboard();
}


function restartCricket() {

    document.getElementById("cricketResultOverlay")
        .classList.remove("show");

    openCricket(cricket.mode);
}


/* =========================================================
   PEN FIGHT
========================================================= */

const penCanvas =
    document.getElementById("penCanvas");

const ctx = penCanvas.getContext("2d");

const WORLD = {
    width: 900,
    height: 500
};

const penHoles = {
    left: {
        x: 34,
        y: WORLD.height / 2,
        radius: 34
    },

    right: {
        x: WORLD.width - 34,
        y: WORLD.height / 2,
        radius: 34
    }
};

let pen = {

    mode: "pvp",

    turn: 0,

    scores: [0, 0],

    hp: [3, 3],

    matchOver: false,

    roundOver: false,

    moving: false,

    dragging: false,

    dragStart: null,

    dragCurrent: null,

    animationId: null,

    p1: {
        x: 250,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 18,
        angle: 0
    },

    p2: {
        x: 650,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 18,
        angle: 0
    }
};


function openPen(mode) {

    pen.mode = mode;

    restartPen();

    showScreen(screens.pen);
}


function setupPenCanvas() {

    const rect = penCanvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    penCanvas.width =
        WORLD.width * dpr;

    penCanvas.height =
        WORLD.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    drawPenGame();
}


window.addEventListener("resize", () => {

    if (screens.pen.classList.contains("active")) {
        setupPenCanvas();
    }
});


/* ================= PEN RESTART ================= */

function restartPen() {

    stopPenAnimation();

    pen.scores = [0, 0];

    pen.hp = [3, 3];

    pen.turn = 0;

    pen.matchOver = false;

    pen.roundOver = false;

    pen.dragging = false;

    pen.moving = false;

    pen.p1 = {
        x: 250,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 18,
        angle: 0
    };

    pen.p2 = {
        x: 650,
        y: 250,
        vx: 0,
        vy: 0,
        radius: 18,
        angle: 0
    };

    document.getElementById("penResultOverlay")
        .classList.remove("show");

    document.getElementById("penOpponentName").textContent =
        pen.mode === "pvc"
            ? "COMPUTER"
            : "PLAYER 2";

    document.getElementById("penOpponentLabel").textContent =
        pen.mode === "pvc"
            ? "CPU"
            : "PLAYER";

    updatePenHUD();

    updatePenPower(0);

    setTimeout(() => {
        setupPenCanvas();
    }, 20);
}


function updatePenHUD() {

    document.getElementById("penScore1").textContent =
        pen.scores[0];

    document.getElementById("penScore2").textContent =
        pen.scores[1];

    document.getElementById("p1Hp").textContent =
        pen.hp[0];

    document.getElementById("p2Hp").textContent =
        pen.hp[1];

    document.getElementById("p1HpBar").style.width =
        `${pen.hp[0] / 3 * 100}%`;

    document.getElementById("p2HpBar").style.width =
        `${pen.hp[1] / 3 * 100}%`;

    const turnName =
        pen.turn === 0
            ? "PLAYER 1 TURN"
            : pen.mode === "pvc"
                ? "COMPUTER TURN"
                : "PLAYER 2 TURN";

    document.getElementById("penArenaStatus").textContent =
        turnName;
}


/* ================= PEN POWER ================= */

function updatePenPower(power) {

    const maxPower = 250;

    const percentage =
        Math.min(
            100,
            Math.round((power / maxPower) * 100)
        );

    document.getElementById("powerFill")
        .style.width = `${percentage}%`;

    document.getElementById("powerPercent")
        .textContent = `${percentage}%`;
}


/* ================= POINTER ================= */

function getCanvasPoint(event) {

    const rect =
        penCanvas.getBoundingClientRect();

    return {

        x:
            (event.clientX - rect.left)
            * WORLD.width
            / rect.width,

        y:
            (event.clientY - rect.top)
            * WORLD.height
            / rect.height
    };
}


penCanvas.addEventListener(
    "pointerdown",
    e => {

        if (
            pen.matchOver ||
            pen.moving ||
            pen.roundOver
        ) {
            return;
        }

        if (
            pen.mode === "pvc" &&
            pen.turn === 1
        ) {
            return;
        }

        const point = getCanvasPoint(e);

        const player =
            pen.turn === 0
                ? pen.p1
                : pen.p2;

        const distance =
            Math.hypot(
                point.x - player.x,
                point.y - player.y
            );

        if (distance > 50) {
            return;
        }

        pen.dragging = true;

        pen.dragStart = {
            x: player.x,
            y: player.y
        };

        pen.dragCurrent = point;

        penCanvas.setPointerCapture(e.pointerId);

        updatePenPower(0);

        drawPenGame();
    }
);


penCanvas.addEventListener(
    "pointermove",
    e => {

        if (!pen.dragging) {
            return;
        }

        const point = getCanvasPoint(e);

        pen.dragCurrent = point;

        const player =
            pen.turn === 0
                ? pen.p1
                : pen.p2;

        const dx =
            player.x - point.x;

        const dy =
            player.y - point.y;

        const power =
            Math.hypot(dx, dy);

        updatePenPower(power);

        drawPenGame();
    }
);


penCanvas.addEventListener(
    "pointerup",
    e => {

        if (!pen.dragging) {
            return;
        }

        pen.dragging = false;

        const player =
            pen.turn === 0
                ? pen.p1
                : pen.p2;

        const dx =
            player.x - pen.dragCurrent.x;

        const dy =
            player.y - pen.dragCurrent.y;

        const distance =
            Math.hypot(dx, dy);

        /*
           IMPORTANT:
           Minimum launch power.
           This is the actual fix for the pen
           not moving after release.
        */

        if (distance < 8) {

            updatePenPower(0);

            drawPenGame();

            return;
        }

        const maxDrag = 250;

        const limited =
            Math.min(distance, maxDrag);

        const power =
            limited / maxDrag;

        const directionX =
            dx / distance;

        const directionY =
            dy / distance;

        const launchSpeed =
            4 + power * 18;

        player.vx =
            directionX * launchSpeed;

        player.vy =
            directionY * launchSpeed;

        pen.moving = true;

        updatePenPower(limited);

        startPenAnimation();
    }
);


/* =========================================================
   PEN PHYSICS
========================================================= */

function startPenAnimation() {

    stopPenAnimation();

    function frame() {

        if (pen.matchOver) {
            return;
        }

        updatePenPhysics();

        drawPenGame();

        if (pen.moving) {

            pen.animationId =
                requestAnimationFrame(frame);

        } else {

            finishPenTurn();
        }
    }

    pen.animationId =
        requestAnimationFrame(frame);
}


function stopPenAnimation() {

    if (pen.animationId) {

        cancelAnimationFrame(
            pen.animationId
        );

        pen.animationId = null;
    }
}


function updatePenPhysics() {

    const p1 = pen.p1;
    const p2 = pen.p2;

    const players = [p1, p2];

    for (const player of players) {

        player.x += player.vx;

        player.y += player.vy;

        player.angle +=
            Math.hypot(
                player.vx,
                player.vy
            ) * 0.03;


        /*
           HOLE DETECTION FIRST
        */

        if (penEnteredHole(player)) {

            const loser =
                player === p1 ? 0 : 1;

            penOut(loser);

            return;
        }


        /*
           WALL COLLISION
        */

        if (
            player.y - player.radius < 10
        ) {

            player.y =
                10 + player.radius;

            player.vy =
                Math.abs(player.vy) * .82;
        }

        if (
            player.y + player.radius >
            WORLD.height - 10
        ) {

            player.y =
                WORLD.height - 10 -
                player.radius;

            player.vy =
                -Math.abs(player.vy) * .82;
        }

        /*
           Left and right boundaries have
           openings around the holes.
        */

        const nearLeftHole =
            Math.hypot(
                player.x - penHoles.left.x,
                player.y - penHoles.left.y
            ) <
            penHoles.left.radius + 20;

        const nearRightHole =
            Math.hypot(
                player.x - penHoles.right.x,
                player.y - penHoles.right.y
            ) <
            penHoles.right.radius + 20;

        if (
            player.x - player.radius < 10 &&
            !nearLeftHole
        ) {

            player.x =
                10 + player.radius;

            player.vx =
                Math.abs(player.vx) * .82;
        }

        if (
            player.x + player.radius >
            WORLD.width - 10 &&
            !nearRightHole
        ) {

            player.x =
                WORLD.width - 10 -
                player.radius;

            player.vx =
                -Math.abs(player.vx) * .82;
        }
    }


    /*
       PEN COLLISION
    */

    const dx =
        p2.x - p1.x;

    const dy =
        p2.y - p1.y;

    const distance =
        Math.hypot(dx, dy);

    const minimumDistance =
        p1.radius + p2.radius;

    if (
        distance < minimumDistance &&
        distance > 0
    ) {

        const nx =
            dx / distance;

        const ny =
            dy / distance;

        const relativeVelocityX =
            p1.vx - p2.vx;

        const relativeVelocityY =
            p1.vy - p2.vy;

        const velocityAlongNormal =
            relativeVelocityX * nx +
            relativeVelocityY * ny;

        if (velocityAlongNormal > 0) {

            const impulse =
                velocityAlongNormal;

            p1.vx -=
                impulse * nx * .95;

            p1.vy -=
                impulse * ny * .95;

            p2.vx +=
                impulse * nx * .95;

            p2.vy +=
                impulse * ny * .95;
        }

        /*
           Separate overlapping pens.
        */

        const overlap =
            minimumDistance - distance;

        p1.x -= nx * overlap / 2;
        p1.y -= ny * overlap / 2;

        p2.x += nx * overlap / 2;
        p2.y += ny * overlap / 2;
    }


    /*
       FRICTION
    */

    const friction = .965;

    p1.vx *= friction;
    p1.vy *= friction;

    p2.vx *= friction;
    p2.vy *= friction;


    /*
       STOP THRESHOLD
    */

    const speed1 =
        Math.hypot(p1.vx,p1.vy);

    const speed2 =
        Math.hypot(p2.vx,p2.vy);

    if (speed1 < .08) {

        p1.vx = 0;
        p1.vy = 0;
    }

    if (speed2 < .08) {

        p2.vx = 0;
        p2.vy = 0;
    }


    /*
       Only current player's launch
       determines whether turn is finished.
    */

    const current =
        pen.turn === 0 ? p1 : p2;

    if (
        Math.hypot(
            current.vx,
            current.vy
        ) < .08
    ) {

        current.vx = 0;
        current.vy = 0;

        pen.moving = false;
    }
}


/* ================= HOLE ================= */

function penEnteredHole(player) {

    const leftDistance =
        Math.hypot(
            player.x - penHoles.left.x,
            player.y - penHoles.left.y
        );

    const rightDistance =
        Math.hypot(
            player.x - penHoles.right.x,
            player.y - penHoles.right.y
        );

    return (
        leftDistance <
        penHoles.left.radius
        ||
        rightDistance <
        penHoles.right.radius
    );
}


function penOut(loser) {

    if (pen.roundOver || pen.matchOver) {
        return;
    }

    pen.roundOver = true;

    const winner =
        loser === 0 ? 1 : 0;

    pen.scores[winner]++;

    pen.hp[loser]--;

    updatePenHUD();

    const loserPen =
        loser === 0 ? pen.p1 : pen.p2;

    if (loser === 0) {

        loserPen.x = penHoles.left.x;
        loserPen.y = penHoles.left.y;

    } else {

        loserPen.x = penHoles.right.x;
        loserPen.y = penHoles.right.y;
    }

    loserPen.vx = 0;
    loserPen.vy = 0;

    drawPenGame();


    /*
       First player to get 3 points wins.
    */

    if (pen.scores[winner] >= 3) {

        setTimeout(() => {
            finishPenMatch(winner);
        }, 900);

        return;
    }


    /*
       Otherwise next round starts.
    */

    setTimeout(() => {

        resetPenRound();

    }, 1100);
}


function resetPenRound() {

    pen.p1.x = 250;
    pen.p1.y = 250;

    pen.p2.x = 650;
    pen.p2.y = 250;

    pen.p1.vx = 0;
    pen.p1.vy = 0;

    pen.p2.vx = 0;
    pen.p2.vy = 0;

    pen.turn =
        pen.turn === 0 ? 1 : 0;

    pen.roundOver = false;

    pen.moving = false;

    updatePenPower(0);

    updatePenHUD();

    drawPenGame();


    /*
       Computer automatically takes turn.
    */

    if (
        pen.mode === "pvc" &&
        pen.turn === 1
    ) {

        setTimeout(() => {

            computerPenMove();

        }, 700);
    }
}


function finishPenTurn() {

    if (pen.roundOver) {
        return;
    }

    pen.moving = false;

    pen.turn =
        pen.turn === 0 ? 1 : 0;

    updatePenPower(0);

    updatePenHUD();

    drawPenGame();


    if (
        pen.mode === "pvc" &&
        pen.turn === 1
    ) {

        setTimeout(() => {

            computerPenMove();

        }, 700);
    }
}


/* ================= COMPUTER ================= */

function computerPenMove() {

    if (
        pen.matchOver ||
        pen.roundOver ||
        pen.moving ||
        pen.turn !== 1
    ) {
        return;
    }

    const computer = pen.p2;
    const target = pen.p1;

    /*
       Aim towards opponent with
       slight randomness.
    */

    const targetX =
        target.x +
        (Math.random() - .5) * 50;

    const targetY =
        target.y +
        (Math.random() - .5) * 50;

    const dx =
        computer.x - targetX;

    const dy =
        computer.y - targetY;

    const distance =
        Math.hypot(dx,dy);

    if (distance === 0) {
        return;
    }

    const power =
        .55 + Math.random() * .3;

    const speed =
        7 + power * 10;

    computer.vx =
        (dx / distance) * speed;

    computer.vy =
        (dy / distance) * speed;

    pen.moving = true;

    updatePenPower(power * 250);

    startPenAnimation();
}


/* =========================================================
   PEN DRAWING
========================================================= */

function drawPenGame() {

    ctx.clearRect(
        0,
        0,
        WORLD.width,
        WORLD.height
    );

    /*
       Background
    */

    const bg =
        ctx.createLinearGradient(
            0,
            0,
            WORLD.width,
            WORLD.height
        );

    bg.addColorStop(0,"#0d1420");
    bg.addColorStop(1,"#080b12");

    ctx.fillStyle = bg;

    ctx.fillRect(
        0,
        0,
        WORLD.width,
        WORLD.height
    );


    /*
       Grid
    */

    ctx.save();

    ctx.strokeStyle =
        "rgba(80,120,180,.08)";

    ctx.lineWidth = 1;

    for (
        let x = 20;
        x < WORLD.width;
        x += 25
    ) {

        ctx.beginPath();

        ctx.moveTo(x,0);
        ctx.lineTo(x,WORLD.height);

        ctx.stroke();
    }

    for (
        let y = 20;
        y < WORLD.height;
        y += 25
    ) {

        ctx.beginPath();

        ctx.moveTo(0,y);
        ctx.lineTo(WORLD.width,y);

        ctx.stroke();
    }

    ctx.restore();


    /*
       Outer arena
    */

    ctx.save();

    ctx.strokeStyle =
        "rgba(83,154,255,.35)";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        10,
        10,
        WORLD.width - 20,
        WORLD.height - 20
    );

    ctx.restore();


    /*
       Center line
    */

    ctx.save();

    ctx.setLineDash([7,12]);

    ctx.strokeStyle =
        "rgba(255,255,255,.07)";

    ctx.beginPath();

    ctx.moveTo(
        WORLD.width / 2,
        20
    );

    ctx.lineTo(
        WORLD.width / 2,
        WORLD.height - 20
    );

    ctx.stroke();

    ctx.restore();


    /*
       Center circle
    */

    ctx.beginPath();

    ctx.arc(
        WORLD.width / 2,
        WORLD.height / 2,
        55,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.06)";

    ctx.stroke();


    /*
       Holes
    */

    drawPenHole(penHoles.left);

    drawPenHole(penHoles.right);


    /*
       Aim line
    */

    if (pen.dragging) {

        const player =
            pen.turn === 0
                ? pen.p1
                : pen.p2;

        ctx.save();

        ctx.setLineDash([7,8]);

        ctx.strokeStyle =
            pen.turn === 0
                ? "rgba(66,232,255,.75)"
                : "rgba(255,79,154,.75)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            player.x,
            player.y
        );

        ctx.lineTo(
            pen.dragCurrent.x,
            pen.dragCurrent.y
        );

        ctx.stroke();

        ctx.restore();

        /*
           Aim arrow
        */

        const dx =
            player.x - pen.dragCurrent.x;

        const dy =
            player.y - pen.dragCurrent.y;

        const length =
            Math.hypot(dx,dy);

        if (length > 5) {

            const ux = dx / length;
            const uy = dy / length;

            const arrowX =
                player.x + ux * 50;

            const arrowY =
                player.y + uy * 50;

            ctx.save();

            ctx.fillStyle =
                pen.turn === 0
                    ? "#42e8ff"
                    : "#ff4f9a";

            ctx.beginPath();

            ctx.arc(
                arrowX,
                arrowY,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }
    }


    /*
       Pens
    */

    drawPen(
        pen.p1,
        "#42e8ff",
        "#087f99"
    );

    drawPen(
        pen.p2,
        "#ff4f9a",
        "#a41458"
    );
}


function drawPenHole(hole) {

    /*
       Outer glow
    */

    const glow =
        ctx.createRadialGradient(
            hole.x,
            hole.y,
            4,
            hole.x,
            hole.y,
            hole.radius + 22
        );

    glow.addColorStop(
        0,
        "rgba(0,0,0,.95)"
    );

    glow.addColorStop(
        .55,
        "rgba(0,0,0,.9)"
    );

    glow.addColorStop(
        1,
        "rgba(77,141,255,0)"
    );

    ctx.beginPath();

    ctx.arc(
        hole.x,
        hole.y,
        hole.radius + 20,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = glow;

    ctx.fill();


    /*
       Hole
    */

    const gradient =
        ctx.createRadialGradient(
            hole.x - 5,
            hole.y - 5,
            2,
            hole.x,
            hole.y,
            hole.radius
        );

    gradient.addColorStop(
        0,
        "#000000"
    );

    gradient.addColorStop(
        .8,
        "#020308"
    );

    gradient.addColorStop(
        1,
        "#141b28"
    );

    ctx.beginPath();

    ctx.arc(
        hole.x,
        hole.y,
        hole.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = gradient;

    ctx.fill();


    ctx.strokeStyle =
        "rgba(255,255,255,.12)";

    ctx.lineWidth = 2;

    ctx.stroke();
}


function drawPen(player, mainColor, darkColor) {

    ctx.save();

    /*
       Glow
    */

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        mainColor;

    /*
       Rotate
    */

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(
        player.angle
    );


    /*
       Pen body
    */

    const width = 52;
    const height = 15;

    const x = -width / 2;
    const y = -height / 2;

    const radius = 7;

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x + width,
            y
        );

    gradient.addColorStop(
        0,
        darkColor
    );

    gradient.addColorStop(
        .5,
        mainColor
    );

    gradient.addColorStop(
        1,
        "#ffffff"
    );

    ctx.fillStyle = gradient;

    ctx.fill();


    /*
       Pen tip
    */

    ctx.shadowBlur = 5;

    ctx.beginPath();

    ctx.moveTo(
        width / 2,
        -height / 2
    );

    ctx.lineTo(
        width / 2 + 13,
        0
    );

    ctx.lineTo(
        width / 2,
        height / 2
    );

    ctx.closePath();

    ctx.fillStyle = "#e8edf5";

    ctx.fill();


    /*
       Clip
    */

    ctx.fillStyle =
        "rgba(255,255,255,.75)";

    ctx.fillRect(
        -2,
        -height / 2 - 4,
        20,
        3
    );

    ctx.restore();
}


/* =========================================================
   PEN RESULT
========================================================= */

function finishPenMatch(winner) {

    pen.matchOver = true;

    stopPenAnimation();

    let winnerName;

    if (winner === 0) {

        winnerName = "PLAYER 1";

        leaderboard.p1Pen++;

    } else {

        winnerName =
            pen.mode === "pvc"
                ? "COMPUTER"
                : "PLAYER 2";

        if (pen.mode === "pvc") {
            leaderboard.cpuPen++;
        } else {
            leaderboard.p2Pen++;
        }
    }

    document.getElementById("penResultTitle")
        .textContent =
        `${winnerName} WINS`;

    document.getElementById("penResultDescription")
        .textContent =
        "Your opponent was knocked into OUT.";

    document.getElementById("penFinal1")
        .textContent =
        pen.scores[0];

    document.getElementById("penFinal2")
        .textContent =
        pen.scores[1];

    document.getElementById("penFinalTwoName")
        .textContent =
        pen.mode === "pvc"
            ? "COMPUTER"
            : "PLAYER 2";

    document.getElementById("penResultOverlay")
        .classList.add("show");

    updateLeaderboard();
}


/* =========================================================
   STARTUP
========================================================= */

updateLeaderboard();

setupPenCanvas();
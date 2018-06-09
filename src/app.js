// JavaScript code goes here
var canvas = document.getElementById ('myCanvas');
var ctx = canvas.getContext ('2d');

var rightPressed = false;
var leftPressed = false;

var gameConfig = {
  colors: {
    ball: ['white', 'red'],
    bricks: {
      0: ['red', 'red'],
      1: ['red', 'red'],
      2: ['orange', 'orange'],
      3: ['orange', 'orange'],
      4: ['green', 'green'],
      5: ['green', 'green'],
      6: ['yellow', 'yellow'],
      7: ['yellow', 'yellow'],
    },

    paddle: ['red', 'white', 'blue'],
  },
  ballSpeedMultiplier: 0.3,
  paddleWidth: 150,
};

var gameState = {
  gameRunning: false,
  paddleWidth: 150,
  paddleHeight: 20,
  score: 0,
  lives: 3,
  bricks: [],
  ballRadius: 10,
  ballX: canvas.width / 2,
  ballY: canvas.height - 30,

  topWasHit: false,
  ballForceX: 0,
  ballForceY: 0,
  ballSpeed: 2,
  ballDirectionX: 1,
  ballDirectionY: -1,

  brickRowCount: 8,
  brickColumnCount: 8,
  brickWidth: 75,
  brickHeight: 20,
  brickPadding: 10,
  brickOffsetTop: 30,
  brickOffsetLeft: 30,
  highestBrickRowBroken: 8,
};

gameState.ballForceY = gameState.ballForceX * -1;
gameState.paddleX = (canvas.width - gameState.paddleWidth) / 2;

// Create bricks
for (var c = 0; c < gameState.brickColumnCount; c++) {
  gameState.bricks[c] = [];
  for (var r = 0; r < gameState.brickRowCount; r++) {
    gameState.bricks[c][r] = {x: 0, y: 0, status: 1};
  }
}

function drawBall () {
  // Draw the ball
  ctx.beginPath ();
  ctx.arc (
    gameState.ballX,
    gameState.ballY,
    gameState.ballRadius,
    0,
    Math.PI * 2
  );
  var ballGradient = ctx.createRadialGradient (
    gameState.ballX,
    gameState.ballY,
    gameState.ballRadius / 2,
    gameState.ballX,
    gameState.ballY,
    gameState.ballRadius
  );
  ballGradient.addColorStop (0, gameConfig.colors.ball[0]);
  ballGradient.addColorStop (1, gameConfig.colors.ball[1]);
  ctx.fillStyle = ballGradient;

  ctx.fill ();
  ctx.closePath ();
}

function drawPaddle () {
  ctx.beginPath ();
  ctx.rect (
    gameState.paddleX,
    canvas.height - gameState.paddleHeight,
    gameState.paddleWidth,
    gameState.paddleHeight
  );
  var paddleGradient = ctx.createLinearGradient (
    gameState.paddleX,
    canvas.height - gameState.paddleHeight,
    gameState.paddleX,
    canvas.height
  );
  paddleGradient.addColorStop (0, gameConfig.colors.paddle[0]);
  paddleGradient.addColorStop (0.5, gameConfig.colors.paddle[1]);
  paddleGradient.addColorStop (1, gameConfig.colors.paddle[2]);
  ctx.fillStyle = paddleGradient;

  ctx.fill ();
  ctx.closePath ();
}

function drawBricks () {
  gradients = [];
  for (var c = 0; c < gameState.brickColumnCount; c++) {
    gradients[c] = [];
    for (var r = 0; r < gameState.brickRowCount; r++) {
      if (gameState.bricks[c][r].status == 1) {
        var brickX =
          c * (gameState.brickWidth + gameState.brickPadding) +
          gameState.brickOffsetLeft;
        var brickY =
          r * (gameState.brickHeight + gameState.brickPadding) +
          gameState.brickOffsetTop;
        gameState.bricks[c][r].x = brickX;
        gameState.bricks[c][r].y = brickY;
        ctx.beginPath ();
        ctx.rect (brickX, brickY, gameState.brickWidth, gameState.brickHeight);
        gradients[c][r] = ctx.createLinearGradient (
          brickX,
          brickY,
          brickX,
          brickY + gameState.brickHeight
        );
        gradients[c][r].addColorStop (0, gameConfig.colors.bricks[r][0]);
        gradients[c][r].addColorStop (1, gameConfig.colors.bricks[r][1]);
        ctx.fillStyle = gradients[c][r];

        ctx.fill ();
        ctx.closePath ();
      }
    }
  }
}

function resetBricks () {
  for (var c = 0; c < gameState.brickColumnCount; c++) {
    for (var r = 0; r < gameState.brickRowCount; r++) {
      gameState.bricks[c][r].status = 1;
    }
  }
}

function resetGame () {
  resetBricks ();
  gameState.score = 0;
  gameState.lives = 3;
  resetBoard ();
  gameState.gameRunning = true;
  draw ();
}

function drawScore () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Score: ' + gameState.score, 8, 20);
}

function drawLives () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Lives: ' + gameState.lives, canvas.width - 65, 20);
}

function drawGameOver () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Game Over!', canvas.width / 2, canvas.height / 2);
}

function drawYouWin () {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText (
    'YOU WIN, CONGRATULATIONS!',
    canvas.width / 2,
    canvas.height / 2
  );
}

function bricksCollisionDetection () {
  for (var c = 0; c < gameState.brickColumnCount; c++) {
    for (var r = 0; r < gameState.brickRowCount; r++) {
      var b = gameState.bricks[c][r];
      if (b.status == 1) {
        if (
          gameState.ballX > b.x &&
          gameState.ballX < b.x + gameState.brickWidth &&
          gameState.ballY + gameState.ballRadius > b.y &&
          gameState.ballY - gameState.ballRadius < b.y + gameState.brickHeight
        ) {
          // A brick was hit
          gameState.ballDirectionY = gameState.ballDirectionY * -1;
          gameState.ballForceY = -gameState.ballForceY;
          if (r % 2 == 1 && r != 0 && r < gameState.highestBrickRowBroken) {
            gameState.ballSpeed =
              gameState.ballSpeed + gameConfig.ballSpeedMultiplier;
            applyBallForce (gameState.ballSpeed);
          }
          gameState.highestBrickRowBroken = r;
          b.status = 0;
          gameState.score++;
          if (
            gameState.score ==
            gameState.brickRowCount * gameState.brickColumnCount
          ) {
            gameState.gameRunning = false;
            drawYouWin ();
          }
        }
      }
    }
  }
}

function keyDownHandler (e) {
  if (e.key == 'ArrowRight') {
    rightPressed = true;
  } else if (e.key == 'ArrowLeft') {
    leftPressed = true;
  } else if (e.key == 's') {
    gameState.gameRunning = true;
  }
}

function keyUpHandler (e) {
  if (e.key == 'ArrowRight') {
    rightPressed = false;
  } else if (e.key == 'ArrowLeft') {
    leftPressed = false;
  }
}

function mouseMoveHandler (e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    gameState.paddleX = relativeX - gameState.paddleWidth / 2;
  }
}

function applyBallForce (force) {
  if (gameState.ballDirectionX < 0) {
    gameState.ballForceX = -force;
  } else {
    gameState.ballForceX = force;
  }

  if (gameState.ballForceY < 0) {
    gameState.ballForceY = -force;
  } else {
    gameState.ballForceY = force;
  }
}

function moveBall () {
  // Only move the ball if the game is running
  if (!gameState.gameRunning) {
    return;
  }

  // Change the ball's location
  gameState.ballX += gameState.ballForceX;
  gameState.ballY += gameState.ballForceY;
}

function movePaddle () {
  if (
    rightPressed &&
    gameState.paddleX < canvas.width - gameState.paddleWidth
  ) {
    gameState.paddleX += 7;
  } else if (leftPressed && gameState.paddleX > 0) {
    gameState.paddleX -= 7;
  }
}

function wallCollisionCheck () {
  // Wall collision check
  // Left and right
  if (
    gameState.ballX + gameState.ballForceX >
      canvas.width - gameState.ballRadius ||
    gameState.ballX + gameState.ballForceX < gameState.ballRadius
  ) {
    gameState.ballForceX = gameState.ballForceX * -1;
  }

  // Top
  if (gameState.ballY + gameState.ballForceY < gameState.ballRadius) {
    gameState.ballForceY = gameState.ballForceY * -1;
    if (gameState.topWasHit === false) {
      gameState.topWasHit = true;
      gameState.paddleWidth = gameState.paddleWidth / 2;
    }
  }
}

function resetBoard () {
  gameState.ballX = canvas.width / 2;
  gameState.ballY = canvas.height - 30;
  applyBallForce (2);
  gameState.topWasHit = false;
  gameState.paddleWidth = gameConfig.paddleWidth;
  gameState.paddleX = (canvas.width - gameState.paddleWidth) / 2;
}

function paddleCollisionCheck () {
  if (
    gameState.ballY + gameState.ballForceY + gameState.ballRadius >
    canvas.height - gameState.paddleHeight - gameState.ballRadius
  ) {
    if (
      gameState.ballX > gameState.paddleX &&
      gameState.ballX < gameState.paddleX + gameState.paddleWidth &&
      gameState.ballY + gameState.ballForceY + gameState.ballRadius >
        canvas.height - gameState.paddleHeight
    ) {
      // Reverse ball direction
      gameState.ballForceY = gameState.ballForceY * -1;

      // speed ball up
      // gameState.ballSpeed++;

      // If paddle is bigger then screen, end game
      if (gameState.paddleWidth > canvas.width) {
        gameState.paddleWidth = canvas.width;
        gameState.gameRunning = false;
        drawGameOver ();
        return;
      }
    } else if (
      gameState.ballY + gameState.ballForceY >
      canvas.height - gameState.ballRadius
    ) {
      gameState.lives--;
      if (!gameState.lives) {
        gameState.gameRunning = false;
        drawGameOver ();
      } else {
        resetBoard ();
      }
    }
  }
}

function draw () {
  // Clear the canvas
  ctx.clearRect (0, 0, canvas.width, canvas.height);

  // draw the background
  //   ctx.fillStyle = 'black';
  //   ctx.fillRect (0, 0, canvas.width, canvas.height);

  drawBricks ();

  drawBall ();

  wallCollisionCheck ();

  moveBall ();

  paddleCollisionCheck ();

  movePaddle ();

  drawPaddle ();

  drawScore ();

  drawLives ();

  bricksCollisionDetection ();

  requestAnimationFrame (draw);
}

document.addEventListener ('keydown', keyDownHandler, false);
// document.addEventListener ('mousemove', mouseMoveHandler, false);
document.addEventListener ('keyup', keyUpHandler, false);

// Run the loop
applyBallForce (2);
canvas.focus ();
draw ();

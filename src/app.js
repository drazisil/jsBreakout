// JavaScript code goes here
var canvas = document.getElementById ('myCanvas');
var ctx = canvas.getContext ('2d');

var rightPressed = false;
var leftPressed = false;

var gameState = {
  gameRunning: false,
  paddleWidth: 75,
  paddleHeight: 20,
  score: 0,
  lives: 3,
  bricks: [],
  ballRadius: 10,
  x: canvas.width / 2,
  y: canvas.height - 30,

  dx: 2,
  dy: 2,

  brickRowCount: 6,
  brickColumnCount: 8,
  brickWidth: 75,
  brickHeight: 20,
  brickPadding: 10,
  brickOffsetTop: 30,
  brickOffsetLeft: 30,
};

(gameState.dy = gameState.dx * -1), (gameState.paddleX =
  (canvas.width - gameState.paddleWidth) / 2);

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
  ctx.arc (gameState.x, gameState.y, gameState.ballRadius, 0, Math.PI * 2);
  var ballGradient = ctx.createRadialGradient (
    gameState.x,
    gameState.y,
    gameState.ballRadius / 2,
    gameState.x,
    gameState.y,
    gameState.ballRadius
  );
  ballGradient.addColorStop (0, 'white');
  ballGradient.addColorStop (1, 'red');
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
  paddleGradient.addColorStop (0, 'red');
  paddleGradient.addColorStop (0.5, 'blue');
  paddleGradient.addColorStop (1, 'red');
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
        gradients[c][r].addColorStop (0, 'red');
        gradients[c][r].addColorStop (1, 'blue');
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
          gameState.x > b.x &&
          gameState.x < b.x + gameState.brickWidth &&
          gameState.y > b.y &&
          gameState.y < b.y + gameState.brickHeight
        ) {
          gameState.dy = -gameState.dy;
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
  if (e.keyCode == 39) {
    rightPressed = true;
  } else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler (e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  } else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

function mouseMoveHandler (e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    gameState.paddleX = relativeX - gameState.paddleWidth / 2;
  }
}

function moveBall () {
  // Change the ball's location
  gameState.x += gameState.dx;
  gameState.y += gameState.dy;
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
    gameState.x + gameState.dx > canvas.width - gameState.ballRadius ||
    gameState.x + gameState.dx < gameState.ballRadius
  ) {
    gameState.dx = gameState.dx * -1;
  }

  // Top
  if (gameState.y + gameState.dy < gameState.ballRadius) {
    gameState.dy = gameState.dy * -1;
  }
}

function resetBoard () {
  gameState.x = canvas.width / 2;
  gameState.y = canvas.height - 30;
  gameState.dx = 2;
  gameState.dy = -2;
  gameState.paddleX = (canvas.width - gameState.paddleWidth) / 2;
}

function paddleCollisionCheck () {
  if (
    gameState.y + gameState.dy + gameState.ballRadius >
    canvas.height - gameState.paddleHeight - gameState.ballRadius
  ) {
    if (
      gameState.x > gameState.paddleX &&
      gameState.x < gameState.paddleX + gameState.paddleWidth &&
      gameState.y + gameState.dy + gameState.ballRadius >
        canvas.height - gameState.paddleHeight
    ) {
      // Reverse ball direction
      gameState.dy = gameState.dy * -1;

      // Grow paddle
      //   gameState.paddleWidth = gameState.paddleWidth + 4;

      // If paddle is bigger then screen, end game
      if (gameState.paddleWidth > canvas.width) {
        gameState.paddleWidth = canvas.width;
        gameState.gameRunning = false;
        drawGameOver ();
        return;
      }
    } else if (
      gameState.y + gameState.dy >
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
  if (!gameState.gameRunning) {
    return;
  }

  // Clear the canvas
  ctx.clearRect (0, 0, canvas.width, canvas.height);

  // draw the background
  //   ctx.fillStyle = 'black';
  //   ctx.fillRect (0, 0, canvas.width, canvas.height);

  drawBricks ();

  drawBall ();

  wallCollisionCheck ();

  paddleCollisionCheck ();

  moveBall ();

  movePaddle ();

  drawPaddle ();

  drawScore ();

  drawLives ();

  bricksCollisionDetection ();

  requestAnimationFrame (draw);
}

document.addEventListener ('keydown', keyDownHandler, false);
document.addEventListener ('mousemove', mouseMoveHandler, false);
document.addEventListener ('keyup', keyUpHandler, false);

// Run the loop
gameState.gameRunning = true;
draw ();

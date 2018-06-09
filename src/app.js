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
  ballX: canvas.width / 2,
  ballY: canvas.height - 30,

  forceX: 2,
  forceY: 2,
  ballSpeed: 0.4,

  brickRowCount: 8,
  brickColumnCount: 8,
  brickWidth: 75,
  brickHeight: 20,
  brickPadding: 10,
  brickOffsetTop: 30,
  brickOffsetLeft: 30,
};

gameState.forceY = gameState.forceX * -1;
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
          gameState.ballX > b.x &&
          gameState.ballX < b.x + gameState.brickWidth &&
          gameState.ballY + gameState.ballRadius > b.y &&
          gameState.ballY - gameState.ballRadius < b.y + gameState.brickHeight
        ) {
          gameState.forceY = -gameState.forceY;
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
  gameState.ballX += gameState.forceX;
  gameState.ballY += gameState.forceY;
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
    gameState.ballX + gameState.forceX > canvas.width - gameState.ballRadius ||
    gameState.ballX + gameState.forceX < gameState.ballRadius
  ) {
    gameState.forceX = gameState.forceX * -1;
  }

  // Top
  if (gameState.ballY + gameState.forceY < gameState.ballRadius) {
    gameState.forceY = gameState.forceY * -1;
  }
}

function resetBoard () {
  gameState.ballX = canvas.width / 2;
  gameState.ballY = canvas.height - 30;
  gameState.forceX = 2;
  gameState.forceY = -2;
  gameState.paddleX = (canvas.width - gameState.paddleWidth) / 2;
}

function paddleCollisionCheck () {
  if (
    gameState.ballY + gameState.forceY + gameState.ballRadius >
    canvas.height - gameState.paddleHeight - gameState.ballRadius
  ) {
    if (
      gameState.ballX > gameState.paddleX &&
      gameState.ballX < gameState.paddleX + gameState.paddleWidth &&
      gameState.ballY + gameState.forceY + gameState.ballRadius >
        canvas.height - gameState.paddleHeight
    ) {
      // Reverse ball direction
      gameState.forceY = gameState.forceY * -1;

      // speed ball up
      gameState.ballSpeed++;
      // if (gameState.forceX > 0) {
      //   gameState.forceX = gameState.forceX + -gameState.ballSpeed;
      // } else {
      //   gameState.forceX = gameState.forceX + gameState.ballSpeed;
      // }

      // if (gameState.forceY > 0) {
      //   gameState.forceY = gameState.forceY + gameState.ballSpeed;
      // } else {
      //   gameState.forceY = gameState.forceY + -gameState.ballSpeed;
      // }

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
      gameState.ballY + gameState.forceY >
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
document.addEventListener ('mousemove', mouseMoveHandler, false);
document.addEventListener ('keyup', keyUpHandler, false);

// Run the loop
gameState.gameRunning = true;
draw ();

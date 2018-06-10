// Define a new component called todo-item
Vue.component ('mycanvas', {
  template: '<canvas id="myCanvas" width="720" height="480" />',
});

const store = new Vuex.Store ({
  state: {
    count: 0,
    gameRunning: false,
    paddleWidth: 150,
    paddleHeight: 20,
    score: 0,
    lives: 3,
    bricks: [],
    ballRadius: 10,
    ballX: 0,
    ballY: 0,

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
    config: {
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
    },
  },
  mutations: {
    increment (state) {
      state.count++;
    },
    updateBallX (state, ballX) {
      state.ballX = ballX;
    },
    updateBallY (state, ballY) {
      state.ballY = ballY;
    },
    updateBallForceX (state, ballForceX) {
      state.ballForceX = ballForceX;
    },
    updateBallForceY (state, ballForceY) {
      state.ballForceY = ballForceY;
    },
    updatePaddleX (state, paddleX) {
      state.paddleX = paddleX;
    },
  },
});

var app = new Vue ({
  el: '#app',
  data: {
    message: 'Hello Vue!',
  },
});

// JavaScript code goes here
var canvas = document.getElementById ('myCanvas');
var ctx = canvas.getContext ('2d');

var rightPressed = false;
var leftPressed = false;

// Create bricks
for (var c = 0; c < store.state.brickColumnCount; c++) {
  store.state.bricks[c] = [];
  for (var r = 0; r < store.state.brickRowCount; r++) {
    store.state.bricks[c][r] = {x: 0, y: 0, status: 1};
  }
}

function drawBall () {
  // Draw the ball
  ctx.beginPath ();
  ctx.arc (
    store.state.ballX,
    store.state.ballY,
    store.state.ballRadius,
    0,
    Math.PI * 2
  );
  var ballGradient = ctx.createRadialGradient (
    store.state.ballX,
    store.state.ballY,
    store.state.ballRadius / 2,
    store.state.ballX,
    store.state.ballY,
    store.state.ballRadius
  );
  ballGradient.addColorStop (0, store.state.config.colors.ball[0]);
  ballGradient.addColorStop (1, store.state.config.colors.ball[1]);
  ctx.fillStyle = ballGradient;

  ctx.fill ();
  ctx.closePath ();
}

function drawPaddle () {
  ctx.beginPath ();
  ctx.rect (
    store.state.paddleX,
    canvas.height - store.state.paddleHeight,
    store.state.paddleWidth,
    store.state.paddleHeight
  );
  var paddleGradient = ctx.createLinearGradient (
    store.state.paddleX,
    canvas.height - store.state.paddleHeight,
    store.state.paddleX,
    canvas.height
  );
  paddleGradient.addColorStop (0, store.state.config.colors.paddle[0]);
  paddleGradient.addColorStop (0.5, store.state.config.colors.paddle[1]);
  paddleGradient.addColorStop (1, store.state.config.colors.paddle[2]);
  ctx.fillStyle = paddleGradient;

  ctx.fill ();
  ctx.closePath ();
}

function drawBricks () {
  gradients = [];
  for (var c = 0; c < store.state.brickColumnCount; c++) {
    gradients[c] = [];
    for (var r = 0; r < store.state.brickRowCount; r++) {
      if (store.state.bricks[c][r].status == 1) {
        var brickX =
          c * (store.state.brickWidth + store.state.brickPadding) +
          store.state.brickOffsetLeft;
        var brickY =
          r * (store.state.brickHeight + store.state.brickPadding) +
          store.state.brickOffsetTop;
        store.state.bricks[c][r].x = brickX;
        store.state.bricks[c][r].y = brickY;
        ctx.beginPath ();
        ctx.rect (
          brickX,
          brickY,
          store.state.brickWidth,
          store.state.brickHeight
        );
        gradients[c][r] = ctx.createLinearGradient (
          brickX,
          brickY,
          brickX,
          brickY + store.state.brickHeight
        );
        gradients[c][r].addColorStop (
          0,
          store.state.config.colors.bricks[r][0]
        );
        gradients[c][r].addColorStop (
          1,
          store.state.config.colors.bricks[r][1]
        );
        ctx.fillStyle = gradients[c][r];

        ctx.fill ();
        ctx.closePath ();
      }
    }
  }
}

function resetBricks () {
  for (var c = 0; c < store.state.brickColumnCount; c++) {
    for (var r = 0; r < store.state.brickRowCount; r++) {
      store.state.bricks[c][r].status = 1;
    }
  }
}

function resetGame () {
  resetBricks ();
  store.state.score = 0;
  store.state.lives = 3;
  resetBoard ();
  store.state.gameRunning = true;
  draw ();
}

function drawScore () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Score: ' + store.state.score, 8, 20);
}

function drawLives () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Lives: ' + store.state.lives, canvas.width - 65, 20);
}

function drawGameOver () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Game Over!', canvas.width / 2, canvas.height / 2);
}

function drawYouWin () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText (
    'YOU WIN, CONGRATULATIONS!',
    canvas.width / 2,
    canvas.height / 2
  );
}

function bricksCollisionDetection () {
  for (var c = 0; c < store.state.brickColumnCount; c++) {
    for (var r = 0; r < store.state.brickRowCount; r++) {
      var b = store.state.bricks[c][r];
      if (b.status == 1) {
        if (
          store.state.ballX > b.x &&
          store.state.ballX < b.x + store.state.brickWidth &&
          store.state.ballY + store.state.ballRadius > b.y &&
          store.state.ballY - store.state.ballRadius <
            b.y + store.state.brickHeight
        ) {
          // A brick was hit
          store.state.ballDirectionY = store.state.ballDirectionY * -1;
          store.state.ballForceY = -store.state.ballForceY;
          if (r % 2 == 1 && r != 0 && r < store.state.highestBrickRowBroken) {
            store.state.ballSpeed =
              store.state.ballSpeed + store.state.config.ballSpeedMultiplier;
            applyBallForce (store.state.ballSpeed);
          }
          store.state.highestBrickRowBroken = r;
          b.status = 0;
          store.state.score++;
          if (
            store.state.score ==
            store.state.brickRowCount * store.state.brickColumnCount
          ) {
            store.state.gameRunning = false;
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
    store.state.gameRunning = true;
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
    store.state.paddleX = relativeX - store.state.paddleWidth / 2;
  }
}

function applyBallForce (force) {
  if (store.state.ballDirectionX < 0) {
    store.state.ballForceX = -force;
  } else {
    store.state.ballForceX = force;
  }

  if (store.state.ballForceY < 0) {
    store.state.ballForceY = -force;
  } else {
    store.state.ballForceY = force;
  }
}

function moveBall () {
  // Only move the ball if the game is running
  if (!store.state.gameRunning) {
    return;
  }

  // Change the ball's location
  store.commit ('updateBallX', store.state.ballX + store.state.ballForceX);
  store.commit ('updateBallY', store.state.ballY + store.state.ballForceY);
}

function movePaddle () {
  if (
    rightPressed &&
    store.state.paddleX < canvas.width - store.state.paddleWidth
  ) {
    store.state.paddleX += 7;
    if (!store.state.gameRunning) {
      store.state.ballX += 7;
    }
  } else if (leftPressed && store.state.paddleX > 0) {
    store.state.paddleX -= 7;
    if (!store.state.gameRunning) {
      store.state.ballX -= 7;
    }
  }
}

function wallCollisionCheck () {
  // Wall collision check
  // Left and right
  if (
    store.state.ballX + store.state.ballForceX >
      canvas.width - store.state.ballRadius ||
    store.state.ballX + store.state.ballForceX < store.state.ballRadius
  ) {
    store.state.ballForceX = store.state.ballForceX * -1;
  }

  // Top
  if (store.state.ballY + store.state.ballForceY < store.state.ballRadius) {
    store.state.ballForceY = store.state.ballForceY * -1;
    if (store.state.topWasHit === false) {
      store.state.topWasHit = true;
      store.state.paddleWidth = store.state.paddleWidth / 2;
    }
  }
}

function resetBoard () {
  store.state.ballX = canvas.width / 2;
  store.state.ballY = canvas.height - 30;
  applyBallForce (2);
  store.state.topWasHit = false;
  store.state.paddleWidth = store.state.config.paddleWidth;
  store.state.paddleX = (canvas.width - store.state.paddleWidth) / 2;
}

function paddleCollisionCheck () {
  if (
    store.state.ballY + store.state.ballForceY + store.state.ballRadius >
    canvas.height - store.state.paddleHeight - store.state.ballRadius
  ) {
    if (
      store.state.ballX > store.state.paddleX &&
      store.state.ballX < store.state.paddleX + store.state.paddleWidth &&
      store.state.ballY + store.state.ballForceY + store.state.ballRadius >
        canvas.height - store.state.paddleHeight
    ) {
      // Reverse ball direction
      store.state.ballForceY = store.state.ballForceY * -1;

      // speed ball up
      // store.state.ballSpeed++;

      // If paddle is bigger then screen, end game
      if (store.state.paddleWidth > canvas.width) {
        store.state.paddleWidth = canvas.width;
        store.state.gameRunning = false;
        drawGameOver ();
        return;
      }
    } else if (
      store.state.ballY + store.state.ballForceY >
      canvas.height - store.state.ballRadius
    ) {
      store.state.lives--;
      store.state.gameRunning = false;
      if (store.state.lives < 0) {
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
document.addEventListener ('keyup', keyUpHandler, false);

// set initial computed state

store.commit ('updateBallX', canvas.width / 2);
store.commit ('updateBallY', canvas.height - 30);
store.commit ('updateBallForceX', store.state.ballForceX * -1);
store.commit ('updatePaddleX', (canvas.width - store.state.paddleWidth) / 2);

// Run the loop
applyBallForce (2);
canvas.focus ();
draw ();

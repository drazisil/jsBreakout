// Define a new component called todo-item
Vue.component ('mycanvas', {
  template: '<canvas id="myCanvas" width="720" height="480" />',
  methods: {
    keyDownListener: function (e) {
      if (e.key == 'ArrowRight') {
        store.commit ('toggleRightPressed', true);
      } else if (e.key == 'ArrowLeft') {
        store.commit ('toggleLeftPressed', true);
      } else if (e.key == 's') {
        if (store.state.lives <= 0) {
          resetGame ();
        }
        store.commit ('toggleGameRunning', true);
      }
    },
    keyUpListener: function (e) {
      if (e.key == 'ArrowRight') {
        store.commit ('toggleRightPressed', false);
      } else if (e.key == 'ArrowLeft') {
        store.commit ('toggleLeftPressed', false);
      }
    },
  },
  created: function () {
    document.addEventListener ('keyup', this.keyUpListener);
    document.addEventListener ('keydown', this.keyDownListener);
  },
  destroyed: function () {
    document.removeEventListener ('keyup', this.keyUpListener);
    document.removeEventListener ('keydown', this.keyDownListener);
  },
});

const store = new Vuex.Store ({
  state: {
    isGameRunning: false,
    paddleWidth: 150,
    paddleHeight: 20,
    score: 0,
    lives: 3,
    bricks: [],
    ballRadius: 10,
    ballX: 0,
    ballY: 0,

    wasTopWallHit: false,
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
    isLeftPressed: false,
    isRightPressed: false,
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
    setBallX (state, ballX) {
      state.ballX = ballX;
    },
    setBallY (state, ballY) {
      state.ballY = ballY;
    },
    setBallDirectionX (state, ballDirection) {
      state.ballDirection = ballDirection;
    },
    setBallForceX (state, ballForceX) {
      state.ballForceX = ballForceX;
    },
    setBallForceY (state, ballForceY) {
      state.ballForceY = ballForceY;
    },
    setBallSpeed (state, ballSpeed) {
      state.ballSpeed = ballSpeed;
    },
    setPaddleX (state, paddleX) {
      state.paddleX = paddleX;
    },
    setPaddleWidth (state, paddleWidth) {
      state.paddleWidth = paddleWidth;
    },
    setLives (state, lives) {
      state.lives = lives;
    },
    setScore (state, score) {
      state.score = score;
    },
    toggleGameRunning (state, isGameRunning) {
      state.isGameRunning = isGameRunning;
    },
    toggleLeftPressed (state, isKeyPressed) {
      state.isLeftPressed = isKeyPressed;
    },
    toggleRightPressed (state, isKeyPressed) {
      state.isRightPressed = isKeyPressed;
    },
    toggleTopWallHit (state, wasTopWallHit) {
      state.wasTopWallHit = wasTopWallHit;
    },
    setHighestBrickBroken (state, highestBrickRowBroken) {
      state.highestBrickRowBroken = highestBrickRowBroken;
    },
    incrementScore (state) {
      state.score++;
    },
    deincrementLives (state) {
      state.lives--;
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

// Create bricks
for (var c = 0; c < store.state.brickColumnCount; c++) {
  store.state.bricks[c] = [];
  for (var r = 0; r < store.state.brickRowCount; r++) {
    store.state.bricks[c][r] = {x: 0, y: 0, status: 1};
  }
}
/**
 *Draws the ball on the canvas
 *
 */
function drawBall () {
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
/**
 * Draws the paddle on the canvar
 *
 */
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
/**
 * Draws the bricks on the canvas
 *
 */
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
/**
 * Switchs the status of all bricks to on.
 *
 */
function resetBricks () {
  for (var c = 0; c < store.state.brickColumnCount; c++) {
    for (var r = 0; r < store.state.brickRowCount; r++) {
      store.state.bricks[c][r].status = 1;
    }
  }
}
/**
 * Reset the game state to the starting state
 *
 */
function resetGame () {
  resetBricks ();
  store.commit ('setScore', 0);
  store.commit ('setLives', 3);
  resetBoard ();
  draw ();
}
/**
 * Draw the score on the canvas
 *
 */
function drawScore () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Score: ' + store.state.score, 8, 20);
}
/**
 * Draw the number of lives left on the canvas
 *
 */
function drawLives () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Lives: ' + store.state.lives, canvas.width - 65, 20);
}
/**
 * Draw the game over meesage on the canvas
 *
 */
function drawGameOver () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText ('Game Over!', canvas.width / 2, canvas.height / 2);
}
/**
 * Draw the game one message on the canvas
 *
 */
function drawYouWin () {
  ctx.font = '16px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText (
    'YOU WIN, CONGRATULATIONS!',
    canvas.width / 2,
    canvas.height / 2
  );
}
/**
 * Checks for ball collision with bricks and turns off brick if hit
 *
 */
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
          store.commit ('setBallDirectionX', store.state.ballDirectionX * -1);
          store.commit ('setBallForceY', -store.state.ballForceY);
          if (r % 2 == 1 && r != 0 && r < store.state.highestBrickRowBroken) {
            store.commit (
              'setBallSpeed',
              store.state.ballSpeed + store.state.config.ballSpeedMultiplier
            );
            applyBallForce (store.state.ballSpeed);
          }
          store.commit ('setHighestBrickBroken', r);
          b.status = 0;
          store.commit ('incrementScore');
          if (
            store.state.score ==
            store.state.brickRowCount * store.state.brickColumnCount
          ) {
            store.commit ('toggleGameRunning', false);
            drawYouWin ();
          }
        }
      }
    }
  }
}

function applyBallForce (force) {
  if (store.state.ballDirectionX < 0) {
    store.commit ('setBallForceX', -force);
  } else {
    store.commit ('setBallForceX', force);
  }

  if (store.state.ballForceY < 0) {
    store.commit ('setBallForceY', -force);
  } else {
    store.commit ('setBallForceY', force);
  }
}

function moveBall () {
  // Only move the ball if the game is running
  if (!store.state.isGameRunning) {
    return;
  }

  if (store.state.lives <= 0) {
    return;
  }

  // Change the ball's location
  store.commit ('setBallX', store.state.ballX + store.state.ballForceX);
  store.commit ('setBallY', store.state.ballY + store.state.ballForceY);
}

function movePaddle () {
  if (store.state.lives <= 0) {
    return;
  }

  if (
    store.state.isRightPressed &&
    store.state.paddleX < canvas.width - store.state.paddleWidth
  ) {
    store.commit ('setPaddleX', store.state.paddleX + 7);
    if (!store.state.isGameRunning) {
      store.commit ('setBallX', store.state.ballX + 7);
    }
  } else if (store.state.isLeftPressed && store.state.paddleX > 0) {
    store.commit ('setPaddleX', store.state.paddleX - 7);
    if (!store.state.isGameRunning) {
      store.commit ('setBallX', store.state.ballX - 7);
    }
  }
}

function checkCollisionSideWalls () {
  if (
    store.state.ballX + store.state.ballForceX >
      canvas.width - store.state.ballRadius ||
    store.state.ballX + store.state.ballForceX < store.state.ballRadius
  ) {
    store.commit ('setBallForceX', store.state.ballForceX * -1);
  }
}

function checkCollisionTopWall () {
  if (store.state.ballY + store.state.ballForceY < store.state.ballRadius) {
    store.commit ('setBallForceY', store.state.ballForceY * -1);
    if (store.state.topWasHit === false) {
      store.commit ('toggleTopWallHit', true);
      store.commit ('setPaddleWidth', store.state.paddleWidth / 2);
    }
  }
}

function wallCollisionCheck () {
  checkCollisionSideWalls ();
  checkCollisionTopWall ();
}

function resetBoard () {
  store.commit ('setBallX', canvas.width / 2);
  store.commit ('setBallY', canvas.height - 30);
  applyBallForce (2);
  store.commit ('toggleTopWallHit', false);
  store.commit ('setPaddleWidth', store.state.config.paddleWidth);
  store.commit ('setPaddleX', (canvas.width - store.state.paddleWidth) / 2);
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
      store.commit ('setBallForceY', store.state.ballForceY * -1);
    } else if (
      store.state.ballY + store.state.ballForceY >
      canvas.height - store.state.ballRadius
    ) {
      if (store.state.lives > 0) {
        store.commit ('deincrementLives');
      }
      store.commit ('toggleGameRunning', false);
      if (store.state.lives <= 0) {
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

// set initial computed state

store.commit ('setBallX', canvas.width / 2);
store.commit ('setBallY', canvas.height - 30);
store.commit ('setBallForceX', store.state.ballForceX * -1);
store.commit ('setPaddleX', (canvas.width - store.state.paddleWidth) / 2);

// Run the loop
applyBallForce (2);
canvas.focus ();
draw ();

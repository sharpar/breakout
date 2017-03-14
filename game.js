/*jslint plusplus: true*/
/*jslint devel: true */
/*jslint browser: true*/
/*global $, jQuery, alert*/

/*Variables for Canvas*/
var canvas;
var ctx;
var WIDTH;
var HEIGHT;
var intervalId = 0;



/*Variables for the ball*/
var ballr = 10; //radius
var x = 250;
var y = 170;
var dx = 2;
var dy = 4.5;

/*Variables for the paddle*/
var paddlex;
var paddleh = 15;
var paddlew;
var rightDown = false;
var leftDown = false;
var shrink = 0;

/*Variables for the bricks*/
var rowheight;
var colwidth;
var row;
var col;
var bricks;
var brickrows = 8;
var brickcols = 14;
var BRICKWIDTH;
var BRICKHEIGHT = 15;
var brickpadding;
var topPADDING = 75;

/*Variables for general game play*/
var score = 0;
var lives = 3;
var hits = 0;
var darkbluehit = 0;
var lightbluehit = 0;
var done1 = 0;
var done2 = 0;
var level = 1;
var result = null;
var speedinc = 1;

/*Colors for different objects*/
var rowcolors = ["#34608D", "#34608D", "#6FC3DF", "#6FC3DF", "#FFE64D", "#FFE64D", "#DF740C", "#DF740C"];
var color = "#E6FFFF";
var backcolor = "#0C141F";


function init() {
    "use strict";
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height - 40;
    paddlex = WIDTH / 2 - 140;
    BRICKWIDTH = (WIDTH / brickcols) - 5;
    brickpadding = (WIDTH - 14 * BRICKWIDTH) / 15;
    paddlew = 275;
}

//draw a circle on the canvas
function circle(x, y, r) {
    "use strict";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

//draw a rectangle on the canvas
function rect(x, y, w, h) {
    "use strict";
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

//clear canvas for drawing
function clear() {
    "use strict";
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    rect(0, 0, WIDTH, HEIGHT);
}

//set rightDown or leftDown if the right or left keys are down
function onKeyDown(evt) {
    "use strict";
    if (evt.keyCode === 39) {
        rightDown = true;
    } else if (evt.keyCode === 37) {
        leftDown = true;
    }
}

//unset keys when the right or left key is released
function onKeyUp(evt) {
    "use strict";
    if (evt.keyCode === 39) {
        rightDown = false;
    } else if (evt.keyCode === 37) {
        leftDown = false;
    }
}

//initialize bricks 2d array
function initbricks() {
    "use strict";
    var i, j;
    bricks = [brickrows];
    for (i = 0; i < brickrows; i++) {
        bricks[i] = [brickcols];
        for (j = 0; j < brickcols; j++) {
            bricks[i][j] = 1;
        }
    }
}

//draw the bricks 
function drawbricks() {
    "use strict";
    var i, j;
    for (i = 0; i < brickrows; i++) {
        ctx.fillStyle = rowcolors[i];
        for (j = 0; j < brickcols; j++) {
            if (bricks[i][j] === 1) {
                rect((j * (BRICKWIDTH + brickpadding)) + brickpadding, (i * (BRICKHEIGHT + brickpadding)) + brickpadding + topPADDING,
                    BRICKWIDTH, BRICKHEIGHT);
            }
        }
    }
}

//displays and updates scoreboard
function displayScoreBoard(score) {
    "use strict";
    ctx.fillStyle = "#FFE64D";
    ctx.font = "25px Times New Roman";
    ctx.clearRect(0, HEIGHT, WIDTH, 40);
    ctx.fillText('Score: ' + score, 10, canvas.height - 10);
    ctx.fillText('Lives: ' + (lives), 810, canvas.height - 10);
    ctx.fillText('Level: ' + level, 150, canvas.height - 10);
    //Display message after game over.
    if (result !== null) {
        ctx.fillStyle = "#E6FFFF";
        ctx.fillText(result, 400, canvas.height - 10);
    }
}


function draw() {
    "use strict";

    //Clear background with color
    ctx.fillStyle = backcolor;
    clear();

    //Draw Ball
    ctx.fillStyle = color;
    circle(x, y + topPADDING, ballr);

    //Move Paddle if left/right keys pressed
    if (rightDown && paddlex <= (WIDTH - paddlew)) {
        paddlex += 10;
    } else if (leftDown && paddlex >= 0) {
        paddlex -= 10;
    }

    //Draw Paddle
    ctx.fillStyle = color;
    rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

    //Draw blue line on top of scoreboard
    ctx.fillStyle = "#6FC3DF";
    rect(0, 755, WIDTH, 10);

    drawbricks();
    displayScoreBoard(score);

    //checking which row ball in contact with
    rowheight = BRICKHEIGHT + brickpadding;
    colwidth = BRICKWIDTH + brickpadding;
    row = Math.floor(y / rowheight);
    col = Math.floor(x / colwidth);

    //reverse the ball after it hits a brick, and mark the brick as broken
    if (y < (brickrows * rowheight) && row >= 0 && col >= 0 && bricks[row][col] === 1) {
        dy = -dy;
        bricks[row][col] = 0;
        hits++;

        //increase ball speed after 4 and 12 hits
        if (hits === 4 || hits === 12) {
            dy = speedinc * dy;
            dx = 1.3 * dx;
        }

        //check if made contact with with dark blue or light blue bricks
        if (row === 0 || row === 1) {
            if (darkbluehit === 0 && done1 === 0) {
                darkbluehit = 1;
            }
        }
        if (row === 2 || row === 3) {
            if (lightbluehit === 0 && done2 === 0) {
                lightbluehit = 1;
            }
        }

        //increase ball speed after contact with dark blue or light blue bricks
        if (darkbluehit === 1) {
            dy = speedinc * dy;
            dx = 1.3 * dx;
            darkbluehit = 0;
            done1 = 1;
        }
        if (lightbluehit === 1) {
            dy = speedinc * dy;
            dx = 1.3 * dx;
            lightbluehit = 0;
            done2 = 1;
        }

        //increment score according to brick color/row of bricks
        if (row === 0 || row === 1) {
            score = score + 7;
        } else if (row === 2 || row === 3) {
            score = score + 5;
        } else if (row === 4 || row === 5) {
            score = score + 3;
        } else {
            score++;
        }

        //if score 896, user has won the game
        if (score === 896) {
            result = "-- You Win! --";
        }
    }

    //reverse direction(x) if ball hits side
    if (x + dx + ballr > WIDTH || x + dx - ballr < 0) {
        dx = -dx;
    }

    //reverses direction(y) when ball hits the top
    if (y + dy - ballr + topPADDING < 0) {
        dy = -dy;
        if (shrink === 0) {
            paddlew = paddlew / 2;
            shrink = 1;
        }
    } else if (y + dy + ballr + topPADDING > HEIGHT - paddleh) {
        if (x > paddlex && x < paddlex + paddlew) {
            //move the ball differently based on where it hit the paddle
            dx = ((x - (paddlex + paddlew / 2)) / paddlew) * 10;
            dy = -dy;
            if (score === 448) {
                initbricks();
                drawbricks();
                level = 2;
                shrink = 0;
            }
        } else if (y + dy + ballr + topPADDING >= HEIGHT) {
            lives--;
            if (lives > 0) {
                x = 300;
                y = 170;
                dx = 2;
                dy = 4.5;
                darkbluehit = 0;
                lightbluehit = 0;
                done1 = 0;
                done2 = 0;
                hits = 0;
            } else {
                result = "You Lose.";
                displayScoreBoard(score);
                clearInterval(intervalId);
            }
        }
    }
    x += dx;
    y += dy;
}

//call draw every 10 milliseconds
function allofthem() {
    "use strict";
    intervalId = setInterval(draw, 10);
    //draw();
}

function drawPlay() {
    "use strict";
    ctx.fillStyle = "#FF0000";
    rect(WIDTH / 2 - 100, HEIGHT / 2, 200, 100);
}
//Play Button
function letsPlay() {
    "use strict";
    alert("works");

}

function eventWindowLoaded() {
    "use strict";
    init();
    initbricks();
    draw();
    drawPlay();
}

window.addEventListener("load", eventWindowLoaded, false);

//window.onload = init;
//window.addEventListener("load", init, false);
//window.addEventListener('DOMContentLoaded', init, false);
//console.log(HEIGHT);
//window.addEventListener("load", initbricks, false);
//window.addEventListener("load", draw, false);
////window.addEventListener("load", drawPlay, false);
//canvas.addEventListener("click", allofthem, false);
//
////window.addEventListener("load", letsPlay, false);
////canvas.addEventListener('click', function (e) {
////    "use strict";
////    //    var x = e.offsetX,
////    //        y = e.offsetY;
////
////    ctx.fillStyle = "#FF3";
////    rect(WIDTH / 2 - 100, HEIGHT / 2, 200, 100);
////    alert("Fuck yeagg");
////
////});
////allofthem();
////letsPlay();
//document.onkeydown = onKeyDown;
//document.onkeyup = onKeyUp;
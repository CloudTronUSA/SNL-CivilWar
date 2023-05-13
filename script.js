const board = document.getElementById('board');
const rollDiceBtn = document.getElementById('roll-dice');
const diceRollDisplay = document.getElementById('dice-roll-display');

const snakes = {
    12: -6,
    23: -8,
    37: -11,
    41: -9,
    49: -13,
    58: -24,
    64: -12,
    70: -7,
    88: -15,
    98: -78,
};

const ladders = {
    5: 9,
    8: 6,
    13: 5,
    24: 11,
    38: 8,
    56: 21,
    61: 8,
    71: 13,
    80: 17,
};

const descriptions = {
    snake: {
        12: 'Special Order 15 - Forty Acres and a Mule (-6)',
        23: 'You stepped on a slippery snake.',
        37: 'A snake catches you, and you slide down.',
        41: 'The snake wraps around you and pulls you down.',
        49: 'You accidentally step on a snake and slide down.',
        58: 'Death of Lincoln Abraham (-24)',
        64: 'A snake grabs your foot and pulls you down.',
        70: 'You lose your balance and slide down the snake.',
        88: 'A snake entangles you and drags you down.',
        98: 'The snake drags you down its slippery body.',
    },
    ladder: {
        5: 'You climb up a ladder to reach new heights.',
        8: 'Juneteenth celeboration. (+6)',
        13: 'You quickly climb up the ladder.',
        24: '13th Amendment established. (+11)',
        38: 'You pull yourself up the ladder.',
        56: 'You make your way up the ladder.',
        61: 'You scale the ladder to a better position.',
        71: 'You climb the ladder, getting closer to victory.',
        80: 'You scale the ladder to a better position.',
    },
};

let playerPosition = 1;
let rollCount = 0;
let playerWon = false;

for (let i = 100; i >= 1; i--) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    const cellNumber = document.createElement('span');
    cellNumber.className = 'cell-number';
    cellNumber.textContent = i;
    cell.appendChild(cellNumber);

    board.appendChild(cell);
}


const cells = document.getElementsByClassName('cell');
const descriptionElement = document.querySelector('#description');
const connectionsSvg = document.querySelector("#connections");

function createConnection(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.style.stroke = 'black';

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const arrowLength = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowX = x2 - arrowLength * Math.cos(angle);
    const arrowY = y2 - arrowLength * Math.sin(angle);
    const arrowPoints = [
        x2, y2,
        arrowX + arrowLength / 2 * Math.cos(angle + Math.PI / 2), arrowY + arrowLength / 2 * Math.sin(angle + Math.PI / 2),
        arrowX - arrowLength / 2 * Math.cos(angle + Math.PI / 2), arrowY - arrowLength / 2 * Math.sin(angle + Math.PI / 2)
    ].join(',');

    arrow.setAttribute('points', arrowPoints);
    arrow.style.fill = 'black';

    const connectionGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    connectionGroup.appendChild(line);
    connectionGroup.appendChild(arrow);

    return connectionGroup;
}

function drawConnection(start, end, color) {
    const startRow = 10 - Math.floor((start-1) / 10) - 1;
    const endRow = 10 - Math.floor((end-1) / 10) - 1;

    const startY = startRow * 10 + 5;
    const endY = endRow * 10 + 5;

    let startColumn = 10 - (start % 10);
    let endColumn = 10 - (end % 10);
    if (endColumn > 9) {
        endColumn = 0;
    }
    if (startColumn > 9) {
        startColumn = 0;
    }

    let startX;
    let endX;

    startX = startColumn * 10 + 5;
    endX = endColumn * 10 + 5;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "0.5");

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const arrowLength = 3;
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowX = endX - arrowLength * Math.cos(angle);
    const arrowY = endY - arrowLength * Math.sin(angle);
    const arrowPoints = [
        endX, endY,
        arrowX + arrowLength / 2 * Math.cos(angle + Math.PI / 2), arrowY + arrowLength / 2 * Math.sin(angle + Math.PI / 2),
        arrowX - arrowLength / 2 * Math.cos(angle + Math.PI / 2), arrowY - arrowLength / 2 * Math.sin(angle + Math.PI / 2)
    ].join(',');

    arrow.setAttribute('points', arrowPoints);
    arrow.style.fill = color;

    line.setAttribute("visibility", "hidden");
    arrow.setAttribute("visibility", "hidden");
    connectionsSvg.appendChild(line);
    connectionsSvg.appendChild(arrow);

    const startCell = cells[cells.length - start];
    startCell.addEventListener("mouseover", () => {
        line.setAttribute("visibility", "visible");
        arrow.setAttribute("visibility", "visible");
    });

    startCell.addEventListener("mouseout", () => {
        line.setAttribute("visibility", "hidden");
        arrow.setAttribute("visibility", "hidden");
    });
}

function updatePlayerPosition(oldPosition, newPosition, stepByStep = false) {
    if ((stepByStep && newPosition !== oldPosition + 1) && newPosition !== oldPosition - 1) {
        return;
    }

    const oldCell = cells[cells.length - oldPosition];
    const newCell = cells[cells.length - newPosition];

    if (oldCell) {
        oldCell.classList.remove('cell-highlighted');
        //oldCell.querySelector('.cell-number').classList.remove('cell-number-highlighted');
    }

    if (newCell) {
        newCell.classList.add('cell-highlighted');
        //newCell.querySelector('.cell-number').classList.add('cell-number-highlighted');
    }
    console.log('upp.update', oldPosition, newPosition)
}

function blinkCell(cell, color, count, duration, callback) {
    if (count > 0) {
        cell.style.backgroundColor = color;
        setTimeout(() => {
            cell.style.backgroundColor = '';
            setTimeout(() => {
                blinkCell(cell, color, count - 1, duration, callback);
            }, duration);
        }, duration);
    } else {
        callback();
    }
}

function animatePlayerMovement(oldPosition, newPosition, callback) {
    const oldCell = cells[cells.length - oldPosition];
    const newCell = cells[cells.length - newPosition];
    
    const animationDiv = document.createElement('div');
    animationDiv.className = 'cell-highlighted-animation';
    
    oldCell.appendChild(animationDiv);
    
    const rect1 = oldCell.getBoundingClientRect();
    const rect2 = newCell.getBoundingClientRect();
    
    const deltaX = rect2.x - rect1.x;
    const deltaY = rect2.y - rect1.y;
    
    animationDiv.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${deltaX}px, ${deltaY}px)` }
    ], {
        duration: 1000,
        easing: 'ease-in-out'
    });

    setTimeout(() => {
        oldCell.removeChild(animationDiv);
        callback();
    }, 1000);
}

function processSnakeOrLadder(oldPosition, newPosition) {
    rollDiceBtn.disabled = true;
    const cell = cells[cells.length - oldPosition];
    if (newPosition < oldPosition) {
        blinkCell(cell, 'red', 3, 200, () => {
            animatePlayerMovement(oldPosition, newPosition, () => {
                updatePlayerPosition(oldPosition, newPosition);
                playerPosition = newPosition;
                rollDiceBtn.disabled = false;
            });
        });
        description = descriptions.snake[oldPosition];
    } else {
        blinkCell(cell, 'green', 3, 200, () => {
            animatePlayerMovement(oldPosition, newPosition, () => {
                updatePlayerPosition(oldPosition, newPosition);
                playerPosition = newPosition;
                rollDiceBtn.disabled = false;
            });
        });
        description = descriptions.ladder[oldPosition];
    }
    descriptionElement.innerText = description;
}

function movePlayer(oldPosition, newPosition, checkSnakesAndLadders = false, callback) {
    console.log('mp.move', oldPosition, newPosition)
    if (oldPosition < newPosition) {
        console.log('mp.moveforward', oldPosition)
        updatePlayerPosition(oldPosition, oldPosition + 1, true);
        setTimeout(() => {
            movePlayer(oldPosition + 1, newPosition, checkSnakesAndLadders, callback);
        }, 250);
    } else if (oldPosition > newPosition) {
        console.log('mp.moveback',oldPosition)
        updatePlayerPosition(oldPosition, oldPosition - 1, true);
        setTimeout(() => {
            movePlayer(oldPosition - 1, newPosition, checkSnakesAndLadders, callback);
        }, 250);
    } else {
        updatePlayerPosition(oldPosition, newPosition);

        if (checkSnakesAndLadders) {
            if (snakes.hasOwnProperty(newPosition)) {
                const targetPosition = newPosition + snakes[newPosition];
                processSnakeOrLadder(newPosition, targetPosition);
            } else if (ladders.hasOwnProperty(newPosition)) {
                const targetPosition = newPosition + ladders[newPosition];
                processSnakeOrLadder(newPosition, targetPosition);
            } else {
                rollDiceBtn.disabled = false;
            }
        } else {
            rollDiceBtn.disabled = false;
        }

        // Call the callback function only when the player has reached the final position
        if(oldPosition === newPosition && callback && typeof callback === 'function') {
            callback();
        }
    }
}

function moveBackPlayer(oldPosition, newPosition, checkForLadder, callback = () => {}) {
    movePlayer(oldPosition, 100, false, () => {
        // Delay the start of the move back to allow for the previous animation to finish.
        setTimeout(() => {
            console.log('mbp.mb: begin to move back', 100, newPosition)
            movePlayer(100, newPosition, checkForLadder, callback);
        }, 250);
    });
}

function animateDiceRoll(callback) {
    let counter = 0;
    const maxCount = 6 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6);

    function updateDisplay() {
        counter += 1;
        const number = counter % 6 + 1;
        const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        diceRollDisplay.textContent = diceFaces[number - 1];

        if (counter < maxCount) {
            setTimeout(updateDisplay, 100);
        } else {
            callback(number);
        }
    }

    updateDisplay();
}

function updateBestScore(score) {
    const bestScoreElement = document.getElementById('best-score');
    let bestScore = localStorage.getItem('bestScore');
  
    if (!bestScore || score < bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }

    bestScoreElement.textContent = `Best Score: Won in ${bestScore} Rolls`;
}

rollDiceBtn.addEventListener('click', () => {
    rollDiceBtn.innerText = 'Roll Dice';
    if (!playerWon) {
        rollDiceBtn.disabled = true;
        animateDiceRoll((roll) => {
            const oldPosition = playerPosition;
            playerPosition += roll;
            rollCount += 1;
            console.log('main.player_roll', roll)

            if (playerPosition == 100){
                movePlayer(oldPosition, playerPosition, true, () => {
                    descriptionElement.innerText = "Congrats! You made it with " + rollCount + " rolls!";
                    rollDiceBtn.innerText = 'Play Again';
                    playerWon = true;
                    updateBestScore(rollCount)
                });
            } else if (playerPosition > 100){
                playerPosition = 100 - (playerPosition-100)
                console.log('mbp.called', oldPosition,playerPosition)
                moveBackPlayer(oldPosition, playerPosition, true, true);
            } else {
                movePlayer(oldPosition, playerPosition, true);
                console.log(`main: player position: ${playerPosition}`);
            }
        });
    } else {
        playerPosition = 1;
        rollCount = 0;
        playerWon = false;
        updatePlayerPosition(100, playerPosition);
        descriptionElement.innerText = 'Ladders can take you up and Snake will take you down. Click "Roll Dice" to begin. Good Luck!';
    }
});

// Add snakes and ladders to the board
for (const [start, end] of Object.entries(snakes)) {
    const cell = cells[cells.length - start];
    const symbol = document.createElement('span');

    symbol.className = 'snake';
    cell.textContent = '🐍\r\n[To '+ (parseInt(start)+end)+']';

    cell.setAttribute('style', 'white-space: pre;')
    cell.appendChild(symbol);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    description = descriptions.snake[start];
    tooltip.textContent = description;
    document.body.appendChild(tooltip);

    cell.addEventListener('mouseover', (event) => {
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px';
        tooltip.style.display = 'block';
    });

    cell.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    console.log("cline.snake", parseInt(start), (parseInt(start)+end))
    drawConnection(parseInt(start), (parseInt(start)+end), "red");
}

for (const [start, end] of Object.entries(ladders)) {
    const cell = cells[cells.length - start];
    const symbol = document.createElement('span');

    symbol.className = 'ladder';
    cell.textContent = '🪜\r\n[To '+ (parseInt(start)+end)+']';

    cell.setAttribute('style', 'white-space: pre;')
    cell.appendChild(symbol);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    description = descriptions.ladder[start];
    tooltip.textContent = description;
    document.body.appendChild(tooltip);

    cell.addEventListener('mouseover', (event) => {
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px';
        tooltip.style.display = 'block';
    });

    cell.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    console.log("cline.ladder", parseInt(start), (parseInt(start)+end))
    drawConnection(parseInt(start), (parseInt(start)+end), "green");
}

// Initialize player position
setTimeout(() => {
    updatePlayerPosition(0, playerPosition);
}, 100);

function preload() {
  // ground image
  groundImg = loadImage('img/mario/ground.png')
  // player images
  playerImg = [loadImage('img/mario/1_walk.png'), loadImage('img/mario/2_walk.png'),
              loadImage('img/mario/3_jump.png')]
  // enemy images
  enemyImg = [loadImage('img/mario/goomba.png'), loadImage('img/mario/pipe.png')]
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  
  playerHeight = 100
  // initialize global variables which are changed during the game
  newGame()
  
  playerWidthRatios = [205/293, 207/277, 237/321]
  
  xOffset = [0, 0, 0]
  yOffset = [0, playerHeight/20, playerHeight/10]
  
  playerX = 75
  
  firstJumpFrame = 0
  jumpLength = 40 // measured in frames
  jumpHeight = 7
  // used for calculating jump trajectory
  k = -4*jumpHeight / (jumpLength^2)
  
  enemyWidth = 100
  // ratio of enemy height to width, correlates with enemyImg
  enemyHeightSelect = [enemyWidth, 2*enemyWidth]
  collisionTolerance = 20
  
  // restart circle
  restartRadius = 20
  restartX = width/2
  restartY = height*0.25+100
  restartStartPt = [restartX  - restartRadius*0.486004894,
             restartY  - restartRadius*0.297824182]
  endPt1  = [restartX  - restartRadius*0.656829562,
             restartY  - restartRadius*0.175996951]
  endPt2  = [restartX  - restartRadius*0.396029589,
             restartY  - restartRadius*0.106115808]
  startPt = [width*0.5-90, height*0.25+25]
  // ground
  groundWidth = width
  groundHeight = groundWidth/4
  groundX = 0
  groundY = height - groundHeight
  gameEnded = 0
  
  initPoints()
}

function draw() {
  background(150, 235, 255)
  noStroke()
  
  groundX -= speed
  fill(0, 150, 0)
  // draw ground
  image(groundImg, groundX, groundY, groundWidth, groundHeight)
  // draw second ground for animation
  image(groundImg, groundX+groundWidth, groundY, groundWidth, groundHeight)
  
  textAlign(RIGHT)
  textSize(40)
  textFont("VT323")
  noStroke()
  fill(0)
  text("Score: " + score, width - 20, 50)
  text("(goal: 1000)", width - 20, 90)
  
  if (!gameEnded && (frameCount % 2 == 0)) {
    score++
  }
  
  if (groundX < -groundWidth+4) {
    groundX = 0
  }
  // jumping img
  if (jumping) {
    playerImgSelector = 2
    jumpHandler()
  } else {
    playerY = playerHeight
    // alternate player walking image every switchWalkEvery frames
    if (frameCount % (2*switchWalkEvery) <= (switchWalkEvery)) {
      // walk1 img
      playerImgSelector = 0
    } else {
      // walk2 img
      playerImgSelector = 1
    }
  }
  
  playerImgX = playerX - xOffset[playerImgSelector]
  playerImgY = height - groundHeight - playerY
  playerImgWidth = playerWidthRatios[playerImgSelector] * playerHeight
  playerImgHeight = playerHeight - yOffset[playerImgSelector]
  framesSinceStart = score + playerImgX - playerX + xOffset[playerImgSelector]
  image(playerImg[playerImgSelector], playerImgX, playerImgY,
        playerImgWidth, playerImgHeight)
  
  if (frameCount % spawnEnemyEvery === 0) {
    enemySpawnHandler()
  }
  if (framesSinceStart >= 1001) {
    wonGame()
    drawRectangles()
  }
  // check if first enemy moved out of view
  // - first checks if enemies is not empty, then checks first enemy's position
  if (enemies.length > 0 && (enemies[0][0] + enemies[0][1]) <= 0) {
    // remove first element of enemies
    enemies.shift()
  }
  
  // player position (left and right side)
  playerLeftX = playerX
  playerRightX = playerX + playerImgWidth
  
  // update enemy positions and check collision
  for (let i = 0; i < enemies.length; i++) {
    curEnemy = enemies[i]
    
    // update enemy x position
    curEnemy[0] -= speed
    
    // copy elements from current enemy array to variables
    enemyX = curEnemy[0]
    enemyWidth = curEnemy[1]
    enemyHeight = curEnemy[2]
    ind = curEnemy[3]
    
    // y value of top of enemy
    enemyY = height - groundHeight - enemyHeight
    
    // draw enemy
    image(enemyImg[ind], enemyX, enemyY, enemyWidth, enemyHeight)
    
    // enemy position (left and right side)
    // reduce enemy width when checking collisions to make it easier to dodge
    enemyLeftX = enemyX + collisionTolerance
    enemyRightX = enemyLeftX + enemyWidth - 2*collisionTolerance
    
    // enemy is completely to the left of player
    enemyIsLeftOfPlayer = (enemyLeftX <= playerLeftX) && (enemyRightX <= playerRightX) && (enemyRightX <= playerLeftX)
    // enemy is completely to the right of player
    enemyIsRightOfPlayer = (playerLeftX <= enemyLeftX) &&
                           (playerRightX <= enemyRightX) &&
                           (playerRightX <= enemyLeftX)
    
    // x collision happens when the player is not completely to the left
    //   or to the right of the enemy
    xCollision = !(enemyIsLeftOfPlayer || enemyIsRightOfPlayer)
    
    // y collision happens when bottom of player is below top of enemy
    yCollision = (playerImgY + playerHeight) >= (enemyY)
    
    if (xCollision && yCollision) {
      // pause game if a collision happens
      handleCollision()
    }
  }
  
  if (lost) {
    lostGame()
  }
} 


//
// helper functions
//

function newGame() {
  playerY = playerHeight
  jumping = false
  enemies = []
  speed = 12.5
  lost = 0
  switchWalkEvery = 7
  spawnEnemyEvery = 80
  score = 0
  gameEnded = 0
}

function jumpHandler() {
  curFrame = frameCount - firstJumpFrame
  if (!gameEnded) {
    if (curFrame == jumpLength) {
      jumping = false
    } else {
      playerY += (2*k*curFrame - k*jumpLength)
    }
  }
}

function enemySpawnHandler() {
  // enemy -> x position, width, height
  ind = floor(random(2))
  newEnemy = [width, enemyWidth, enemyHeightSelect[ind], ind]
  enemies.push(newEnemy)
}

function handleCollision() {
  endGame()
  if (playerImgSelector === 0) {
    playerImgSelector = 1
  }
  lost = 1
}

function endGame() {
  speed = 0
  switchWalkEvery = 0
  spawnEnemyEvery = 0
  gameEnded = 1
}

function keyTyped() {
  // catch jump
  if (key === ' ' && !jumping && !gameEnded) {
    firstJumpFrame = frameCount
    jumping = true
  }
  // prevent any default behavior (scroll down for space)
  return false
}

function lostGame() {
  textAlign(CENTER)
  textSize(60)
  textFont("VT323")
  noStroke()
  fill(0)
  
  text("Game Over!", width*0.5, height*0.25)
  
  textSize(45)
  text("Try again?", width*0.5, height*0.25+50)
  
  // draw restart sysmbol
  ellipse(restartX, restartY, restartRadius*2, restartRadius*2)
  stroke(255)
  noFill()
  strokeWeight(0.17*restartRadius)
  arc(restartX, restartY, restartRadius*1.13, restartRadius*1.13, -PI/2, PI*7/6)
  line(restartStartPt[0], restartStartPt[1], endPt1[0], endPt1[1])
  line(restartStartPt[0], restartStartPt[1], endPt2[0], endPt2[1])
}

function wonGame() {
  endGame()
  noStroke()
  textAlign(CENTER)
  textSize(60)
  textFont("VT323")
  noStroke()
  fill(0)
  text("You Win!", width*0.5, height*0.25)
  textSize(45)
  textAlign(LEFT)
  text("Flag:", width*0.5-190, height*0.25+50)
  text("{", width*0.5+55, height*0.25+53)
  text("}", width*0.5+238, height*0.25+53)
}

function drawRectangles() {
  noFill()
  stroke(0)
  strokeWeight(4)
  for (let i = 0; i < points.length; i += 4) {
    line(points[i], points[i+1], points[i+2], points[i+3])
  }
}

function windowResized() {
  createCanvas(windowWidth, windowHeight)
  groundHeight = 0.2*height
  groundWidth = width
  groundHeight = groundWidth/4
  groundX = 0
  groundY = height - groundHeight
  
}

function mouseClicked() {
  if (lost && dist(restartStartPt[0], restartStartPt[1], mouseX, mouseY) < restartRadius) {
    newGame()
  }
  return false
}

function initPoints() {
  points = [startPt[0], startPt[1], startPt[0]+5, startPt[1]+30, startPt[0]+10, startPt[1], startPt[0]+5, startPt[1]+30, startPt[0]+10, startPt[1], startPt[0]+15, startPt[1]+30, startPt[0]+20, startPt[1], startPt[0]+15, startPt[1]+30 , startPt[0]+35, startPt[1], startPt[0]+35, startPt[1]+30, startPt[0]+25, startPt[1], startPt[0]+35, startPt[1], startPt[0]+25, startPt[1]+15, startPt[0]+35, startPt[1]+15, startPt[0]+25, startPt[1]+30, startPt[0]+35, startPt[1]+30 , startPt[0]+40, startPt[1], startPt[0]+40, startPt[1]+30, startPt[0]+40, startPt[1], startPt[0]+50, startPt[1], startPt[0]+40, startPt[1]+30, startPt[0]+50, startPt[1]+30 , startPt[0]+65, startPt[1], startPt[0]+65, startPt[1]+30, startPt[0]+55, startPt[1], startPt[0]+65, startPt[1], startPt[0]+55, startPt[1]+15, startPt[0]+65, startPt[1]+15, startPt[0]+55, startPt[1]+30, startPt[0]+65, startPt[1]+30 , startPt[0]+70, startPt[1], startPt[0]+70, startPt[1]+30, startPt[0]+80, startPt[1], startPt[0]+80, startPt[1]+30, startPt[0]+70, startPt[1]+15, startPt[0]+80, startPt[1]+15 , startPt[0]+95, startPt[1], startPt[0]+95, startPt[1]+30, startPt[0]+95, startPt[1], startPt[0]+85, startPt[1]+15, startPt[0]+85, startPt[1]+15, startPt[0]+100, startPt[1]+15 , startPt[0]+105, startPt[1]+15, startPt[0]+115, startPt[1]+15, startPt[0]+105, startPt[1]+15, startPt[0]+105, startPt[1]+30, startPt[0]+105, startPt[1]+30, startPt[0]+115, startPt[1]+30 , startPt[0]+120, startPt[1], startPt[0]+120, startPt[1]+30, startPt[0]+130, startPt[1]+15, startPt[0]+120, startPt[1]+24, startPt[0]+130, startPt[1]+30, startPt[0]+120, startPt[1]+21 , startPt[0]+140, startPt[1], startPt[0]+140, startPt[1]+30, startPt[0]+135, startPt[1]+5, startPt[0]+145, startPt[1]+5, startPt[0]+135, startPt[1]+5, startPt[0]+135, startPt[1]+15, startPt[0]+135, startPt[1]+15, startPt[0]+145, startPt[1]+15, startPt[0]+145, startPt[1]+15, startPt[0]+145, startPt[1]+25, startPt[0]+135, startPt[1]+25, startPt[0]+145, startPt[1]+25 , startPt[0]+165, startPt[1]+15, startPt[0]+175, startPt[1]+15, startPt[0]+165, startPt[1]+15, startPt[0]+165, startPt[1]+50, startPt[0]+165, startPt[1]+30, startPt[0]+175, startPt[1]+30, startPt[0]+175, startPt[1]+15, startPt[0]+175, startPt[1]+30 , startPt[0]+180, startPt[1], startPt[0]+180, startPt[1]+30 , startPt[0]+185, startPt[1]+15, startPt[0]+195, startPt[1]+15, startPt[0]+185, startPt[1]+15, startPt[0]+185, startPt[1]+22.5, startPt[0]+185, startPt[1]+22.5, startPt[0]+195, startPt[1]+22.5, startPt[0]+195, startPt[1]+22.5, startPt[0]+195, startPt[1]+30, startPt[0]+185, startPt[1]+30, startPt[0]+195, startPt[1]+30 , startPt[0]+200, startPt[1]+30, startPt[0]+210, startPt[1]+30 , startPt[0]+215, startPt[1]+15, startPt[0]+225, startPt[1]+15, startPt[0]+215, startPt[1]+15, startPt[0]+215, startPt[1]+30, startPt[0]+225, startPt[1]+15, startPt[0]+225, startPt[1]+30 , startPt[0]+230, startPt[1], startPt[0]+240, startPt[1], startPt[0]+230, startPt[1], startPt[0]+230, startPt[1]+30, startPt[0]+230, startPt[1]+30, startPt[0]+240, startPt[1]+30, startPt[0]+240, startPt[1], startPt[0]+240, startPt[1]+30, startPt[0]+230, startPt[1]+30, startPt[0]+240, startPt[1] , startPt[0]+245, startPt[1]+30, startPt[0]+255, startPt[1]+30 , startPt[0]+260, startPt[1]+15, startPt[0]+270, startPt[1]+15, startPt[0]+260, startPt[1]+15, startPt[0]+260, startPt[1]+30, startPt[0]+260, startPt[1]+30, startPt[0]+270, startPt[1]+30, startPt[0]+270, startPt[1], startPt[0]+270, startPt[1]+30 , startPt[0]+275, startPt[1]+15, startPt[0]+295, startPt[1]+15, startPt[0]+275, startPt[1]+15, startPt[0]+275, startPt[1]+30, startPt[0]+285, startPt[1]+15, startPt[0]+285, startPt[1]+30, startPt[0]+295, startPt[1]+15, startPt[0]+295, startPt[1]+30 , startPt[0]+300, startPt[1]+15, startPt[0]+310, startPt[1]+15, startPt[0]+300, startPt[1]+15, startPt[0]+300, startPt[1]+30, startPt[0]+300, startPt[1]+30, startPt[0]+310, startPt[1]+30 , startPt[0]+325, startPt[1], startPt[0]+325, startPt[1]+30, startPt[0]+325, startPt[1], startPt[0]+315, startPt[1]+15, startPt[0]+315, startPt[1]+15, startPt[0]+330, startPt[1]+15]
}

let spriteSheet;
let skyImg, spaceImg, marsImg, blackHoleImg, platformImg;

// Audio natif HTML5
let soundMa = new Audio('ma.mp3');
let soundCj = new Audio('cj.mp3');
let soundRj = new Audio('rj.mp3');
let soundMrj = new Audio('mrj.mp3');

let currentJumpSound = 'ma'; 
let soundVolume = 0.5; 

let px = 300, py = 450;
let vy = 0;
let platforms = [];
let coins = [];
let cameraY = 0;

let totalFrames = 3;   
let currentFrame = 0;

// Système de pièces et traînées enrichi
let totalCoins = 0;
let playerTrail = []; 
let activeTrail = 'none'; 

// Cheat Mode / Developer Mode
let isDevMode = false;
let devCheatCode = "ActiveCheatForTheDevlopment";
let devInputBuffer = "";

// --- VARIABLES DU TUTORIEL AUTOMATISÉ ---
let tutPx = 300;
let tutPy = 500;
let tutVy = 0;
let tutTargetX = 300;
let tutStep = 0;
let tutPlatforms = [];
let tutCoins = [];

let unlockedTrails = {
  none: true,
  stars: false,
  fire: false,
  rainbow: false,
  lightning: false,
  bubbles: false,
  hearts: false
};

const TRAIL_PRICES = {
  stars: 15,
  fire: 30,
  rainbow: 50,
  lightning: 75,
  bubbles: 100,
  hearts: 150
};

// États : 'MENU', 'SETTINGS', 'SHOP', 'TUTORIAL', 'PLAYING', 'PAUSED', 'GAMEOVER'
let gameState = 'MENU';
let previousState = 'MENU';

let scoreM = 0;
let maxScoreM = 0;
let highScoreM = 0;
let highScoreY = null;

function preload() {
  loadImage('llama.png', img => spriteSheet = img, () => console.warn('Sprite non trouvé (llama.png)'));
  loadImage('sky.png', img => skyImg = img, () => console.warn('Sky non trouvé (sky.png)'));
  loadImage('space.jpg', img => spaceImg = img, () => console.warn('Space non trouvé (space.jpg)'));
  loadImage('mars.png', img => marsImg = img, () => console.warn('Mars non trouvé (mars.png)'));
  loadImage('black-hole.png', img => blackHoleImg = img, () => console.warn('Black hole non trouvé (black-hole.png)'));
  loadImage('nuage.png', img => platformImg = img, () => console.warn('Platform non trouvée (nuage.png)'));
}

function setup() {
  // Canva agrandi au format 600x900 (conserve la forme 2:3)
  createCanvas(600, 900);
  initGame();
  initTutorial();
}

function playSelectedJumpSound() {
  let soundToPlay;
  if (currentJumpSound === 'ma') soundToPlay = soundMa;
  else if (currentJumpSound === 'cj') soundToPlay = soundCj;
  else if (currentJumpSound === 'rj') soundToPlay = soundRj;
  else if (currentJumpSound === 'mrj') soundToPlay = soundMrj;

  if (soundToPlay) {
    soundToPlay.volume = soundVolume;
    soundToPlay.currentTime = 0;
    soundToPlay.play().catch(e => {});
  }
}

function initGame() {
  px = width / 2;
  py = height / 2;
  vy = 0;
  cameraY = 0;
  scoreM = 0;
  maxScoreM = 0;
  platforms = [];
  coins = [];
  playerTrail = [];

  platforms.push({
    x: px - 45,
    y: py + 40,
    w: 90,
    h: 14,
    breakable: false,
    superJump: false,
    broken: false
  });

  for (let i = 1; i < 18; i++) {
    addPlatform((py + 40) - i * 90);
  }
}

function initTutorial() {
  tutPx = width * 0.45;
  tutPy = height * 0.5;
  tutVy = 0;
  tutTargetX = width * 0.45;
  tutStep = 0;
  playerTrail = [];
  
  tutPlatforms = [
    { x: width * 0.4,  y: height * 0.65, w: 90, h: 14, breakable: false, superJump: false, broken: false, label: "Nuage Normal" },
    { x: width * 0.1,  y: height * 0.45, w: 90, h: 14, breakable: false, superJump: true,  broken: false, label: "Super Saut 🚀" },
    { x: width * 0.7,  y: height * 0.45, w: 90, h: 14, breakable: true,  superJump: false, broken: false, label: "Friable 💥" }
  ];
  
  tutCoins = [
    { x: width * 0.5, y: height * 0.52, collected: false }
  ];
}

function addPlatform(yPos) {
  let isBreakable = random() < 0.25;
  let platX = random(50, width - 140);

  platforms.push({
    x: platX,
    y: yPos,
    w: 90,
    h: 14,
    breakable: isBreakable,
    superJump: false,
    broken: false
  });

  if (random() < 0.12) {
    let superX = (platX > width / 2) ? random(50, width / 2 - 100) : random(width / 2 + 20, width - 140);
    platforms.push({
      x: superX,
      y: yPos + random(-20, 20),
      w: 90,
      h: 14,
      breakable: false,
      superJump: true,
      broken: false
    });
  }

  if (!isBreakable && random() < 0.4) {
    coins.push({
      x: platX + 45,
      y: yPos - 25,
      collected: false
    });
  }
}

function toggleDevMode() {
  isDevMode = !isDevMode;
  if (isDevMode) {
    totalCoins = 999999;
    console.log("🛠️ DEVELOPER MODE ACTIVATED!");
  }
}

function draw() {
  // 1. MENU PRINCIPAL
  if (gameState === 'MENU') {
    drawBackground();
    fill(0, 0, 0, 140);
    rect(0, 0, width, height);

    if (isDevMode) {
      fill(255, 71, 87, 220);
      stroke(255);
      strokeWeight(2);
      rect(15, 15, 170, 36, 8);
      textAlign(LEFT, CENTER);
      drawTextWithOutline("🛠️ DEV MODE", 25, 33, 15, "#FFFFFF", "#000000", 2);
    }

    textAlign(CENTER, CENTER);
    drawTextWithOutline("LLAMA JUMP", width / 2, height / 2 - 160, 56, "#48DBFB", "#000000", 5);
    drawTextWithOutline("Atteins le Trou Noir !", width / 2, height / 2 - 85, 24, "#FFDD59", "#000000", 3);
    
    fill(46, 213, 115, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 - 20, 260, 50, 12);
    drawTextWithOutline("▶ JOUER", width / 2, height / 2 + 5, 22, "#FFFFFF", "#000000", 3);

    fill(255, 159, 67, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 45, 260, 48, 12);
    drawTextWithOutline("📺 VOIR LE TUTO", width / 2, height / 2 + 69, 18, "#FFFFFF", "#000000", 2);

    fill(255, 255, 255, 40);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 108, 260, 48, 12);
    drawTextWithOutline("⚙️ PARAMÈTRES", width / 2, height / 2 + 132, 17, "#FFFFFF", "#000000", 2);

    fill(255, 221, 89, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 171, 260, 48, 12);
    drawTextWithOutline("🛍️ MAGASIN TRAÎNÉES", width / 2, height / 2 + 195, 17, "#000000", "#FFFFFF", 2);

    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 20, 20, 26, "#FFDD59", "#000000", 3);
    return;
  }

  // 2. PARAMÈTRES
  if (gameState === 'SETTINGS') {
    drawBackground();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("PARAMÈTRES", width / 2, 70, 36, "#FFDD59", "#000000", 4);
    drawTextWithOutline("Choix du son :", width / 2, 130, 22, "#FFFFFF", "#000000", 2);

    let btnW = 380;
    let btnX = width / 2 - btnW / 2;

    fill(currentJumpSound === 'ma' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(btnX, 170, btnW, 55, 12);
    drawTextWithOutline("Son : Mario small jump " + (currentJumpSound === 'ma' ? "✓" : ""), width / 2, 197, 18, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'cj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(btnX, 240, btnW, 55, 12);
    drawTextWithOutline("Son : Cartoon jump " + (currentJumpSound === 'cj' ? "✓" : ""), width / 2, 267, 18, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'rj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(btnX, 310, btnW, 55, 12);
    drawTextWithOutline("Son : Roblox jump " + (currentJumpSound === 'rj' ? "✓" : ""), width / 2, 337, 18, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'mrj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(btnX, 380, btnW, 55, 12);
    drawTextWithOutline("Son : MARIO Long jump " + (currentJumpSound === 'mrj' ? "✓" : ""), width / 2, 407, 18, "#FFFFFF", "#000000", 2);

    drawTextWithOutline("Volume : " + floor(soundVolume * 100) + "%", width / 2, 480, 22, "#FFFFFF", "#000000", 2);
    
    fill(100);
    noStroke();
    rect(btnX, 510, btnW, 20, 10);

    fill(72, 219, 251);
    rect(btnX, 510, btnW * soundVolume, 20, 10);

    fill(255);
    stroke(0);
    strokeWeight(2);
    ellipse(btnX + btnW * soundVolume, 520, 32, 32);

    if (mouseIsPressed && mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= 495 && mouseY <= 545) {
      soundVolume = constrain((mouseX - btnX) / btnW, 0, 1);
    }

    fill(238, 82, 83);
    noStroke();
    rect(width / 2 - 120, height - 120, 240, 55, 12);
    drawTextWithOutline("RETOUR", width / 2, height - 92, 20, "#FFFFFF", "#000000", 3);
    return;
  }

  // 3. BOUTIQUE
  if (gameState === 'SHOP') {
    drawBackground();
    fill(0, 0, 0, 190);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("BOUTIQUE TRAÎNÉES", width / 2, 45, 32, "#FFDD59", "#000000", 4);
    
    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 20, 20, 24, "#FFDD59", "#000000", 3);

    let startY = 100;
    let gap = 75;
    drawShopOption(startY, "Aucune", "none", 0);
    drawShopOption(startY + gap, "Étoiles ✨", "stars", TRAIL_PRICES.stars);
    drawShopOption(startY + gap * 2, "Feu 🔥", "fire", TRAIL_PRICES.fire);
    drawShopOption(startY + gap * 3, "Arc-en-ciel 🌈", "rainbow", TRAIL_PRICES.rainbow);
    drawShopOption(startY + gap * 4, "Éclair ⚡", "lightning", TRAIL_PRICES.lightning);
    drawShopOption(startY + gap * 5, "Bulles 🫧", "bubbles", TRAIL_PRICES.bubbles);
    drawShopOption(startY + gap * 6, "Cœurs 💕", "hearts", TRAIL_PRICES.hearts);

    fill(238, 82, 83);
    noStroke();
    rect(width / 2 - 120, height - 100, 240, 55, 12);
    drawTextWithOutline("RETOUR", width / 2, height - 72, 20, "#FFFFFF", "#000000", 3);
    return;
  }

  // 4. MODE TUTORIEL AUTOMATISÉ
  if (gameState === 'TUTORIAL') {
    drawBackground();

    if (tutStep === 0) {
      tutTargetX = width * 0.45;
      if (tutPy > height * 0.6) tutStep = 1;
    } else if (tutStep === 1) {
      tutTargetX = width * 0.15;
      if (tutPy > height * 0.4 && tutVy > 0) tutStep = 2;
    } else if (tutStep === 2) {
      tutTargetX = width * 0.75;
      if (tutPy > height * 0.4 && tutVy > 0) tutStep = 3;
    } else if (tutStep === 3) {
      tutTargetX = width * 0.45;
      if (tutPy > height * 0.6) {
        tutStep = 0;
        tutCoins[0].collected = false;
        tutPlatforms[2].broken = false;
      }
    }
    
    tutPx += (tutTargetX - tutPx) * 0.08;
    tutVy += 0.4;
    tutPy += tutVy;

    if (tutPy > height - 80) {
      tutPy = height * 0.5;
      tutVy = 0;
      tutPlatforms[2].broken = false;
    }

    for (let i = 0; i < tutPlatforms.length; i++) {
      let p = tutPlatforms[i];
      if (!p.broken && tutVy > 0 && 
          tutPx + 15 > p.x && tutPx < p.x + p.w && 
          tutPy + 50 >= p.y && tutPy + 50 <= p.y + p.h) {
        
        if (p.superJump) tutVy = -19;
        else tutVy = -11;

        playSelectedJumpSound();

        if (p.breakable) {
          p.broken = true;
        }
      }
    }

    for (let i = 0; i < tutCoins.length; i++) {
      let c = tutCoins[i];
      if (!c.collected && dist(tutPx + 25, tutPy + 25, c.x, c.y) < 30) {
        c.collected = true;
      }
    }

    playerTrail.push({ x: tutPx + 25, y: tutPy + 45, alpha: 255 });
    if (playerTrail.length > 14) playerTrail.shift();

    push();
    drawTrailEffect();

    for (let i = 0; i < tutPlatforms.length; i++) {
      let p = tutPlatforms[i];
      if (p.broken) continue;

      if (platformImg && platformImg.width > 0) {
        if (p.superJump) tint(0, 180, 255);
        else if (p.breakable) tint(255, 150, 120);
        else noTint();
        image(platformImg, p.x, p.y - 15, p.w, 45);
        noTint();
      } else {
        noStroke();
        if (p.superJump) fill(0, 180, 255);
        else fill(p.breakable ? color(255, 127, 80) : color(100, 220, 120));
        rect(p.x, p.y, p.w, p.h, 8);
      }

      textAlign(CENTER, BOTTOM);
      drawTextWithOutline(p.label, p.x + p.w / 2, p.y - 18, 14, "#FFFFFF", "#000000", 2);
    }

    for (let i = 0; i < tutCoins.length; i++) {
      let c = tutCoins[i];
      if (c.collected) continue;
      fill(255, 215, 0);
      stroke(218, 165, 32);
      strokeWeight(2);
      ellipse(c.x, c.y, 18, 18);
      fill(255);
      noStroke();
      ellipse(c.x - 3, c.y - 3, 4, 4);
    }

    if (spriteSheet && spriteSheet.width > 0 && spriteSheet.height > 0) {
      let sourceW = spriteSheet.width / 2; 
      let sourceH = spriteSheet.height / totalFrames; 
      let sy = currentFrame * sourceH;

      push();
      translate(tutPx, tutPy);
      image(spriteSheet, 0, 0, 50, 50, 0, sy, sourceW, sourceH);
      pop();

      if (frameCount % 6 === 0) {
        currentFrame = (currentFrame + 1) % totalFrames;
      }
    } else {
      fill(255);
      stroke(0);
      rect(tutPx, tutPy, 50, 50, 10);
    }
    pop();

    fill(0, 0, 0, 190);
    rect(30, 30, width - 60, 150, 16);
    stroke(255, 221, 89);
    strokeWeight(2);
    noFill();
    rect(30, 30, width - 60, 150, 16);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("DÉMONSTRATION DU JEU", width / 2, 55, 20, "#FFDD59", "#000000", 3);
    drawTextWithOutline("• Flèches ou Q / D | Touche F = Plein Écran", width / 2, 90, 16, "#FFFFFF", "#000000", 2);
    drawTextWithOutline("• Bleus = Super Saut 🚀 | Orange = Casser le nuage 💥", width / 2, 118, 15, "#48DBFB", "#000000", 2);
    drawTextWithOutline("🤖 DÉMONSTRATION SCRIPTÉE EN COURS...", width / 2, 150, 14, "#FFA502", "#000000", 2);

    fill(238, 82, 83);
    noStroke();
    rect(width / 2 - 120, height - 100, 240, 55, 12);
    drawTextWithOutline("RETOUR MENU", width / 2, height - 72, 20, "#FFFFFF", "#000000", 3);
    return;
  }

  // 5. GAMEOVER
  if (gameState === 'GAMEOVER') {
    drawBackground();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("GAME OVER", width / 2, height / 2 - 110, 52, "#FF4757", "#000000", 5);
    drawTextWithOutline("SCORE : " + maxScoreM + " M", width / 2, height / 2 - 40, 32, "#FFA502", "#000000", 4);
    drawTextWithOutline("RECORD : " + highScoreM + " M", width / 2, height / 2 + 10, 26, "#FFDD59", "#000000", 3);
    drawTextWithOutline("Appuie sur ESPACE pour rejouer", width / 2, height / 2 + 70, 20, "#FFFFFF", "#000000", 2);

    fill(255, 255, 255, 40);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 125, 260, 48, 12);
    drawTextWithOutline("⚙️ PARAMÈTRES SON", width / 2, height / 2 + 149, 17, "#FFFFFF", "#000000", 2);

    fill(255, 221, 89, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 188, 260, 48, 12);
    drawTextWithOutline("🛍️ MAGASIN TRAÎNÉES", width / 2, height / 2 + 212, 17, "#000000", "#FFFFFF", 2);

    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 20, 20, 26, "#FFDD59", "#000000", 3);
    return;
  }

  // 6. EN JEU (PLAYING)
  if (gameState === 'PLAYING') {
    let targetCameraY = max(0, height / 2 - py);
    cameraY += (targetCameraY - cameraY) * 0.1;

    scoreM = floor(max(0, (height / 2 - py) / 2));
    if (scoreM > maxScoreM) maxScoreM = scoreM;
    
    if (maxScoreM > highScoreM) {
      highScoreM = maxScoreM;
      highScoreY = py;
    }

    vy += 0.4;
    py += vy;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(81)) px -= 6.5;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) px += 6.5;

    px = constrain(px, 0, width - 50);

    playerTrail.push({ x: px + 25, y: py + 45, alpha: 255 });
    if (playerTrail.length > 14) playerTrail.shift();

    let highestY = platforms[platforms.length - 1].y;
    if (-cameraY < highestY + 600) addPlatform(highestY - 90);

    platforms = platforms.filter(p => p.y < -cameraY + height + 100 && !p.broken);
    coins = coins.filter(c => c.y < -cameraY + height + 100 && !c.collected);

    if (py > -cameraY + height + 80) gameState = 'GAMEOVER';

    for (let i = 0; i < platforms.length; i++) {
      let p = platforms[i];
      if (!p.broken && vy > 0 && 
          px + 15 > p.x && px < p.x + p.w && 
          py + 50 >= p.y && py + 50 <= p.y + p.h) {
        
        vy = p.superJump ? -19 : -11;
        playSelectedJumpSound();

        if (p.breakable) p.broken = true;
      }
    }

    for (let i = 0; i < coins.length; i++) {
      let c = coins[i];
      if (!c.collected && dist(px + 25, py + 25, c.x, c.y) < 30) {
        c.collected = true;
        totalCoins++;
      }
    }
  }

  // RENDU GRAPHIQUE
  drawBackground();

  push();
  translate(0, cameraY);

  drawTrailEffect();

  if (highScoreY !== null && highScoreM > 0) {
    stroke(255, 215, 0, 200);
    strokeWeight(3);
    for (let x = 0; x < width; x += 20) {
      line(x, highScoreY, x + 10, highScoreY);
    }
    textAlign(RIGHT, BOTTOM);
    drawTextWithOutline("MEILLEUR SCORE: " + highScoreM + " M 🏆", width - 15, highScoreY - 6, 16, "#FFDD59", "#000000", 3);
  }

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    if (p.broken) continue;

    if (platformImg && platformImg.width > 0) {
      if (p.superJump) tint(0, 180, 255);
      else if (p.breakable) tint(255, 150, 120);
      else noTint();
      
      image(platformImg, p.x, p.y - 15, p.w, 45);
      noTint();
    } else {
      noStroke();
      if (p.superJump) fill(0, 180, 255);
      else fill(p.breakable ? color(255, 127, 80) : color(100, 220, 120));
      rect(p.x, p.y, p.w, p.h, 8);
    }
  }

  for (let i = 0; i < coins.length; i++) {
    let c = coins[i];
    if (c.collected) continue;
    fill(255, 215, 0);
    stroke(218, 165, 32);
    strokeWeight(2);
    ellipse(c.x, c.y, 18, 18);
    fill(255);
    noStroke();
    ellipse(c.x - 3, c.y - 3, 4, 4);
  }

  if (spriteSheet && spriteSheet.width > 0 && spriteSheet.height > 0) {
    let sourceW = spriteSheet.width / 2; 
    let sourceH = spriteSheet.height / totalFrames; 
    let sy = currentFrame * sourceH;

    push();
    let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(81);
    
    if (movingLeft) {
      translate(px + 50, py);
      scale(-1, 1);
      image(spriteSheet, 0, 0, 50, 50, 0, sy, sourceW, sourceH);
    } else {
      translate(px, py);
      image(spriteSheet, 0, 0, 50, 50, 0, sy, sourceW, sourceH);
    }
    pop();

    if (gameState === 'PLAYING' && frameCount % 6 === 0) {
      currentFrame = (currentFrame + 1) % totalFrames;
    }
  } else {
    fill(255, 255, 255);
    stroke(0);
    strokeWeight(2);
    rect(px, py, 50, 50, 10);
    fill(0);
    ellipse(px + 15, py + 18, 6, 6);
    ellipse(px + 35, py + 18, 6, 6);
  }

  pop();

  textAlign(LEFT, TOP);
  drawTextWithOutline("ALTITUDE: " + maxScoreM + " M", 25, 25, 28, "#FFFFFF", "#000000", 4);
  drawTextWithOutline("🪙 " + totalCoins, 25, 65, 24, "#FFDD59", "#000000", 4);

  // 7. ÉCRAN DE PAUSE
  if (gameState === 'PAUSED') {
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("PAUSE", width / 2, height / 2 - 60, 52, "#FFDD59", "#000000", 5);
    
    fill(46, 213, 115, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 10, 260, 55, 12);
    drawTextWithOutline("REPRENDRE", width / 2, height / 2 + 37, 20, "#FFFFFF", "#000000", 3);

    fill(238, 82, 83, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 130, height / 2 + 80, 260, 55, 12);
    drawTextWithOutline("MENU PRINCIPAL", width / 2, height / 2 + 107, 20, "#FFFFFF", "#000000", 3);
  }
}

function drawTrailEffect() {
  if (activeTrail === 'none') return;

  for (let i = 0; i < playerTrail.length; i++) {
    let pt = playerTrail[i];
    let size = map(i, 0, playerTrail.length, 4, 18);
    let alphaVal = map(i, 0, playerTrail.length, 30, 220);

    noStroke();
    if (activeTrail === 'stars') {
      fill(255, 230, 100, alphaVal);
      ellipse(pt.x + random(-5, 5), pt.y + random(-3, 3), size, size);
    } else if (activeTrail === 'fire') {
      let r = random(200, 255);
      let g = random(50, 150);
      fill(r, g, 0, alphaVal);
      ellipse(pt.x + random(-4, 4), pt.y, size * 1.2, size * 1.2);
    } else if (activeTrail === 'rainbow') {
      colorMode(HSB, 360, 100, 100, 255);
      let hueVal = (frameCount * 6 + i * 25) % 360;
      fill(hueVal, 80, 100, alphaVal);
      ellipse(pt.x, pt.y, size * 1.1, size * 1.1);
      colorMode(RGB, 255);
    } else if (activeTrail === 'lightning') {
      fill(255, 255, 0, alphaVal);
      textSize(size * 1.2);
      text("⚡", pt.x + random(-8, 8), pt.y + random(-8, 8));
    } else if (activeTrail === 'bubbles') {
      fill(100, 200, 255, alphaVal * 0.8);
      stroke(255, alphaVal);
      strokeWeight(1);
      ellipse(pt.x + random(-4, 4), pt.y + random(-4, 4), size, size);
      noStroke();
    } else if (activeTrail === 'hearts') {
      fill(255, 105, 180, alphaVal);
      textSize(size * 1.2);
      text("💕", pt.x + random(-7, 7), pt.y + random(-7, 7));
    }
  }
}

function drawShopOption(yPos, name, key, price) {
  let isUnlocked = unlockedTrails[key];
  let isEquipped = activeTrail === key;

  if (isEquipped) fill(46, 213, 115, 150);
  else if (isUnlocked) fill(72, 219, 251, 100);
  else fill(255, 255, 255, 30);

  stroke(255);
  strokeWeight(2);
  rect(width / 2 - 220, yPos, 440, 60, 14);

  textAlign(LEFT, CENTER);
  drawTextWithOutline(name, width / 2 - 195, yPos + 30, 20, "#FFFFFF", "#000000", 2);

  textAlign(RIGHT, CENTER);
  if (isEquipped) {
    drawTextWithOutline("ÉQUIPÉ ✓", width / 2 + 195, yPos + 30, 17, "#2ED573", "#000000", 2);
  } else if (isUnlocked) {
    drawTextWithOutline("ÉQUIPER", width / 2 + 195, yPos + 30, 17, "#48DBFB", "#000000", 2);
  } else {
    drawTextWithOutline("🪙 " + price, width / 2 + 195, yPos + 30, 18, "#FFDD59", "#000000", 2);
  }
}

function drawBackground() {
  if (skyImg && skyImg.width > 0) {
    tint(255, 255);
    image(skyImg, 0, 0, width, height);
  } else background(135, 206, 235);

  let alphaSpace = map(maxScoreM, 1500, 2500, 0, 255, true);
  if (alphaSpace > 0) {
    if (spaceImg && spaceImg.width > 0) {
      tint(255, alphaSpace);
      image(spaceImg, 0, 0, width, height);
      noTint();
    } else drawSpaceBackground(alphaSpace);
  }

  let alphaMars = map(maxScoreM, 3500, 4500, 0, 255, true);
  if (alphaMars > 0) {
    if (marsImg && marsImg.width > 0) {
      tint(255, alphaMars);
      image(marsImg, 0, 0, width, height);
      noTint();
    } else drawMarsBackground(alphaMars);
  }

  let alphaBH = map(maxScoreM, 5500, 6500, 0, 255, true);
  if (alphaBH > 0) {
    if (blackHoleImg && blackHoleImg.width > 0) {
      tint(255, alphaBH);
      image(blackHoleImg, 0, 0, width, height);
      noTint();
    } else drawBlackHoleBackground(alphaBH);
  }
}

function mousePressed() {
  if (gameState === 'MENU') {
    if (mouseX > 15 && mouseX < 185 && mouseY > 15 && mouseY < 50) {
      toggleDevMode();
    }

    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 - 20 && mouseY < height / 2 + 30) {
      initGame();
      gameState = 'PLAYING';
    }
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 + 45 && mouseY < height / 2 + 93) {
      initTutorial();
      gameState = 'TUTORIAL';
    }
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 + 108 && mouseY < height / 2 + 156) {
      previousState = gameState;
      gameState = 'SETTINGS';
    }
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 + 171 && mouseY < height / 2 + 219) {
      previousState = gameState;
      gameState = 'SHOP';
    }
  } else if (gameState === 'TUTORIAL') {
    if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 && mouseY > height - 100 && mouseY < height - 45) {
      gameState = 'MENU';
    }
  } else if (gameState === 'PAUSED') {
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 + 10 && mouseY < height / 2 + 65) {
      gameState = 'PLAYING';
    }
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > height / 2 + 80 && mouseY < height / 2 + 135) {
      gameState = 'MENU';
    }
  } else if (gameState === 'GAMEOVER') {
    let btnY1 = height / 2 + 125;
    let btnY2 = height / 2 + 188;

    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > btnY1 && mouseY < btnY1 + 48) {
      previousState = gameState;
      gameState = 'SETTINGS';
    }
    if (mouseX > width / 2 - 130 && mouseX < width / 2 + 130 && mouseY > btnY2 && mouseY < btnY2 + 48) {
      previousState = gameState;
      gameState = 'SHOP';
    }
  } else if (gameState === 'SETTINGS') {
    let btnW = 380;
    let btnX = width / 2 - btnW / 2;

    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > 170 && mouseY < 225) { currentJumpSound = 'ma'; playSelectedJumpSound(); }
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > 240 && mouseY < 295) { currentJumpSound = 'cj'; playSelectedJumpSound(); }
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > 310 && mouseY < 365) { currentJumpSound = 'rj'; playSelectedJumpSound(); }
    if (mouseX > btnX && mouseX < btnX + btnW && mouseY > 380 && mouseY < 435) { currentJumpSound = 'mrj'; playSelectedJumpSound(); }
    
    if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 && mouseY > height - 120 && mouseY < height - 65) gameState = previousState;
  } else if (gameState === 'SHOP') {
    let startY = 100;
    let gap = 75;
    handleShopClick("none", startY, 0);
    handleShopClick("stars", startY + gap, TRAIL_PRICES.stars);
    handleShopClick("fire", startY + gap * 2, TRAIL_PRICES.fire);
    handleShopClick("rainbow", startY + gap * 3, TRAIL_PRICES.rainbow);
    handleShopClick("lightning", startY + gap * 4, TRAIL_PRICES.lightning);
    handleShopClick("bubbles", startY + gap * 5, TRAIL_PRICES.bubbles);
    handleShopClick("hearts", startY + gap * 6, TRAIL_PRICES.hearts);

    if (mouseX > width / 2 - 120 && mouseX < width / 2 + 120 && mouseY > height - 100 && mouseY < height - 45) gameState = previousState;
  }
}

function handleShopClick(key, yPos, price) {
  if (mouseX > width / 2 - 220 && mouseX < width / 2 + 220 && mouseY > yPos && mouseY < yPos + 60) {
    if (unlockedTrails[key]) {
      activeTrail = key;
    } else if (totalCoins >= price || isDevMode) {
      if (!isDevMode) totalCoins -= price;
      unlockedTrails[key] = true;
      activeTrail = key;
    }
  }
}

function keyTyped() {
  if (gameState === 'MENU') {
    devInputBuffer += key;
    if (!devCheatCode.startsWith(devInputBuffer)) {
      devInputBuffer = key;
    }
    if (devInputBuffer === devCheatCode) {
      toggleDevMode();
      devInputBuffer = "";
    }
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  }

  if (keyCode === 32) {
    if (gameState === 'GAMEOVER') {
      initGame();
      gameState = 'PLAYING';
    }
  }
  if (key === 'p' || key === 'P' || keyCode === 27) {
    if (gameState === 'PLAYING') {
      gameState = 'PAUSED';
    } else if (gameState === 'PAUSED') {
      gameState = 'PLAYING';
    }
  }
}

function drawSpaceBackground(alphaVal) {
  fill(10, 10, 25, alphaVal);
  rect(0, 0, width, height);
  fill(255, alphaVal);
  noStroke();
  randomSeed(42);
  for (let i = 0; i < 80; i++) rect(random(width), random(height), random(1, 4), random(1, 4));
}

function drawMarsBackground(alphaVal) {
  fill(190, 75, 45, alphaVal);
  rect(0, 0, width, height);
  fill(255, 255, 200, alphaVal * 0.4);
  noStroke();
  randomSeed(123);
  for (let i = 0; i < 45; i++) rect(random(width), random(height), 3, 3);
  fill(150, 50, 30, alphaVal * 0.5);
  ellipse(width * 0.2, height * 0.25, 100, 60);
  ellipse(width * 0.8, height * 0.6, 140, 80);
  ellipse(width * 0.5, height * 0.85, 110, 60);
}

function drawBlackHoleBackground(alphaVal) {
  fill(5, 0, 15, alphaVal);
  rect(0, 0, width, height);
  fill(138, 43, 226, alphaVal * 0.5);
  ellipse(width / 2, height / 2, 380, 380);
}

function drawTextWithOutline(txt, x, y, size, txtColor, strokeColor, strokeW) {
  textFont('Helvetica, Arial, sans-serif');
  textStyle(BOLD);
  textSize(size);
  stroke(strokeColor);
  strokeWeight(strokeW);
  fill(txtColor);
  text(txt, x, y);
}
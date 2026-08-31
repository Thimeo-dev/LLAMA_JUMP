let spriteSheet;
let skyImg, spaceImg, marsImg, blackHoleImg, platformImg;

// Audio natif HTML5
let soundMa = new Audio('ma.mp3');
let soundCj = new Audio('cj.mp3');
let soundRj = new Audio('rj.mp3');
let soundMrj = new Audio('mrj.mp3');

let currentJumpSound = 'ma'; 
let soundVolume = 0.5; 

let px = 200, py = 300;
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
let tutorialStep = 0; // Pour animer le tuto

let scoreM = 0;
let maxScoreM = 0;
let highScoreM = 0;
let highScoreY = null; // Position Y exacte du record

function preload() {
  // Chargement sécurisé avec callbacks pour éviter le blocage "Loading..."
  loadImage('llama.png', img => spriteSheet = img, () => console.warn('Sprite non trouvé (llama.png)'));
  loadImage('sky.png', img => skyImg = img, () => console.warn('Sky non trouvé (sky.png)'));
  loadImage('space.jpg', img => spaceImg = img, () => console.warn('Space non trouvé (space.jpg)'));
  loadImage('mars.png', img => marsImg = img, () => console.warn('Mars non trouvé (mars.png)'));
  loadImage('black-hole.png', img => blackHoleImg = img, () => console.warn('Black hole non trouvé (black-hole.png)'));
  loadImage('nuage.png', img => platformImg = img, () => console.warn('Platform non trouvée (nuage.png)'));
}

function setup() {
  createCanvas(400, 600);
  initGame();
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
  px = 200;
  py = 300;
  vy = 0;
  cameraY = 0;
  scoreM = 0;
  maxScoreM = 0;
  platforms = [];
  coins = [];
  playerTrail = [];

  platforms.push({
    x: px - 15,
    y: py + 40,
    w: 70,
    h: 12,
    breakable: false,
    superJump: false,
    broken: false
  });

  for (let i = 1; i < 15; i++) {
    addPlatform((py + 40) - i * 70);
  }
}

function addPlatform(yPos) {
  let isBreakable = random() < 0.25;
  let platX = random(40, 300);

  platforms.push({
    x: platX,
    y: yPos,
    w: 70,
    h: 12,
    breakable: isBreakable,
    superJump: false,
    broken: false
  });

  if (random() < 0.12) {
    let superX;
    if (platX > 180) {
      superX = random(40, 140);
    } else {
      superX = random(220, 300);
    }

    platforms.push({
      x: superX,
      y: yPos + random(-15, 15),
      w: 70,
      h: 12,
      breakable: false,
      superJump: true,
      broken: false
    });
  }

  if (!isBreakable && random() < 0.4) {
    coins.push({
      x: platX + 35,
      y: yPos - 20,
      collected: false
    });
  }
}

function toggleDevMode() {
  isDevMode = !isDevMode;
  if (isDevMode) {
    totalCoins = 999999; // Pièces illimitées en mode dev
    console.log("🛠️ DEVELOPER MODE ACTIVATED!");
  }
}

function draw() {
  // 1. MENU PRINCIPAL
  if (gameState === 'MENU') {
    drawBackground();

    fill(0, 0, 0, 140);
    rect(0, 0, width, height);

    // BADGE DEVELOPER MODE
    if (isDevMode) {
      fill(255, 71, 87, 220);
      stroke(255);
      strokeWeight(2);
      rect(12, 12, 145, 28, 8);
      textAlign(LEFT, CENTER);
      drawTextWithOutline("🛠️ DEV MODE", 22, 25, 12, "#FFFFFF", "#000000", 2);
    }

    textAlign(CENTER, CENTER);
    drawTextWithOutline("LLAMA JUMP", width / 2, height / 2 - 110, 40, "#48DBFB", "#000000", 4);
    drawTextWithOutline("Atteins le Trou Noir !", width / 2, height / 2 - 55, 18, "#FFDD59", "#000000", 3);
    
    // Bouton Jouer
    fill(46, 213, 115, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 - 15, 180, 38, 10);
    drawTextWithOutline("▶ JOUER", width / 2, height / 2 + 4, 16, "#FFFFFF", "#000000", 2);

    // Bouton Tuto Vidéo / Démo
    fill(255, 159, 67, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 30, 180, 35, 10);
    drawTextWithOutline("📺 VOIR LE TUTO", width / 2, height / 2 + 47, 14, "#FFFFFF", "#000000", 2);

    fill(255, 255, 255, 40);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 75, 180, 35, 10);
    drawTextWithOutline("⚙️ PARAMÈTRES SON", width / 2, height / 2 + 92, 13, "#FFFFFF", "#000000", 2);

    fill(255, 221, 89, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 120, 180, 35, 10);
    drawTextWithOutline("🛍️ MAGASIN TRAÎNÉES", width / 2, height / 2 + 137, 13, "#000000", "#FFFFFF", 1);

    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 15, 15, 20, "#FFDD59", "#000000", 3);
    return;
  }

  // 2. PARAMÈTRES
  if (gameState === 'SETTINGS') {
    drawBackground();

    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("PARAMÈTRES SON", width / 2, 50, 26, "#FFDD59", "#000000", 3);
    drawTextWithOutline("Choix du son :", width / 2, 90, 16, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'ma' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(60, 115, 280, 40, 10);
    drawTextWithOutline("Son : Mario small jump " + (currentJumpSound === 'ma' ? "✓" : ""), width / 2, 135, 15, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'cj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(60, 165, 280, 40, 10);
    drawTextWithOutline("Son : Cartoon jump " + (currentJumpSound === 'cj' ? "✓" : ""), width / 2, 185, 15, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'rj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(60, 215, 280, 40, 10);
    drawTextWithOutline("Son : Roblox jump " + (currentJumpSound === 'rj' ? "✓" : ""), width / 2, 235, 15, "#FFFFFF", "#000000", 2);

    fill(currentJumpSound === 'mrj' ? color(72, 219, 251, 120) : color(255, 255, 255, 30));
    stroke(255);
    strokeWeight(2);
    rect(60, 265, 280, 40, 10);
    drawTextWithOutline("Son : MARIO Long jump " + (currentJumpSound === 'mrj' ? "✓" : ""), width / 2, 285, 15, "#FFFFFF", "#000000", 2);

    drawTextWithOutline("Volume : " + floor(soundVolume * 100) + "%", width / 2, 340, 16, "#FFFFFF", "#000000", 2);
    
    fill(100);
    noStroke();
    rect(60, 365, 280, 16, 8);

    fill(72, 219, 251);
    rect(60, 365, 280 * soundVolume, 16, 8);

    fill(255);
    stroke(0);
    strokeWeight(2);
    ellipse(60 + 280 * soundVolume, 373, 26, 26);

    if (mouseIsPressed && mouseX >= 60 && mouseX <= 340 && mouseY >= 350 && mouseY <= 390) {
      soundVolume = constrain((mouseX - 60) / 280, 0, 1);
    }

    fill(238, 82, 83);
    noStroke();
    rect(110, 490, 180, 45, 10);
    drawTextWithOutline("RETOUR", width / 2, 512, 16, "#FFFFFF", "#000000", 2);
    return;
  }

  // 3. BOUTIQUE
  if (gameState === 'SHOP') {
    drawBackground();

    fill(0, 0, 0, 190);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("BOUTIQUE TRAÎNÉES", width / 2, 30, 22, "#FFDD59", "#000000", 3);
    
    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 15, 15, 18, "#FFDD59", "#000000", 2);

    let startY = 60;
    let gap = 52;
    drawShopOption(startY, "Aucune", "none", 0);
    drawShopOption(startY + gap, "Étoiles ✨", "stars", TRAIL_PRICES.stars);
    drawShopOption(startY + gap * 2, "Feu 🔥", "fire", TRAIL_PRICES.fire);
    drawShopOption(startY + gap * 3, "Arc-en-ciel 🌈", "rainbow", TRAIL_PRICES.rainbow);
    drawShopOption(startY + gap * 4, "Éclair ⚡", "lightning", TRAIL_PRICES.lightning);
    drawShopOption(startY + gap * 5, "Bulles 🫧", "bubbles", TRAIL_PRICES.bubbles);
    drawShopOption(startY + gap * 6, "Cœurs 💕", "hearts", TRAIL_PRICES.hearts);

    fill(238, 82, 83);
    noStroke();
    rect(110, 545, 180, 40, 10);
    drawTextWithOutline("RETOUR", width / 2, 565, 15, "#FFFFFF", "#000000", 2);
    return;
  }

  // 4. MODE TUTORIEL (ANIMATION AUTOMATIQUE)
  if (gameState === 'TUTORIAL') {
    drawBackground();

    tutorialStep += 0.03;
    px = 200 + sin(tutorialStep * 2) * 80;
    py = 300 + cos(tutorialStep) * 60;
    cameraY = 0;

    playerTrail.push({ x: px + 20, y: py + 35, alpha: 255 });
    if (playerTrail.length > 12) playerTrail.shift();

    push();
    translate(0, cameraY);
    drawTrailEffect();

    fill(100, 220, 120);
    noStroke();
    rect(165, 340, 70, 12, 6);

    if (spriteSheet && spriteSheet.width > 0 && spriteSheet.height > 0) {
      let sourceW = spriteSheet.width / 2; 
      let sourceH = spriteSheet.height / totalFrames; 
      image(spriteSheet, px, py, 40, 40, 0, (frameCount % 3) * sourceH, sourceW, sourceH);
    } else {
      fill(255, 200, 200);
      rect(px, py, 40, 40, 8);
    }
    pop();

    fill(0, 0, 0, 190);
    rect(20, 30, width - 40, 90, 12);
    stroke(255, 221, 89);
    strokeWeight(2);
    noFill();
    rect(20, 30, width - 40, 90, 12);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("TUTORIEL INTERACTIF", width / 2, 50, 16, "#FFDD59", "#000000", 2);
    drawTextWithOutline("Utilise les flèches ou A/D pour bouger.", width / 2, 75, 13, "#FFFFFF", "#000000", 1);
    drawTextWithOutline("Rebondis sur les nuages pour monter !", width / 2, 95, 13, "#FFFFFF", "#000000", 1);

    fill(238, 82, 83);
    noStroke();
    rect(width / 2 - 90, 520, 180, 40, 10);
    drawTextWithOutline("RETOUR MENU", width / 2, 540, 15, "#FFFFFF", "#000000", 2);
    return;
  }

  // 5. GAMEOVER
  if (gameState === 'GAMEOVER') {
    drawBackground();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("GAME OVER", width / 2, height / 2 - 70, 36, "#FF4757", "#000000", 4);
    drawTextWithOutline("SCORE : " + maxScoreM + " M", width / 2, height / 2 - 25, 22, "#FFA502", "#000000", 3);
    drawTextWithOutline("RECORD : " + highScoreM + " M", width / 2, height / 2 + 5, 18, "#FFDD59", "#000000", 3);
    drawTextWithOutline("Appuie sur ESPACE pour rejouer", width / 2, height / 2 + 45, 15, "#FFFFFF", "#000000", 2);

    fill(255, 255, 255, 40);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 85, 180, 35, 10);
    drawTextWithOutline("⚙️ PARAMÈTRES SON", width / 2, height / 2 + 102, 13, "#FFFFFF", "#000000", 2);

    fill(255, 221, 89, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 130, 180, 35, 10);
    drawTextWithOutline("🛍️ MAGASIN TRAÎNÉES", width / 2, height / 2 + 147, 13, "#000000", "#FFFFFF", 1);

    textAlign(RIGHT, TOP);
    drawTextWithOutline("🪙 " + totalCoins, width - 15, 15, 20, "#FFDD59", "#000000", 3);
    return;
  }

  // Si le jeu tourne (PLAYING)
  if (gameState === 'PLAYING') {
    let targetCameraY = max(0, 300 - py);
    cameraY += (targetCameraY - cameraY) * 0.1;

    scoreM = floor(max(0, (300 - py) / 2));
    if (scoreM > maxScoreM) {
      maxScoreM = scoreM;
    }
    
    if (maxScoreM > highScoreM) {
      highScoreM = maxScoreM;
      highScoreY = py;
    }

    vy += 0.4;
    py += vy;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(81)) px -= 5;
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) px += 5;

    px = constrain(px, 0, width - 40);

    playerTrail.push({ x: px + 20, y: py + 35, alpha: 255 });
    if (playerTrail.length > 12) playerTrail.shift();

    let highestY = platforms[platforms.length - 1].y;
    if (-cameraY < highestY + 400) addPlatform(highestY - 70);

    platforms = platforms.filter(p => p.y < -cameraY + height + 100 && !p.broken);
    coins = coins.filter(c => c.y < -cameraY + height + 100 && !c.collected);

    if (py > -cameraY + height + 50) gameState = 'GAMEOVER';

    // Collision Plateformes
    for (let i = 0; i < platforms.length; i++) {
      let p = platforms[i];
      if (!p.broken && vy > 0 && 
          px + 10 > p.x && px < p.x + p.w && 
          py + 40 >= p.y && py + 40 <= p.y + p.h) {
        
        if (p.superJump) {
          vy = -18;
        } else {
          vy = -10;
        }
        
        playSelectedJumpSound();

        if (p.breakable) p.broken = true;
      }
    }

    // Collision Pièces
    for (let i = 0; i < coins.length; i++) {
      let c = coins[i];
      if (!c.collected && dist(px + 20, py + 20, c.x, c.y) < 25) {
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

  // LIGNE DE RECORD PERSONNEL
  if (highScoreY !== null && highScoreM > 0) {
    stroke(255, 215, 0, 200);
    strokeWeight(3);
    for (let x = 0; x < width; x += 15) {
      line(x, highScoreY, x + 8, highScoreY);
    }
    textAlign(RIGHT, BOTTOM);
    drawTextWithOutline("MEILLEUR SCORE: " + highScoreM + " M 🏆", width - 10, highScoreY - 4, 13, "#FFDD59", "#000000", 2);
  }

  // DESSIN DES PLATEFORMES
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    if (p.broken) continue;

    if (platformImg && platformImg.width > 0) {
      if (p.superJump) tint(0, 180, 255);
      else if (p.breakable) tint(255, 150, 120);
      else noTint();
      
      image(platformImg, p.x, p.y - 12, p.w, 35);
      noTint();
    } else {
      noStroke();
      if (p.superJump) fill(0, 180, 255);
      else fill(p.breakable ? color(255, 127, 80) : color(100, 220, 120));
      rect(p.x, p.y, p.w, p.h, 6);
    }
  }

  // Dessin Pièces
  for (let i = 0; i < coins.length; i++) {
    let c = coins[i];
    if (c.collected) continue;
    fill(255, 215, 0);
    stroke(218, 165, 32);
    strokeWeight(2);
    ellipse(c.x, c.y, 14, 14);
    fill(255);
    noStroke();
    ellipse(c.x - 2, c.y - 2, 3, 3);
  }

  // Dessin Lama
  if (spriteSheet && spriteSheet.width > 0 && spriteSheet.height > 0) {
    let sourceW = spriteSheet.width / 2; 
    let sourceH = spriteSheet.height / totalFrames; 
    let sy = currentFrame * sourceH;

    push();
    let movingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(81);
    
    if (movingLeft) {
      translate(px + 40, py);
      scale(-1, 1);
      image(spriteSheet, 0, 0, 40, 40, 0, sy, sourceW, sourceH);
    } else {
      translate(px, py);
      image(spriteSheet, 0, 0, 40, 40, 0, sy, sourceW, sourceH);
    }
    pop();

    if (gameState === 'PLAYING' && frameCount % 6 === 0) {
      currentFrame = (currentFrame + 1) % totalFrames;
    }
  } else {
    fill(255, 255, 255);
    stroke(0);
    strokeWeight(2);
    rect(px, py, 40, 40, 8);
    fill(0);
    ellipse(px + 12, py + 15, 5, 5);
    ellipse(px + 28, py + 15, 5, 5);
  }

  pop();

  // HUD EN JEU
  textAlign(LEFT, TOP);
  drawTextWithOutline("ALTITUDE: " + maxScoreM + " M", 20, 20, 22, "#FFFFFF", "#000000", 3);
  drawTextWithOutline("🪙 " + totalCoins, 20, 50, 20, "#FFDD59", "#000000", 3);

  // 6. ÉCRAN DE PAUSE
  if (gameState === 'PAUSED') {
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    drawTextWithOutline("PAUSE", width / 2, height / 2 - 40, 36, "#FFDD59", "#000000", 4);
    
    fill(46, 213, 115, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 10, 180, 40, 10);
    drawTextWithOutline("REPRENDRE", width / 2, height / 2 + 30, 15, "#FFFFFF", "#000000", 2);

    fill(238, 82, 83, 200);
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 90, height / 2 + 65, 180, 40, 10);
    drawTextWithOutline("MENU PRINCIPAL", width / 2, height / 2 + 85, 15, "#FFFFFF", "#000000", 2);
  }
}

function drawTrailEffect() {
  if (activeTrail === 'none') return;

  for (let i = 0; i < playerTrail.length; i++) {
    let pt = playerTrail[i];
    let size = map(i, 0, playerTrail.length, 3, 14);
    let alphaVal = map(i, 0, playerTrail.length, 30, 220);

    noStroke();
    if (activeTrail === 'stars') {
      fill(255, 230, 100, alphaVal);
      ellipse(pt.x + random(-4, 4), pt.y + random(-2, 2), size, size);
    } else if (activeTrail === 'fire') {
      let r = random(200, 255);
      let g = random(50, 150);
      fill(r, g, 0, alphaVal);
      ellipse(pt.x + random(-3, 3), pt.y, size * 1.2, size * 1.2);
    } else if (activeTrail === 'rainbow') {
      colorMode(HSB, 360, 100, 100, 255);
      let hueVal = (frameCount * 6 + i * 25) % 360;
      fill(hueVal, 80, 100, alphaVal);
      ellipse(pt.x, pt.y, size * 1.1, size * 1.1);
      colorMode(RGB, 255);
    } else if (activeTrail === 'lightning') {
      fill(255, 255, 0, alphaVal);
      textSize(size * 1.2);
      text("⚡", pt.x + random(-6, 6), pt.y + random(-6, 6));
    } else if (activeTrail === 'bubbles') {
      fill(100, 200, 255, alphaVal * 0.8);
      stroke(255, alphaVal);
      strokeWeight(1);
      ellipse(pt.x + random(-3, 3), pt.y + random(-3, 3), size, size);
      noStroke();
    } else if (activeTrail === 'hearts') {
      fill(255, 105, 180, alphaVal);
      textSize(size * 1.2);
      text("💕", pt.x + random(-5, 5), pt.y + random(-5, 5));
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
  rect(40, yPos, 320, 45, 10);

  textAlign(LEFT, CENTER);
  drawTextWithOutline(name, 55, yPos + 22, 14, "#FFFFFF", "#000000", 2);

  textAlign(RIGHT, CENTER);
  if (isEquipped) {
    drawTextWithOutline("ÉQUIPÉ ✓", 340, yPos + 22, 12, "#2ED573", "#000000", 2);
  } else if (isUnlocked) {
    drawTextWithOutline("ÉQUIPER", 340, yPos + 22, 12, "#48DBFB", "#000000", 2);
  } else {
    drawTextWithOutline("🪙 " + price, 340, yPos + 22, 13, "#FFDD59", "#000000", 2);
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
    // Clic sur le Badge Mode Dev pour l'activer/désactiver directement
    if (mouseX > 12 && mouseX < 157 && mouseY > 12 && mouseY < 40) {
      toggleDevMode();
    }

    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 - 15 && mouseY < height / 2 + 23) {
      initGame();
      gameState = 'PLAYING';
    }
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 + 30 && mouseY < height / 2 + 65) {
      gameState = 'TUTORIAL';
    }
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 + 75 && mouseY < height / 2 + 110) {
      previousState = gameState;
      gameState = 'SETTINGS';
    }
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 + 120 && mouseY < height / 2 + 155) {
      previousState = gameState;
      gameState = 'SHOP';
    }
  } else if (gameState === 'TUTORIAL') {
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > 520 && mouseY < 560) {
      gameState = 'MENU';
    }
  } else if (gameState === 'PAUSED') {
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 + 10 && mouseY < height / 2 + 50) {
      gameState = 'PLAYING';
    }
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > height / 2 + 65 && mouseY < height / 2 + 105) {
      gameState = 'MENU';
    }
  } else if (gameState === 'GAMEOVER') {
    let btnY1 = height / 2 + 85;
    let btnY2 = height / 2 + 130;

    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > btnY1 && mouseY < btnY1 + 35) {
      previousState = gameState;
      gameState = 'SETTINGS';
    }
    if (mouseX > width / 2 - 90 && mouseX < width / 2 + 90 && mouseY > btnY2 && mouseY < btnY2 + 35) {
      previousState = gameState;
      gameState = 'SHOP';
    }
  } else if (gameState === 'SETTINGS') {
    if (mouseX > 60 && mouseX < 340 && mouseY > 115 && mouseY < 155) { currentJumpSound = 'ma'; playSelectedJumpSound(); }
    if (mouseX > 60 && mouseX < 340 && mouseY > 165 && mouseY < 205) { currentJumpSound = 'cj'; playSelectedJumpSound(); }
    if (mouseX > 60 && mouseX < 340 && mouseY > 215 && mouseY < 255) { currentJumpSound = 'rj'; playSelectedJumpSound(); }
    if (mouseX > 60 && mouseX < 340 && mouseY > 265 && mouseY < 305) { currentJumpSound = 'mrj'; playSelectedJumpSound(); }
    
    if (mouseX > 110 && mouseX < 290 && mouseY > 490 && mouseY < 535) gameState = previousState;
  } else if (gameState === 'SHOP') {
    let startY = 60;
    let gap = 52;
    handleShopClick("none", startY, 0);
    handleShopClick("stars", startY + gap, TRAIL_PRICES.stars);
    handleShopClick("fire", startY + gap * 2, TRAIL_PRICES.fire);
    handleShopClick("rainbow", startY + gap * 3, TRAIL_PRICES.rainbow);
    handleShopClick("lightning", startY + gap * 4, TRAIL_PRICES.lightning);
    handleShopClick("bubbles", startY + gap * 5, TRAIL_PRICES.bubbles);
    handleShopClick("hearts", startY + gap * 6, TRAIL_PRICES.hearts);

    if (mouseX > 110 && mouseX < 290 && mouseY > 545 && mouseY < 585) gameState = previousState;
  }
}

function handleShopClick(key, yPos, price) {
  if (mouseX > 40 && mouseX < 360 && mouseY > yPos && mouseY < yPos + 45) {
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
  // Capture des touches pour le Cheat Code dans le menu
  if (gameState === 'MENU') {
    devInputBuffer += key;
    
    // Si la frappe ne correspond pas au début du code cheat, on réinitialise
    if (!devCheatCode.startsWith(devInputBuffer)) {
      devInputBuffer = key; // réinitialise avec la dernière touche pressée
    }

    // Validation du Cheat Code
    if (devInputBuffer === devCheatCode) {
      toggleDevMode();
      devInputBuffer = "";
    }
  }
}

function keyPressed() {
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
  for (let i = 0; i < 50; i++) rect(random(width), random(height), random(1, 3), random(1, 3));
}

function drawMarsBackground(alphaVal) {
  fill(190, 75, 45, alphaVal);
  rect(0, 0, width, height);
  fill(255, 255, 200, alphaVal * 0.4);
  noStroke();
  randomSeed(123);
  for (let i = 0; i < 30; i++) rect(random(width), random(height), 2, 2);
  fill(150, 50, 30, alphaVal * 0.5);
  ellipse(80, 150, 60, 40);
  ellipse(320, 350, 90, 50);
  ellipse(220, 500, 70, 40);
}

function drawBlackHoleBackground(alphaVal) {
  fill(5, 0, 15, alphaVal);
  rect(0, 0, width, height);
  fill(138, 43, 226, alphaVal * 0.5);
  ellipse(width / 2, height / 2, 250, 250);
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
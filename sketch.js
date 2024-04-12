// WCCChallenge topci "Eclipse"
//
// I enjoyed making this "Giant in the Forest" concept this week
// Although it seems not very successful since the giant is not very clear
//
// Here are some better generated results from my IG:
// (the first one is a video)
// https://www.instagram.com/p/C5pyXFgvc79/

let globalFogNoise;
let GLOBAL_NOW_FOG_Z = 0;
let GLOBAL_FOG_Z_ADD_AMOUNT = 10;

let BRUSH_CENTER_X = 0;
let BRUSH_CENTER_Y = 0;
let BRUSH_STROKE_LENGTH = 1;
let BRUSH_STROKE_NOISE_STRENGTH = 0.1;

let BRUSH_STROKE_NOISE = null;

let BRUSH_DENSITY = 0.1;

let GIANT_HAIR_LENGTH = 300;

let FOG_COLOR_A;
let FOG_COLOR_B;
let GIANT_COLOR;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  flex();
  colorMode(HSB);
  pixelDensity(1);

  background(240, 30, 10);

  GIANT_HAIR_LENGTH = random(200, 300);

  globalFogNoise = new NoiseSystem({
    xScale: 0.006,
    yScale: 0.006,
    zScale: 0.01
  });

  FOG_COLOR_A = new NYColor(260, 20, 3);
  FOG_COLOR_B = new NYColor(240, 30, 90);
  GIANT_COLOR = new NYColor(0, 0, 0);
  await fillBG(FOG_COLOR_A, FOG_COLOR_B, {
    densityX: 0.2,
    densityY: 0.4,
  });

  let moonX = random(0.8, 0.9) * width;
  let moonY = random(0.15, 0.24) * height;
  let moonSize = 0.1 * min(width, height);

  BRUSH_STROKE_NOISE = new NoiseSystem();
  BRUSH_CENTER_X = moonX;
  BRUSH_CENTER_Y = moonY;
  BRUSH_STROKE_LENGTH = 1;

  blendMode(BLEND);

  // GIANT
  initHairWind();

  await drawGiant(random(0.2, 0.5) * width);

  await fillBG(FOG_COLOR_A, FOG_COLOR_B, {
    densityX: 0.2,
    densityY: 0.4,
    applyFog: true
  });

  // MOON
  await drawMoonLayer(moonX, moonY, moonSize, FOG_COLOR_A, FOG_COLOR_B);

  // TREES
  let treeLayers = 1;

  let treeHeightNoise = new NoiseSystem({ xScale: 0.1, zScale: 100 });

  for (let l = 0; l < treeLayers; l++) {
    let layerT = l / (treeLayers - 1);
    layerT = 1.0;
    let treeCount = int(random(20, 40));

    GLOBAL_NOW_FOG_Z += GLOBAL_FOG_Z_ADD_AMOUNT;

    let nowBri = lerp(0, 30, layerT);

    let offsetX = random(-200, 200);
    let nowBodyColor = FOG_COLOR_A.copy();
    nowBodyColor.a = layerT + 0.1;
    let nowContourColor = new NYColor(FOG_COLOR_B.h, FOG_COLOR_B.s, FOG_COLOR_B.b, 1.0);

    let nowGroundThickness = lerp(200, 30, layerT);
    // stroke(nowBodyColor.h, nowBodyColor.s, nowBodyColor.b, nowBodyColor.a);
    // await drawGround({
    //   strokeDensity: 0.8,
    //   brushDensity: 0.3,
    //   brushRadius: 10,
    //   thickness: nowGroundThickness,
    //   noiseThickness: 200,
    //   noiseScale: 0.001,
    //   noiseSeed: random(0, 1000)
    // });

    for (let i = 0; i < treeCount; i++) {
      let treeStartX = lerp(-200, width + 200, i / treeCount) + offsetX;
      let treeStartY = height;

      let treeHeightRatio = treeHeightNoise.getNoise(treeStartX, treeStartY, layerT) * 0.8 + random(0.2, 0.6);
      let nowTreeHeight = height * treeHeightRatio;

      await drawTree(treeStartX, treeStartY, nowTreeHeight, 0, {
        bodyColor: nowBodyColor,
        lightContourColor: nowContourColor
      });
    }
  }
}

async function drawGiant(_x) {

  // head
  let headX = _x;
  let headY = height * random(-0.03, 0.2);
  let headSize = 200;
  let headDir = random(160, 220);
  let headThickness = headSize * random(0.6, 1.2);
  // await drawBodyPart(headX, headY, headDir, headSize, headThickness);

  // neck
  let neckStartX = headX + sin(radians(headDir)) * headSize * 0.9;
  let neckStartY = headY - cos(radians(headDir)) * headSize * 0.9;
  neckStartX += sin(radians(headDir + 90)) * headThickness * 0.2;
  neckStartY -= cos(radians(headDir + 90)) * headThickness * 0.2;

  let neckLength = random(0.4, 0.6) * headSize;
  let neckDir = headDir + random(10, 30);
  let neckThickness = headThickness * random(0.3, 0.6);
  // await drawBodyPart(neckStartX, neckStartY, neckDir, neckLength, neckThickness);

  // upper body
  let upperBodyStartX = neckStartX + sin(radians(neckDir)) * neckLength * 0.6;
  let upperBodyStartY = neckStartY - cos(radians(neckDir)) * neckLength * 0.6;

  let upperBodyLength = height * random(0.24, 0.36);
  let upperBodyDir = random(190, 220);
  let upperBodyThickness = upperBodyLength * random(0.8, 1.2);
  // await drawBodyPart(upperBodyStartX, upperBodyStartY, upperBodyDir, upperBodyLength, upperBodyThickness);

  // lower body
  let lowerBodyStartX = upperBodyStartX + sin(radians(upperBodyDir)) * upperBodyLength * 0.8;
  let lowerBodyStartY = upperBodyStartY - cos(radians(upperBodyDir)) * upperBodyLength * 0.8;

  let lowerBodyLength = upperBodyLength * random(0.6, 0.8);
  let lowerBodyDir = upperBodyDir + random(-20, -10);
  let lowerBodyThickness = lowerBodyLength * random(0.8, 1.2);
  // await drawBodyPart(lowerBodyStartX, lowerBodyStartY, lowerBodyDir, lowerBodyLength, lowerBodyThickness);

  // left arm
  let leftArmStartX = upperBodyStartX + sin(radians(upperBodyDir)) * upperBodyThickness * 0.3;
  let leftArmStartY = upperBodyStartY - cos(radians(upperBodyDir)) * upperBodyThickness * 0.3;
  leftArmStartX += sin(radians(upperBodyDir + 90)) * upperBodyThickness * 0.3;
  leftArmStartY -= cos(radians(upperBodyDir + 90)) * upperBodyThickness * 0.3;

  let leftArmLength = upperBodyLength * random(0.8, 1.2);
  let leftArmDir = random(160, 260);
  let leftArmThickness = leftArmLength * random(0.1, 0.2);
  // await drawBodyPart(leftArmStartX, leftArmStartY, leftArmDir, leftArmLength, leftArmThickness);

  // leftForeArm
  let leftForeArmStartX = leftArmStartX + sin(radians(leftArmDir)) * leftArmLength * 0.9;
  let leftForeArmStartY = leftArmStartY - cos(radians(leftArmDir)) * leftArmLength * 0.9;

  let leftForeArmLength = leftArmLength * random(1.0, 1.4);
  let leftForeArmDir = leftArmDir + random(-20, -10);
  let leftForeArmThickness = leftForeArmLength * random(0.1, 0.2);
  // await drawBodyPart(leftForeArmStartX, leftForeArmStartY, leftForeArmDir, leftForeArmLength, leftForeArmThickness);

  // right arm
  let rightArmStartX = upperBodyStartX + sin(radians(upperBodyDir)) * upperBodyThickness * 0.3;
  let rightArmStartY = upperBodyStartY - cos(radians(upperBodyDir)) * upperBodyThickness * 0.3;
  rightArmStartX += sin(radians(upperBodyDir - 90)) * upperBodyThickness * 0.1;
  rightArmStartY -= cos(radians(upperBodyDir - 90)) * upperBodyThickness * 0.1;

  let rightArmLength = leftArmLength;
  let rightArmDir = random(160, 240);
  let rightArmThickness = leftArmThickness;
  // await drawBodyPart(rightArmStartX, rightArmStartY, rightArmDir, rightArmLength, rightArmThickness);

  // rightForeArm
  let rightForeArmStartX = rightArmStartX + sin(radians(rightArmDir)) * rightArmLength * 0.9;
  let rightForeArmStartY = rightArmStartY - cos(radians(rightArmDir)) * rightArmLength * 0.9;

  let rightForeArmLength = leftForeArmLength;
  let rightForeArmDir = rightArmDir + random(-20, -10);
  let rightForeArmThickness = leftForeArmThickness;
  // await drawBodyPart(rightForeArmStartX, rightForeArmStartY, rightForeArmDir, rightForeArmLength, rightForeArmThickness);

  // draw right arm first
  stroke(GIANT_COLOR.color());
  await drawBodyPart(rightArmStartX, rightArmStartY, rightArmDir, rightArmLength, rightArmThickness);
  await drawBodyPart(rightForeArmStartX, rightForeArmStartY, rightForeArmDir, rightForeArmLength, rightForeArmThickness);

  // draw fog layer
  GLOBAL_NOW_FOG_Z += GLOBAL_FOG_Z_ADD_AMOUNT;
  await fillBG(FOG_COLOR_A, FOG_COLOR_B, {
    densityX: 0.2,
    densityY: 0.4,
    applyFog: true
  });

  // draw body
  stroke(GIANT_COLOR.color());
  await drawBodyPart(headX, headY, headDir, headSize, headThickness);
  await drawBodyPart(neckStartX, neckStartY, neckDir, neckLength, neckThickness);
  await drawBodyPart(upperBodyStartX, upperBodyStartY, upperBodyDir, upperBodyLength, upperBodyThickness);
  await drawBodyPart(lowerBodyStartX, lowerBodyStartY, lowerBodyDir, lowerBodyLength, lowerBodyThickness);

  // draw eye
  // let eyePos = 0.5
  // let eyeCenterX = headX + sin(radians(headDir)) * headSize * eyePos;
  // let eyeCenterY = headY - cos(radians(headDir)) * headSize * eyePos;

  // let eyeSizeX = headThickness * 0.02;
  // let eyeSizeY = headThickness * 0.06;

  // let eyeContourDensity = 0.6;
  // let eyeStrokes = eyeContourDensity * (eyeSizeX + eyeSizeY) * PI;

  // push();
  // translate(eyeCenterX, eyeCenterY);
  // rotate(radians(headDir));

  // for (let i = 0; i < eyeStrokes; i++) {
  //   let t = i / eyeStrokes;
  //   let nowAngle = t * 360 + headDir;

  //   let nowX = sin(radians(nowAngle)) * eyeSizeX;
  //   let nowY = - cos(radians(nowAngle)) * eyeSizeY;

  //   stroke(30, 10, 100, 1.0);
  //   strokeBrush(nowX, nowY, 3, 0.2);
  // }
  // pop();


  // fog
  GLOBAL_NOW_FOG_Z += GLOBAL_FOG_Z_ADD_AMOUNT;
  await fillBG(FOG_COLOR_A, FOG_COLOR_B, {
    densityX: 0.2,
    densityY: 0.3,
    applyFog: true
  });

  // draw left arm
  stroke(GIANT_COLOR.color());
  await drawBodyPart(leftArmStartX, leftArmStartY, leftArmDir, leftArmLength, leftArmThickness);
  await drawBodyPart(leftForeArmStartX, leftForeArmStartY, leftForeArmDir, leftForeArmLength, leftForeArmThickness);

}

async function drawBodyPart(_startX, _startY, _direction, _length, _thickness) {
  let dotDensity = BRUSH_DENSITY;

  let yCount = int(_length * dotDensity);
  for (let y = 0; y < yCount; y++) {
    let t = y / (yCount - 1);

    let nowX = _startX + sin(radians(_direction)) * _length * t;
    let nowY = _startY - cos(radians(_direction)) * _length * t;

    let thicknessT = easeOutCirc(sin(radians(t * 180)));
    let nowThickness = thicknessT * _thickness;

    let leftX = nowX + sin(radians(_direction + 90)) * nowThickness * 0.6;
    let leftY = nowY - cos(radians(_direction + 90)) * nowThickness * 0.6;

    let rightX = nowX + sin(radians(_direction - 90)) * nowThickness * 0.3;
    let rightY = nowY - cos(radians(_direction - 90)) * nowThickness * 0.3;

    // strokeBrush(nowX, nowY, 3, 0.8);
    await spawnHairLine(leftX, leftY, rightX, rightY, 3, 0.2);
  }
}

async function drawTree(_x, _y, _length, _startDir, _options = {}) {

  // let tree grow
  let o = {
    'bodyColor': new NYColor(0, 0, 0, 1.0),
    'lightContourColor': new NYColor(0, 0, 100, 0.8),

    'startAngle': _startDir,
    'fromWidth': random(6, 20),
    'toWidth': random(1, 3),
    // 'noiseZSeed': 666
  };

  optionOverride(o, _options);

  let treeNode = new TreeNode(_x, _y, _length, o);

  let counter = 0;
  while (treeNode.isFinished == false) {
    treeNode.step();
    treeNode.draw();

    if (counter++ % 100 == 0)
      await sleep(1);
  }
}

// async function drawGround(_options = {}) {
//   let o = {
//     strokeDensity: 0.1,
//     brushRadius: 10,
//     brushDensity: 0.1,

//     thickness: 30,
//     noiseThickness: 30,
//     noiseScale: 0.01,
//     noiseSeed: random(0, 1000)
//   }

//   console.log('draw ground');
//   optionOverride(o, _options);

//   let strokeCount = int(width * o.strokeDensity);
//   console.log(strokeCount);
//   for (let i = 0; i < strokeCount; i++) {
//     let t = i / (strokeCount - 1);

//     let nowX = lerp(0, width, t);

//     let nowNoiseValue = noise(nowX * o.noiseScale, o.noiseSeed);

//     let nowY = height - o.thickness - nowNoiseValue * o.noiseThickness;

//     strokeBrushLine(nowX, height, nowX, nowY, o.brushRadius, 0.1);
//     await sleep(1);
//   }

// }


async function fillBG(_fromColor, _toColor, _options = {}) {

  let o = {
    densityX: 0.3,
    densityY: 0.6,
    applyFog: false
  };

  optionOverride(o, _options);

  let bgXDensity = o.densityX;
  let bgYDensity = o.densityY;

  let applyFog = o.applyFog;

  let xCount = width * bgXDensity;
  let yCount = height * bgYDensity;

  let noiseHeight = 0.4 * height;

  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {

      push();

      let xt = x / (xCount - 1);
      let yt = y / (yCount - 1);

      let nowColorT = sin(radians(yt * 180));

      let xPos = lerp(0, width, xt);
      let yPos = lerp(-noiseHeight, height, yt);

      yPos += noise(xPos * 0.003, yPos * 0.003) * noiseHeight;

      let nowColor = NYLerpColor(_fromColor, _toColor, nowColorT);
      let nowH = nowColor.h + random(-10, 10);
      let nowS = nowColor.s + random(-10, 10);
      let nowB = nowColor.b + random(-10, 10);

      let alpha = 1.0;

      if (applyFog) {
        // fog in bg should be inverse, cuz it covers the objects
        let nowFogAlpha = lerp(1.2, -0.3, globalFogNoise.getNoise(xPos, yPos, GLOBAL_NOW_FOG_Z));
        alpha = nowFogAlpha;
      }

      stroke(nowH, nowS, nowB, alpha);
      strokeBrush(xPos, yPos, 30, 0.003);
      pop();
    }

    await sleep(1);
  }
}


// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
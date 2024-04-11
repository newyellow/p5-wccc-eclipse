let globalFogNoise;
let GLOBAL_NOW_FOG_Z = 0;

async function setup() {
  createCanvas(1200, 1600);
  colorMode(HSB);
  pixelDensity(1);

  background(240, 30, 10);

  globalFogNoise = new NoiseSystem({
    xScale: 0.01,
    yScale: 0.01,
    zScale: 0.01
  });

  let colorA = new NYColor(260, 20, 3);
  let colorB = new NYColor(240, 30, 90);
  await fillBG(colorA, colorB);
  
  await drawMoonLayer(800, 200, 100, colorA, colorB);

  blendMode(BLEND);

  let treeLayers = 4;

  let treeHeightNoise = new NoiseSystem({xScale: 0.1, zScale: 100});

  for (let l = 0; l < treeLayers; l++) {
    let layerT = l / (treeLayers - 1);
    let treeCount = 20;

    GLOBAL_NOW_FOG_Z = layerT * 1000;

    let nowBri = lerp(0, 30, layerT);

    let offsetX = random(-200, 200);
    let nowBodyColor = colorA.copy();
    nowBodyColor.a = layerT + 0.1;
    let nowContourColor = new NYColor(colorB.h, colorB.s, colorB.b, 1.0);

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

  console.log("done");
}

async function drawTree(_x, _y, _length, _startDir, _options = {}) {

  // let tree grow
  let o = {
    'bodyColor': new NYColor(0, 0, 0, 1.0),
    'lightContourColor': new NYColor(0, 0, 100, 0.5),

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

async function drawGround(_options = {}) {
  let o = {
    strokeDensity: 0.1,
    brushRadius: 10,
    brushDensity: 0.1,

    thickness: 30,
    noiseThickness: 30,
    noiseScale: 0.01,
    noiseSeed: random(0, 1000)
  }

  console.log('draw ground');
  optionOverride(o, _options);

  let strokeCount = int(width * o.strokeDensity);
  console.log(strokeCount);
  for (let i = 0; i < strokeCount; i++) {
    let t = i / (strokeCount - 1);

    let nowX = lerp(0, width, t);

    let nowNoiseValue = noise(nowX * o.noiseScale, o.noiseSeed);

    let nowY = height - o.thickness - nowNoiseValue * o.noiseThickness;

    strokeBrushLine(nowX, height, nowX, nowY, o.brushRadius, 0.1);
    await sleep(1);
  }

}


async function fillBG(_fromColor, _toColor, _centerColor, _centerRadius) {
  let bgXDensity = 0.3;
  let bgYDensity = 0.6;

  let xCount = width * bgXDensity;
  let yCount = height * bgYDensity;

  let centerX = width / 2;
  let centerY = height / 2;

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

      stroke(nowH, nowS, nowB);
      strokeBrush(xPos, yPos, 30, 0.003);
      pop();
    }

    await sleep(1);
  }
}

function strokeBrushLine(_x1, _y1, _x2, _y2, _brushSize, _density = 0.1) {
  let dotCount = dist(_x1, _y1, _x2, _y2) * _density;

  for (let i = 0; i < dotCount; i++) {
    let t = i / (dotCount - 1);

    let xPos = lerp(_x1, _x2, t);
    let yPos = lerp(_y1, _y2, t);

    strokeBrush(xPos, yPos, _brushSize, _density);
  }
}

function strokeBrush(_x, _y, _r, _density = 0.1) {
  let dotCount = _r * _r * PI * _density;

  for (let i = 0; i < dotCount; i++) {
    let dotX = randomGaussian(_x, _r);
    let dotY = randomGaussian(_y, _r);

    point(dotX, dotY);
  }
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
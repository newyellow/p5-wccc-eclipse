async function drawMoonLayer(_x, _y, _size, _colorA, _colorB) {
  let moonX = _x;
  let moonY = _y;

  let moonSize = _size;

  let eclipseOffset = random(0.1, 0.4) * moonSize;
  let eclipseAngle = random(0, 360);

  let eclipseX = moonX + sin(radians(eclipseAngle)) * eclipseOffset;
  let eclipseY = moonY + cos(radians(eclipseAngle)) * eclipseOffset;

  blendMode(ADD);
  stroke(_colorB.h, _colorB.s, _colorB.b, 0.2);
  await drawMoon(moonX, moonY, moonSize * 2);

  stroke(_colorB.h, _colorB.s, _colorB.b, 0.1);
  await drawMoon(moonX, moonY, moonSize * 1.6);

  stroke(0, 0, 100, 0.3);
  await drawMoon(moonX, moonY, moonSize * 1.2);

  stroke(0, 0, 100, 1.0);
  await drawMoonContour(moonX, moonY, moonSize, {
    brushSize: 2,
    strokeDensity: 0.2,
    brushDensity: 0.3
  });

  // eclipse
  blendMode(BLEND);
  stroke(_colorA.h, _colorA.s, _colorA.b, 0.6);
  await drawMoon(eclipseX, eclipseY, moonSize * 0.9, {
    strokeDensity: 0.2,
    brushSizeFrom: 10,
    brushSizeTo: 6,
    brushDensityFrom: 0.2,
    brushDensityTo: 0.1,
    noisePowerTo: 0.0,
  });

  await drawMoonContour(eclipseX, eclipseY, moonSize, {
    brushSize: 2,
    strokeDensity: 0.6,
    brushDensity: 0.3
  });
  noStroke();
}

async function drawMoonContour(_x, _y, _radius, _options = {}) {
  let o = {
    brushSize: 10,
    strokeDensity: 0.1,
    brushDensity: 0.1
  };

  optionOverride(o, _options);

  let strokeDensity = o.strokeDensity;
  let strokeCount = _radius * 2 * PI * strokeDensity;

  for (let s = 0; s < strokeCount; s++) {
    let circleT = s / strokeCount;
    let nowAngle = circleT * TWO_PI;

    let xPos = _x + sin(nowAngle) * _radius * 0.5;
    let yPos = _y + -cos(nowAngle) * _radius * 0.5;

    strokeBrush(xPos, yPos, o.brushSize, o.brushDensity);
  }

}

async function drawMoon(_x, _y, _radius, _options = {}) {
  let o = {
    strokeDensity: 0.1,

    brushDensityFrom: 0.1,
    brushDensityTo: 0.001,

    brushSizeFrom: 30,
    brushSizeTo: 30,

    brushAlphaFrom: 0.1,
    brushAlphaTo: 0.01,

    noisePowerFrom: 0.0,
    noisePowerTo: 1.0,

    noiseScaleFrom: 0.02,
    noiseScaleTo: 0.002,
  };

  optionOverride(o, _options);

  let strokeDensity = o.strokeDensity;

  let circularLayers = int(_radius * 0.5 * strokeDensity);

  for (let i = 0; i < circularLayers; i++) {
    let layerT = (i + 1) / circularLayers;

    let nowRadius = _radius * layerT;

    let strokeCount = nowRadius * 2 * PI * strokeDensity;

    for (let s = 0; s < strokeCount; s++) {

      let circleT = s / strokeCount;
      let nowAngle = circleT * TWO_PI;

      let xPos = _x + sin(nowAngle) * nowRadius * 0.5;
      let yPos = _y + -cos(nowAngle) * nowRadius * 0.5;

      let nowNoiseScale = lerp(o.noiseScaleFrom, o.noiseScaleTo, layerT);

      let offsetNoiseValue = noise(xPos * nowNoiseScale, yPos * nowNoiseScale, 666);
      let nowNoisePower = lerp(o.noisePowerFrom, o.noisePowerTo, layerT);

      xPos += sin(nowAngle) * offsetNoiseValue * nowNoisePower * nowRadius;
      yPos += -cos(nowAngle) * offsetNoiseValue * nowNoisePower * nowRadius;


      let nowBrushDensity = lerp(o.brushDensityFrom, o.brushDensityTo, layerT);
      let nowBrushSize = lerp(o.brushSizeFrom, o.brushSizeTo, layerT);
      let nowBrushAlpha = lerp(o.brushAlphaFrom, o.brushAlphaTo, layerT);

      noFill();
      strokeBrush(xPos, yPos, nowBrushSize, nowBrushDensity);

      if (s % 10 == 0)
        await sleep(1);
    }
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

function curveStrokeLine(_x1, _y1, _x2, _y2, _brushSize, _xCurve, _yCurve) {
  let dotCount = int(dist(_x1, _y1, _x2, _y2) * BRUSH_DENSITY * 1.4); // curve are longer

  for (let i = 0; i < dotCount; i++) {
    let t = i / (dotCount - 1);
    let xPos = lerp(_x1, _x2, _xCurve(t));
    let yPos = lerp(_y1, _y2, _yCurve(t));

    strokeBrush(xPos, yPos, _brushSize, 0.1);
  }
}

function strokeBrush(_x, _y, _r, _density = 0.1) {
  let dotCount = _r * _r * PI * _density;

  for (let i = 0; i < dotCount; i++) {
    push();

    let dotX = randomGaussian(_x, _r);
    let dotY = randomGaussian(_y, _r);

    if (BRUSH_STROKE_LENGTH > 1) {

      let angle = getAngle(dotX, dotY, BRUSH_CENTER_X, BRUSH_CENTER_Y) + 90;

      let angleNoise = BRUSH_STROKE_NOISE.getNoise(dotX, dotY);
      angle += lerp(-180, 180, angleNoise) * BRUSH_STROKE_NOISE_STRENGTH;

      let xFrom = dotX + sin(radians(angle)) * BRUSH_STROKE_LENGTH * -0.5;
      let yFrom = dotY - cos(radians(angle)) * BRUSH_STROKE_LENGTH * -0.5;

      let xTo = dotX + sin(radians(angle)) * BRUSH_STROKE_LENGTH * 0.5;
      let yTo = dotY - cos(radians(angle)) * BRUSH_STROKE_LENGTH * 0.5;

      line(xFrom, yFrom, xTo, yTo);
    }
    else {
      point(dotX, dotY);
    }
    pop();
  }
}

let windNoise;
let hairNoise;
let windPower = 0.1;
let hairNoisePower = 0.1;
let windDirection = 0;
let windAngleRange = 60;

function initHairWind () {
  windNoise = new NoiseSystem();
  hairNoise = new NoiseSystem({
    xScale: 0.01,
    yScale: 0.01
  });

  windPower = random(0.03, 0.12);
  windDirection = random(240, 330);
}

async function spawnHairLine (_x1, _y1, _x2, _y2, _hairRadius, _density)
{
  let dots = int(dist(_x1, _y1, _x2, _y2) * _density);
  for(let i=0; i<dots; i++) {
    let t = i / (dots - 1);

    let xPos = lerp(_x1, _x2, t);
    let yPos = lerp(_y1, _y2, t);

    let nowHairLength = GIANT_HAIR_LENGTH;

    // strokeBrush(xPos, yPos, 6, 0.2);
    await drawHair(xPos, yPos, nowHairLength, 6, 0.1, easeInSine);
    await sleep(1);
  }
}

async function drawHair(_x, _y, _length, _thickness, _density = 0.1, _thicknessCurve) {
  let dotCount = _length * _density;
  let stepDist = _length / dotCount;

  // let nowAngle = hairNoise.getNoise(_x, _y) * 360;
  let nowAngle = random(0, 360);
  let nowX = _x;
  let nowY = _y;

  for(let i=0; i< dotCount; i++) {
    let t = i / (dotCount - 1);

    nowX += sin(radians(nowAngle)) * stepDist;
    nowY -= cos(radians(nowAngle)) * stepDist;
    let newDirection = hairNoise.getNoise(nowX, nowY) * 360;
    // nowAngle = lerp(nowAngle, newDirection, 0.06);
    nowAngle += lerp(-30, 30, hairNoise.getNoise(nowX, nowY));

    let windAngle = windDirection + lerp(-0.5 * windAngleRange, 0.5 * windAngleRange, windNoise.getNoise(nowX, nowY));
    let thickness = lerp(_thickness, 0, t);

    nowAngle = lerp(nowAngle, windAngle, windPower);

    // let fogPower = globalFogNoise.getNoise(nowX, nowY);
    // let fogAlphaMultiplier = lerp(-0.6, 1.2, fogPower);

    // stroke(240, 30, 10, fogAlphaMultiplier);
    strokeBrush(nowX, nowY, thickness, 0.3);
  }
}
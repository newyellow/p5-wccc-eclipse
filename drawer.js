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
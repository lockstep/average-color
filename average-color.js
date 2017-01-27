var colors = [
  [ 204, 162, 140 ],
  [ 151, 86, 54 ],
  [ 223, 170, 139 ],
  [ 218, 174, 137 ],
  [ 204, 170, 161 ],
  [ 203, 137, 113 ],
  [ 145, 79, 47 ],
]

// Build the possible color tiles
$(function() {
  var $colors = $('#colors');
  $.each(colors, function(i, c) {
    var $color = $('<div>');
    $color.addClass('color');
    $color.addClass('index-' + i);
    var rgb = "rgb("+c[0]+","+c[1]+","+c[2]+")";
    $color.css('background-color', rgb);
    $colors.append($color);
  });
});

function highlightClosestColor(rgbArray) {
  var measuredLab = rgb2lab(rgbArray);
  measuredLab = { L: measuredLab[0], A: measuredLab[1], B: measuredLab[2] };
  var lowestIndex;
  var lowestDistance;
  $.each(colors, function(i, c) {
    var sampleLab = rgb2lab(c);
    sampleLab = { L: sampleLab[0], A: sampleLab[1], B: sampleLab[2] };
    // 1976 formula
    // console.log(DeltaE.getDeltaE76(measuredLab, sampleColor));
    // 1994 formula
    // console.log(DeltaE.getDeltaE94(measuredLab, sampleColor));
    // 2000 formula
    // console.log(DeltaE.getDeltaE00(measuredLab, sampleColor));
    var distance = DeltaE.getDeltaE00(measuredLab, sampleLab);
    console.log(distance);
    if (!lowestIndex || distance < lowestDistance) {
      lowestIndex = i;
      lowestDistance = distance;
    }
  });
  $('.highlighted').removeClass('highlighted')
  $('.index-' + lowestIndex).addClass('highlighted');
}

function addImage(file) {
  var element = document.createElement('div');
  element.className = 'row';
  element.innerHTML =
    '<div class="cell image">' +
    '  <img />' +
    '</div>' +
    '<div class="cell color">' +
    '  <div class="box"></div>' +
    '  <ul>' +
    '    <li class="rgb"></li>' +
    '    <li class="hex"></li>' +
    '    <li class="hsl"></li>' +
    '  </ul>' +
    '</div>';

  var img = element.querySelector('img');
  img.src = URL.createObjectURL(file);
  img.onload = function() {
    var rgb = getAverageColor(img);
    var rgbArray = [ rgb.r, rgb.g, rgb.b ];
    highlightClosestColor(rgbArray);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var rgbStr = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    var hexStr = '#' + rgb.r.toString(16) + rgb.g.toString(16) + rgb.b.toString(16);
    var hslStr = 'hsl(' + Math.round(hsl.h * 360) + ', ' + Math.round(hsl.s * 100) + '%, ' + Math.round(hsl.l * 100) + '%)';

    var box = element.querySelector('.box');
    box.style.backgroundColor = rgbStr;

    element.querySelector('.rgb').textContent = rgbStr;
    element.querySelector('.hex').textContent = hexStr;
    element.querySelector('.hsl').textContent = hslStr;
  };

  document.getElementById('images').appendChild(element);
}

function getAverageColor(img) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var width = canvas.width = img.naturalWidth;
  var height = canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0);

  var imageData = ctx.getImageData(0, 0, width, height);
  var data = imageData.data;
  var r = 0;
  var g = 0;
  var b = 0;

  for (var i = 0, l = data.length; i < l; i += 4) {
    r += data[i];
    g += data[i+1];
    b += data[i+2];
  }

  r = Math.floor(r / (data.length / 4));
  g = Math.floor(g / (data.length / 4));
  b = Math.floor(b / (data.length / 4));

  return { r: r, g: g, b: b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h, s: s, l: l };
}

document.ondragover = function(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

document.ondrop = function(event) {
  event.preventDefault();

  document.getElementById('images').innerHTML = '';

  var files = event.dataTransfer.files;
  for (var i = 0; i < files.length; i++) {
    addImage(files[i]);
  }
};

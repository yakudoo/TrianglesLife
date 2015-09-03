
function Triangle(pos, column, row, triW, triH, color, canvas){
  
  var thisTri = this;
  this.selectedForTrail = false;
  this.pos = pos;
  this.col = column;
  this.row = row;
  this.alpha = this.tAlpha = 1;
  this.color = color;
  this.rgb = hexToRgb(this.color);
  this.opened = false;
  this.opening = false;
  this.closing = false;
  this.isLeft = (this.pos % 2);
  var c = canvas;

  this.tX1 = (this.isLeft) ? (this.col + 1) * triW : this.col * triW;
  this.tX2 = (this.isLeft) ? this.col * triW : (this.col + 1) * triW;
  this.tX3 = (this.isLeft) ? (this.col + 1) * triW : this.col * triW;

  this.x1 = this.tX1;
  this.x2 = this.tX1;
  this.x3 = this.tX1;

  this.tY1 = .5 * this.row * triH;
  this.tY2 = .5 * (this.row + 1) * triH;
  this.tY3 = .5 * (this.row + 2) * triH;

  this.y1 = this.tY1;
  this.y2 = this.tY2;
  this.y3 = this.tY3;

  this.tweenClose, this.tweenOpen;
  this.draw = function() {
    c.fillStyle = 'rgba(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ',' + this.alpha + ')';
    c.beginPath();
    c.moveTo(this.x1, this.y1);
    c.lineTo(this.x2, this.y2);
    c.lineTo(this.x3, this.y3);
    c.closePath();
    c.fill();
  }

  this.open = function(direction, targetSpeed, targetAlpha, targetDelay) {
    if (!this.opened || !this.opening) {
      if (this.tweenClose) this.tweenClose.kill();
      this.opening = true;
      this.direction = direction || "top";
      this.delay = targetDelay || 0;
      this.tAlpha = targetAlpha;
      this.tSpeed = targetSpeed || 1.5;
      if (this.direction == "side") {
        this.x1 = this.x2 = this.x3 = this.tX1;
        this.y1 = this.tY1;
        this.y2 = this.tY2;
        this.y3 = this.tY3;
      } else if (this.direction == "top") {
        this.x1 = (this.tX2 + this.tX3) / 2;
        this.x2 = this.tX2;
        this.x3 = this.tX3;
        this.y1 = (this.tY2 + this.tY3) / 2;
        this.y2 = this.tY2;
        this.y3 = this.tY3;
      } else if (this.direction == "bottom") {
        this.x1 = this.tX1;
        this.x2 = this.tX2;
        this.x3 = (this.tX1 + this.tX2) / 2;
        this.y1 = this.tY1;
        this.y2 = this.tY2;
        this.y3 = (this.tY1 + this.tY2) / 2;
      }
      this.tweenOpen = TweenMax.to(this, this.tSpeed, {
        x1: this.tX1,
        x2: this.tX2,
        x3: this.tX3,
        y1: this.tY1,
        y2: this.tY2,
        y3: this.tY3,
        alpha: this.tAlpha,
        ease: Strong.easeInOut,
        delay: this.delay,
        onComplete:openComplete
      });
    }
  }

  this.close = function(direction, targetSpeed, targetDelay) {
      this.direction = direction || "top";
      this.delay = targetDelay || 1;
      this.tSpeed = targetSpeed || .8;
      this.opened = false;
      this.closing = true;
      var closeX1, closeX2, closeX3, closeY1, closeY2, closeY3;

      if (this.direction == "side") {
        closeX1 = closeX2 = closeX3 = this.tX1;
        closeY1 = this.tY1;
        closeY2 = this.tY2;
        closeY3 = this.tY3;
      } else if (this.direction == "top") {
        closeX1 = (this.tX2 + this.tX3) / 2;
        closeX2 = this.tX2;
        closeX3 = this.tX3;
        closeY1 = (this.tY2 + this.tY3) / 2;
        closeY2 = this.tY2;
        closeY3 = this.tY3;
      } else if (this.direction == "bottom") {
        closeX1 = this.tX1;
        closeX2 = this.tX2;
        closeX3 = (this.tX1 + this.tX2) / 2;
        closeY1 = this.tY1;
        closeY2 = this.tY2;
        closeY3 = (this.tY1 + this.tY2) / 2;
      }
      if (this.tweenClose) this.tweenClose.kill();
      this.tweenClose = TweenMax.to(this, this.tSpeed, {
        x1: closeX1,
        x2: closeX2,
        x3: closeX3,
        y1: closeY1,
        y2: closeY2,
        y3: closeY3,
        alpha: 0,
        ease: Strong.easeInOut,
        delay: this.delay,
        onComplete:closeComplete
      });
  }
  
  function openComplete(){
    thisTri.opened = true;
    thisTri.opening = false;
    thisTri.closing = false;
  }

  function closeComplete(){
    thisTri.opened = false;
    thisTri.opening = false;
    thisTri.closing = false;
  }
}


function TrianglesLife(canvasId, triW, triH, colorsArray){
  var instance = this;
  var interval;
  var isRunning = false;
  var paused = false;
  this.triW = triW || 11;
  this.triH = triH || 12;
  this.speedTrailAppear = .1;
  this.speedTrailDisappear = .1;
  this.speedTriOpen = 1;
  this.trailMaxLength = 12;
  this.trailIntervalCreation = 100;
  this.delayBeforeDisappear = 2;
  this.randomAlpha = true;
    
  var C = document.getElementById(canvasId);
  var c = C.getContext('2d');
  var viewWidth = C.width = C.scrollWidth;
  var viewHeight = C.height  = C.scrollHeight;
  var cols = Math.floor(viewWidth / this.triW);
  cols = (cols % 2) ? cols : cols - 1; // => keep it odd 
  var rows = Math.floor(viewHeight / this.triH) * 2;
  var tris = [];
  var neighbours = ["side", "top", "bottom"];
  
  // Add here as many colors as you want :
  
   var colors = colorsArray? colorsArray : [
    //oranges
    '#eb9000', '#f6b400',  
    //reds
    '#440510', '#8a0a08', 
    //greens
    '#05391e', '#004b25',  
    //blues       	
    '#0c1a36', '#01235d', '#0b3f7a', '#0561a6', '#007ecb', '#32b2fa', '#54cefc', '#91dffa'
  ];
  
  
  var handleResize = function() {
    viewWidth = C.width = C.scrollWidth;
    viewHeight = C.height  = C.scrollHeight;
    if (isRunning) {
      instance.start();
    }else{
      instance.kill();
    }
  }
  
  function initGrid(){
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var pos = i + (j * cols);
        var col = colors[Math.floor(Math.random() * colors.length)];
        var triangle = new Triangle(pos, i, j, instance.triW, instance.triH, col,c);
        tris.push(triangle);
        triangle.draw();
      }
    }   
  }
  
  function initParams(){
    cols = Math.floor(viewWidth / instance.triW);
    cols = (cols % 2) ? cols : cols - 1; // => keep it odd 
    rows = Math.floor(viewHeight / instance.triH) * 2;
    tris = [];
  }
  
  function unselectTris() {
    
    for (var i = 0; i < tris.length; i++) {
      tris[i].selectedForTrail = false;
    }
  }
  
  function createTrail() {
    unselectTris();
    var currentTri;
    var trailLength = Math.floor(Math.random() * instance.trailMaxLength - 2) + 2;
    var index = Math.round(Math.random() * tris.length);
    var startTri = tris[index];
    startTri.selectedForTrail = true;
    currentTri = {
      tri: startTri,
      openDir: "side",
      closeDir: "side"
    };
    
		for (var i = 0; i < trailLength; i++) {
      var o = getNeighbour(currentTri.tri);
      if (o != null) {
        o.tri.selectedForTrail = true;
        var opacity;
        if (instance.randomAlpha){
          opacity = (Math.random()<.8) ? Math.random()*.5 : 1;
        }else{
          opacity = 1;
        }
        currentTri.tri.closeDir = o.openDir;
        currentTri.tri.open(currentTri.openDir, instance.speedTriOpen, opacity, i* instance.speedTrailAppear);
        currentTri.tri.close(currentTri.closeDir, 1, instance.delayBeforeDisappear + i*instance.speedTrailDisappear);
        currentTri = o;
      } else {
        currentTri.tri.open(currentTri.openDir, instance.speedTriOpen, opacity, (i+1)* instance.speedTrailAppear);
        currentTri.tri.close(currentTri.closeDir, 1, instance.delayBeforeDisappear + (i+1)*instance.speedTrailDisappear);
        break;
      }
    }
  }

  function getNeighbour(t) {
    
    shuffleArray(neighbours);
    for (var i = 0; i < neighbours.length; i++) {
      if (neighbours[i] == "top") {
        if (t.row != 0 && !tris[t.pos - cols].selectedForTrail && !tris[t.pos-cols].opened) {
          return {
            tri: tris[t.pos - cols],
            openDir: "top",
            closeDir: "top"
          };
        }

      } else if (neighbours[i] == "bottom") {
        if (t.row != rows - 1 && !tris[t.pos + cols].selectedForTrail && !tris[t.pos+cols].opened) {
          return {
            tri: tris[t.pos + cols],
            openDir: "bottom",
            closeDir: "top"
          };
        }
      } else {
        if (t.isLeft && t.col != cols - 1 && !tris[t.pos + 1].selectedForTrail && !tris[t.pos+1].opened) {
          return {
            tri: tris[t.pos + 1],
            openDir: "side",
            closeDir: "top"
          };
        } else if (!t.isLeft && t.col != 0 && !tris[t.pos - 1].selectedForTrail && !tris[t.pos-1].opened) {
          return {
            tri: tris[t.pos - 1],
            openDir: "side",
            closeDir: "top"
          };
        }
      }
    }
    return null;
  }
  
  
   
  this.draw = function(){
    c.clearRect(0, 0, C.width, C.height);
   	for (var i = 0; i < tris.length; i++) {
    	tris[i].draw();
  	}
	}
  
  this.start = function(){
    isRunning = true;
    paused = false;
    initParams();
    initGrid();
    TweenLite.ticker.addEventListener("tick", this.draw); 
    window.addEventListener("resize", handleResize);
    if (interval) clearInterval(interval);
    interval = setInterval(createTrail, this.trailIntervalCreation);
    createTrail();
  }
  
  this.pause = function(){
    if (isRunning){
      paused = true;
      if (interval) clearInterval(interval);
      for (var i = 0; i < tris.length; i++) {
       	if (tris[i].tweenOpen) tris[i].tweenOpen.pause();
        if (tris[i].tweenClose) tris[i].tweenClose.pause();
      }
      TweenLite.ticker.removeEventListener("tick", this.draw);
			isRunning = false;
    }
  }
  this.resume = function(){
    if (paused){
      paused = false;
      isRunning = true;
      interval = setInterval(createTrail, this.trailIntervalCreation);
      for (var i = 0; i < tris.length; i++) {
       	if (tris[i].tweenOpen) tris[i].tweenOpen.resume();
        if (tris[i].tweenClose) tris[i].tweenClose.resume();
      }
      TweenLite.ticker.addEventListener("tick", this.draw);
      window.addEventListener("resize", handleResize);
    }else{
      this.start();
    }
  }
  this.kill = function(){
    if (interval) clearInterval(interval);
    for (var i = 0; i < tris.length; i++) {
      TweenLite.killTweensOf(tris[i]);
      tris[i].alpha = 0;	
    }
    this.draw();
    if (isRunning) {
      TweenLite.ticker.removeEventListener("tick", this.draw);
      window.removeEventListener("resize", handleResize);
    }
    isRunning = false;
    paused = false;
    tris = [];
  }
  
  this.closeAll = function(){
    var count = 0;
    isRunning = false;
    paused = false;
    if (interval) clearInterval(interval);
    for (var i = 0; i < tris.length; i++) {
      if (tris[i].tweenOpen) tris[i].tweenOpen.kill();
      if (tris[i].opened || tris[i].opening){
        count++;
        tris[i].close("top", .8, .2+.0015*count);
      }
    }
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function shuffleArray(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

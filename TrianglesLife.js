// TRIANGLE'S LIFE
// requires TweenMax :
// http://cdnjs.cloudflare.com/ajax/libs/gsap/1.15.0/TweenMax.min.js

/* 

Set up and instantiation



var params = {
  canvasId : 'myCanvas', // 'myCanvas' is the id of the html canvas that will be used to render the triangles.
  triangleWidth : 16,
  triangleHeight : 18,
  trailMaxLength : 12,
  trailIntervalCreation : 200,
  delayBeforeDisappear : 2,
  colors : ['#eb9000', '#f6b400','#440510', '#8a0a08','#91dffa'] 
};

var tl = new TrianglesLife(params);
tl.start();

*/



/*
Each triangle is defined by :
  pos : the order of the triangle inside the grid, it can be assimiliated to an id
  column/row : the position of the triangle in the grid
  color : color of the triangle
  
We also pass a reference to the canvas to draw the triangle.
*/

function Triangle(pos, column, row, triW, triH, color, canvas){
  var thisTri = this;
  this.pos = pos;
  this.col = column;
  this.row = row;
  this.alpha = this.tAlpha = 1;
  this.color = color;
  var c = canvas;
  
  // We need to know if a triangle is already selected inside a trail, to avoid using it twice
  this.selectedForTrail = false;
  
  // convert the color to rgb in order to change its opacity
  this.rgb = hexToRgb(this.color); 
  
  // we need to know the state of the triangle to avoid opening a 
  // triangle that is already opened
  this.opened = false; 
  this.opening = false;
  this.closing = false;
  
  // We need to know if a triangle is pointing to left or right in order 
  // to draw it and animate it correctly
  this.isLeft = (this.pos % 2); 
  
  // Each triangle is defined by 3 apexes : {tX1, tY1}, {tX2, tY2} and {tX3, tY3}
  //
  //
  //  tX1, tY1
  //     _  
  //    |  __
  //    |     __
  //    |         __
  //    |             __  tX2, tY2
  //    |         __
  //    |     __
  //    |  __
  //    |_
  //
  //  tX3, tY3
  //
  //
  // We'll also use 3 other pairs of values : {x1, y1}, {x2, y2} and {x3, y3} that will 
  // be updated and used to draw the triangles during the animation
  
  this.tX1 = (this.isLeft) ? (this.col + 1) * triW : this.col * triW;
  this.tX2 = (this.isLeft) ? this.col * triW : (this.col + 1) * triW;
  this.tX3 = this.tX1;

  this.x1 = this.tX1;
  this.x2 = this.tX1;
  this.x3 = this.tX1;

  this.tY1 = .5 * this.row * triH;
  this.tY2 = .5 * (this.row + 1) * triH;
  this.tY3 = .5 * (this.row + 2) * triH;

  this.y1 = this.tY1;
  this.y2 = this.tY2;
  this.y3 = this.tY3;
  
  // the triangle is drawn on the canvas
  this.draw = function() {
    c.fillStyle = 'rgba(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ',' + this.alpha + ')';
    c.beginPath();
    c.moveTo(this.x1, this.y1);
    c.lineTo(this.x2, this.y2);
    c.lineTo(this.x3, this.y3);
    c.closePath();
    c.fill();
  }
  
  // opening of a triangle
  // We use TweenMax as animation library
  
  this.open = function(direction, targetSpeed, targetAlpha, targetDelay) {
    if (!this.opened || !this.opening) {
      if (this.tweenClose) this.tweenClose.kill();
      this.opening = true;
      this.direction = direction || "top";
      this.delay = targetDelay || 0;
      this.tAlpha = targetAlpha;
      this.tSpeed = targetSpeed || 1.5;
      
      // Depending on which side we open a triangle, we draw its initial position.
      // We only have to see one apex moving, so we take this point and align it
      // to the 2 other apexes
      
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
      
      // Now, let's tween the position of the apexes
      
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
  
  // We'll do the same when closing a triangle
  
  this.close = function(direction, targetSpeed, targetDelay) {
      this.direction = direction || "top";
      this.delay = targetDelay || 1;
      this.tSpeed = targetSpeed || .8;
      this.opened = false;
      this.closing = true;
      var closeX1, closeX2, closeX3, closeY1, closeY2, closeY3;
      
    // Depending on the direction of the trail, we close the triangle by moving one apex to be aligned to the two others 
    
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
  
  // when an animation is complete we update the status of triangle
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

// TrianglesLife is the generator of the triangles, it creates the grid, 
// create the trails, decides which triangle will be opened or closed, etc...

function TrianglesLife(params){
  var instance = this;
  var interval;
  var isRunning = false;
  var paused = false;
  
  
  // get the parameters passed in the constructor :
  
  this.triW = params.triangleWidth || 11;
  this.triH = params.triangleHeight  || 12;
  this.speedTrailAppear = .1;
  this.speedTrailDisappear = .1;
  this.speedTriOpen = 1;
  this.trailMaxLength = params.trailMaxLength || 12;
  this.trailIntervalCreation = params.trailIntervalCreation || 100;
  this.delayBeforeDisappear = params.delayBeforeDisappear || 2;
  this.randomAlpha = true;
    
  var C = document.getElementById(params.canvasId);
  
  // initialize the variables
  
  // an array to hold all the triangles
  var tris = [];
  
  // columns and rows count
  var cols, rows;
  
  // neighbours labels, used to randomly choose the next triangle to be part of a trail
  var neighbours = ["side", "top", "bottom"]; 
  // initialize the colors, used to randomly choose a color to create a triangle in the grid
  var colors = params.colors || [
    //oranges
    '#eb9000', '#f6b400',  
    //reds
    '#440510', '#8a0a08', 
    //greens
    '#05391e', '#004b25',  
    //blues         
    '#0c1a36', '#01235d', 
    '#0b3f7a', '#0561a6', 
    '#007ecb', '#32b2fa', 
    '#54cefc', '#91dffa'
  ];
  
  // initialize the canvas
  
  var c = C.getContext('2d');
  var viewWidth = C.width = C.scrollWidth;
  var viewHeight = C.height  = C.scrollHeight; 
  
  // in case the window is resized, we restart the generation of 
  // the trails according to the new number of rows and columns 
  
  var handleResize = function() {
    viewWidth = C.width = C.scrollWidth;
    viewHeight = C.height  = C.scrollHeight;
    if (isRunning) {
      instance.start();
    }else{
      instance.kill();
    }
  }
  
  // create the grid according to the possible number of rows and columns 
  
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
  
  // calculate the number of columns and rows depending on the canvas size and reset the triangles array;
  
  function initParams(){
    cols = Math.floor(viewWidth / instance.triW);
    cols = (cols % 2) ? cols : cols - 1; // => keep it odd 
    rows = Math.floor(viewHeight / instance.triH) * 2;
    tris = [];
  }
  
  // unselect all the triangles, used to kill the process
  
  function unselectTris() {
    for (var i = 0; i < tris.length; i++) {
      tris[i].selectedForTrail = false;
    }
  }
  
  // trail creation
  
  function createTrail() {
    unselectTris();
    
    // choose a random length for a trail 
    var trailLength = Math.floor(Math.random() * instance.trailMaxLength) + 1;
    
    // choose a random triangle in the grid as a starting point for the trail
    var index = Math.round(Math.random() * tris.length);
    var startTri = tris[index];
    startTri.selectedForTrail = true;
    
    // create an object to hold animation info
    var currentTri = {
      tri: startTri,
      openDir: "side",
      closeDir: "side"
    };
    
    // find neightbours to the triangle to shape the trail
    for (var i = 0; i < trailLength; i++) {
      var o = getNeighbour(currentTri.tri);
      
      // if a usable neighbour is found, set up its opacitiy 
      // and update the close animation of the previously selected triangle according to their relative position
            
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
    
    // let's randomly choose a neighbour for the current triangle
    
    // first shuffle the neighbours array, and then test the neighbours 
    // positions one by one until we find a usable neighbour    
    shuffleArray(neighbours);
    
    
    for (var i = 0; i < neighbours.length; i++) {
      
      if (neighbours[i] == "top") {
        
        // check whether the current triangle is not in the top of the canvas :
        // t.row != 0
        // 
        // check whether the candidate triangle is not already selected for an other trail
        // !tris[t.pos - cols].selectedForTrail
        //
        // check whether the candidate triangle is not already opened
        // !tris[t.pos-cols].opened
        
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
  
  // draw all the triangles
  
  this.draw = function(){
    c.clearRect(0, 0, C.width, C.height);
    for (var i = 0; i < tris.length; i++) {
      tris[i].draw();
    }
  }
  
  
  // start is used to launch the generation of the trails
  
  this.start = function(){
    isRunning = true;
    paused = false;
    initParams();
    initGrid();
    
    // call the draw function each frame
    TweenLite.ticker.addEventListener("tick", this.draw); 
    
    window.addEventListener("resize", handleResize);
    
    // interval used to generate a new trail
    if (interval) clearInterval(interval);
    interval = setInterval(createTrail, this.trailIntervalCreation);
    createTrail();
  }
  
  // pause the animation
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
  
  // resume a paused animation
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
  
  // kill the process, the triangles disappear without any tweening
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
  
  // closeAll is used to close all the triangles smoothly
  
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
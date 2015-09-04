# Triangles life
This is a smoothly animated background effect made with canvas.
See it working here :
http://codepen.io/Yakudoo/pen/46a1b7798417f1ccbbe9a836492f71c0

License
http://creativecommons.org/licenses/by-sa/4.0/deed.en_US

# Requirements
Require GreenSock TweenMax :
http://greensock.com/tweenmax

# Demo
[Try this on codepen](http://codepen.io/Yakudoo/pen/46a1b7798417f1ccbbe9a836492f71c0)

# Usage
Triangles Life let you add a smooth andclassy triangles effects on a canvas.

To add this on your website, simply include the latest TweenMax library together with the `TrianglesLife.js` into your document `<head>`.

Add a canvas to your html file in the `body`.
```
<body>
  <canvs id="myCanvas"></canvas>
</body>
```

Style your canvas by adding a height and width in the css.
```
#myCanvas {
  position:absolute;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color : #222;
}
```

Then add a javascript like this one :
```
var params = {
  canvasId : 'myCanvas',        // id of your canvas
  triangleWidth : 16,           // width of each triangle
  triangleHeight : 18,          // height of each triangle
  trailMaxLength : 12,          // Maximum of connected triangles to form a trail
  trailIntervalCreation : 200,  // Delay before the creation of a new trail (in milliseconds)
  delayBeforeDisappear : 2,     // Delay before a trail starts to disappear (in seconds)
  colors : ['#eb9000', '#f6b400','#440510', '#8a0a08','#91dffa'] // Colors you want to use for the triangles
};

var tl = new TrianglesLife(params);
```
## trianglesLife.start()
Start the generation :
```
tl.start();
```

## trianglesLife.kill()
You can kill the process of the generator by doing :
```
tl.kill();
```
## trianglesLife.pause()
Pause it :
```
tl.pause();
```
## trianglesLife.resume()
Resume it :
```
tl.resume();
```
## trianglesLife.closeAll()
Close all the triangles :
```
tl.closeAll();
```




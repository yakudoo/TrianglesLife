# Triangles life
This is a smoothly animated background effect made with canvas.
See it working here :
http://codepen.io/Yakudoo/pen/46a1b7798417f1ccbbe9a836492f71c0

License
http://creativecommons.org/licenses/by-sa/4.0/deed.en_US

# Requirements
Require GreenSock TweenMax :
http://cdnjs.cloudflare.com/ajax/libs/gsap/1.15.0/TweenMax.min.js

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
  canvasId : 'myCanvas',
  triangleWidth : 16,
  triangleHeight : 18,
  trailMaxLength : 12,
  trailIntervalCreation : 200,
  delayBeforeDisappear : 2,
  colors : ['#eb9000', '#f6b400','#440510', '#8a0a08','#91dffa'] 
};

var tl = new TrianglesLife(params);
tl.start();

```

You can kill the process of the generator by doing :
```
tl.kill();
```
Pause it :
```
tl.pause();
```
Resume it :
```
tl.resume();
```
Close all the triangles :
```
tl.closeAll();
```





// initializes an array of sprites
function SpriteStack(constructor, count){
    this.sprites = [];
    this.marker = 0;
    this.count = count;

    for (let i = 0; i < count; i++) {
        this.sprites.push(new constructor());
        this.sprites[i].hide();
    } // end for

    this.getNext = function() {
        this.marker += 1;
        this.marker %= count;
        return this.sprites[this.marker];
    } // end getNext

    this.getNextHidden = function() {
        for (let i = this.marker; i < count + this.marker; i++) {
            if (this.sprites[i % count].visible == false) {
                this.marker = i % count;
                return this.sprites[this.marker];
            } // end if
        } // end for

        // if there are no invisible sprites, return the next one
        return this.getNext();
    } // end getNextHidden

    this.update = function() {
        for (let i = 0; i < count; i ++) {
            if (this.sprites[i].visible) {
                this.sprites[i].update();
            } // end if
        } // end for
    } // end update

    this.getVisibleCount = function() {
        visibleNum = 0;
        this.sprites.forEach(
            function(value, index, array) {
                if (value.visible) {
                    visibleNum += 1;
                } // end if
            } // end function
        );
        return visibleNum;
    } // end getVisibleCount

    this.forEach = function(func) {
        this.sprites.forEach(func);
    } // end function

    this.forEachVisible = function(func) {
        newFunc = function(value, index, array) {
            if (value.visible) {
                func(value, index, array);
            } // end if
        } // end newFunc
        this.forEach(newFunc);
    } // end forEachVisible

    this.hideAll = function() {
        this.forEach(function(a, b, c) {a.hide();});
    } // end hideAll
} // end SpriteStack


// rudimentary particle effect
function Particles(scene, count, color) {
    this.scene = scene;
    this.canvas = scene.canvas;
    this.context = this.canvas.getContext("2d");
    this.x = 200;
    this.y = 200;
    this.radius = 5;
    this.visible = true;
    this.speed = 5;
    this.lifetime = 1.0;
    this.continuous = true;
    this.fadeColor = color;
    this.color = color;

    this.Particle = function(parent) {
        this.x = 0;
        this.y = 0;
        this.direction = 0;
        this.lifetime = 1;
        this.visible = false;
        this.timer = new Timer();

        this.restart = function() {
            this.x = 0;
            this.y = 0;
            this.direction = Math.PI * 2 * Math.random();
            this.timer.reset();
            this.lifetime = Math.max(parent.lifetime / 2, Math.random() * parent.lifetime);
            this.visible = true;
        } // end restart

        this.update = function() {
            if (this.timer.getElapsedTime() < this.lifetime) {
                this.x += Math.cos(this.direction) * parent.speed;
                this.y += Math.sin(this.direction) * parent.speed;
            } else if (parent.continuous) {
                this.restart();
            } else {
                this.visible = false;
            } // end if
        } // end update

        this.getColor = function() {
            return lerpColor(parent.color, parent.fadeColor, this.timer.getElapsedTime() / this.lifetime).getHex();
        } // end getColor

        this.restart();
    } // end Particle

    this.points = [];
    for (let i = 0; i < count; i++) {
        this.points.push(new this.Particle(this));
    } // end for

    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    } // end setPosition

    this.hide = function() {
        this.visible = false;
    } // end hide

    this.show = function() {
        this.visible = true;
    } // end show

    this.setContinuous = function(value) {
        this.continuous = value;
        if (this.continuous) {
            this.show();
        } // end if
    } // end setContinuous

    this.draw = function() {
        context = this.context;
        radius = this.radius;
        context.save();
        context.translate(this.x, this.y);

        this.points.forEach(
            function(particle, index, array) {
                if (particle.visible) {
                    console.log(particle.getColor());
                    drawCircle(context, particle.x, particle.y, particle.getColor(), radius);
                } // end if
            } // end function
        );

        context.restore();
    } // end draw

    this.update = function() {
        hasVisibleParticle = false;

        if (this.visible) {
            this.points.forEach(
                function(value, index, array) {
                    value.update();
                    if (value.visible) {
                        hasVisibleParticle = true;
                    } // end if
                } // end function
            );

            if (this.continuous || hasVisibleParticle) {
                this.draw();
            } else {
                this.hide();
            } // end if
        } // end if
    } // end update

    this.restart = function() {
        this.show();
        this.points.forEach(
            function(value, index, array) {
                setTimeout(function() {
                    value.restart();
                }, 150 * Math.random());
            } // end function
        );
    } // end restart

    this.restart();
} // end Particles


function RGBColor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;

    this.getHex = function() {
        hexString = "#";
        if (this.r < 16) {
            hexString += "0" + this.r.toString(16);
        } else {
            hexString += this.r.toString(16);
        } // end if
        if (this.g < 16) {
            hexString += "0" + this.g.toString(16);
        } else {
            hexString += this.g.toString(16);
        } // end if
        if (this.b < 16) {
            hexString += "0" + this.b.toString(16);
        } else {
            hexString += this.b.toString(16);
        } // end if
        return hexString;
    } // end getHex
} // end RGBColor


function getAngleBetween(from, to) {
  dx = to.x - from.x;
  dy = to.y - from.y;
  return Math.atan2(dy, dx) * 180 / Math.PI + 90;
} // end getAngleBetween


function getDistanceBetween(from, to) {
  dx = from.x - to.x;
  dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
} // end getDistanceBetween


function drawCircle(context, x, y, color, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
} // end drawCircle


function areColliding(a, b) {
    return getDistanceBetween(a, b) < (a.width + b.width) / 2;
} // end areColliding


function lerp(from, to, weight) {
    return from + (to - from) * weight;
} // end lerp


function lerpColor(from, to, weight) {
    return new RGBColor(
        Math.round(lerp(from.r, to.r, weight)),
        Math.round(lerp(from.g, to.g, weight)),
        Math.round(lerp(from.b, to.b, weight))
    );
} // end lerpColor
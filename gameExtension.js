
// initializes an array of sprites
function SpriteStack(constructor, count){
    // array of sprites
    this.sprites = [];
    // keeps track of where we are in the array
    this.marker = 0;
    // how many sprites are in the stack?
    this.count = count;

    // initialize the sprite list
    for (let i = 0; i < count; i++) {
        // create a sprite with the 'constructor' parameter
        sprite = new constructor();
        // and it to the sprites array
        this.sprites.push(sprite);
        // hide the sprite
        sprite.hide();
    } // end for

    // returns the next sprite in the stack, wrapping at the end
    this.getNext = function() {
        this.marker += 1;
        this.marker %= count;
        return this.sprites[this.marker];
    } // end getNext

    // returns the next sprite in the stack that isn't visible
    // if all sprites are visible, returns the next sprite in the list
    this.getNextHidden = function() {
        for (let i = this.marker; i < count + this.marker; i++) {
            // if the sprite is invisible
            if (this.sprites[i % count].visible == false) {
                // update marker
                this.marker = i % count;
                // return sprite
                return this.sprites[this.marker];
            } // end if
        } // end for

        // if there are no invisible sprites, return the next one
        return this.getNext();
    } // end getNextHidden

    // calls update on each of the visible sprites in the sprite array
    this.update = function() {
        for (let i = 0; i < count; i ++) {
            if (this.sprites[i].visible) {
                this.sprites[i].update();
            } // end if
        } // end for
    } // end update

    // returns the number of visible sprites
    this.getVisibleCount = function() {
        visibleNum = 0;
        // go through the sprite array and count visible sprites
        this.sprites.forEach(
            function(value, index, array) {
                if (value.visible) {
                    visibleNum += 1;
                } // end if
            } // end function
        );
        return visibleNum;
    } // end getVisibleCount

    // calls forEach on the sprites array, using the func parameter
    this.forEach = function(func) {
        this.sprites.forEach(func);
    } // end function

    // calls forEach on the sprites array. Wraps the func parameter in another function
    // that filters out invisible sprites.
    this.forEachVisible = function(func) {
        // create the function that filters invisible sprites
        newFunc = function(value, index, array) {
            if (value.visible) {
                func(value, index, array);
            } // end if
        } // end newFunc
        this.forEach(newFunc);
    } // end forEachVisible

    // hide all the sprites in the array
    this.hideAll = function() {
        this.forEach(function(a, b, c) {a.hide();});
    } // end hideAll

    // show all the sprites in the array
    this.showAll = function() {
        this.forEach(function(a, b, c) {a.show();});
    }
} // end SpriteStack


// rudimentary particle effect
function Particles(scene, count, color) {
    this.scene = scene;
    this.canvas = scene.canvas;
    this.context = this.canvas.getContext("2d");
    this.x = 200;
    this.y = 200;
    // if false, the particles emit once
    this.continuous = true;
    this.visible = true;

    // particle radius
    this.radius = 5;
    // particle speed
    this.speed = 5;
    // base particle lifetime
    this.lifetime = 1.0;
    // particle color
    this.color = color;
    // color to transition to
    this.fadeColor = color;
    // timer to control the particle's lifetimes
    this.timer = new Timer();
    // particle class
    this.Particle = function(parent) {
        // particle position (relative to parent)
        this.x = 0;
        this.y = 0;
        // angle of travel
        this.direction = 0;
        // actual lifetime
        this.lifetime = 1;
        this.visible = false;
        // used to track lifetime
        this.lifetimeOffset = 0.0;
        
        this.getLifetime = function() {
            return parent.timer.getElapsedTime() - this.lifetimeOffset;
        }

        // put the particle at the origin and randomize its direction of travel
        this.restart = function() {
            // reset position
            this.x = 0;
            this.y = 0;
            // randomize direction
            this.direction = Math.PI * 2 * Math.random();
            // reset and randomize lifetime
            this.lifetimeOffset = parent.timer.getElapsedTime();
            this.lifetime = Math.max(parent.lifetime / 2, Math.random() * parent.lifetime);
            // make visible
            this.visible = true;
        } // end restart

        // move the particle and check for lifetime expiration
        this.update = function() {
            if (this.getLifetime() < this.lifetime) {
                // if the particle hasn't expired yet
                this.x += Math.cos(this.direction) * parent.speed;
                this.y += Math.sin(this.direction) * parent.speed;
            } else if (parent.continuous) {
                // if the particle has expired, but needs to emit again, restart
                this.restart();
            } else {
                // otherwise: hide the particle
                this.visible = false;
            } // end if
        } // end update

        // return an hex color somewhere between parent.color and parent.fadeColor
        this.getColor = function() {
            return lerpColor(parent.color, parent.fadeColor, this.getLifetime() / this.lifetime).getHex();
        } // end getColor
    } // end Particle

    // initialize a list of particles
    this.points = [];
    for (let i = 0; i < count; i++) {
        this.points.push(new this.Particle(this));
    } // end for

    // set the particle effect's position
    this.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
    } // end setPosition

    // hide the particle effect
    this.hide = function() {
        this.visible = false;
    } // end hide

    // show the particle effect
    this.show = function() {
        this.visible = true;
    } // end show

    // set the continuous property. If you set it to true, the particle effect re-enables.
    this.setContinuous = function(value) {
        this.continuous = value;
        if (this.continuous) {
            this.show();
        } // end if
    } // end setContinuous

    // draw the particles
    this.draw = function() {
        context = this.context;
        radius = this.radius;
        context.save();
        context.translate(this.x, this.y);

        // for each particle, draw it
        this.points.forEach(
            function(particle, index, array) {
                if (particle.visible) {
                    drawCircle(context, particle.x, particle.y, particle.getColor(), radius);
                } // end if
            } // end function
        );

        context.restore();
    } // end draw

    // move the particles and draw them
    this.update = function() {
        // used to track if the emission is finished
        hasVisibleParticle = false;

        if (this.visible) {
            // update the particles
            this.points.forEach(
                function(value, index, array) {
                    // update the particle
                    value.update();
                    if (value.visible) {
                        // there is a visible particle
                        hasVisibleParticle = true;
                    } // end if
                } // end function
            );

            // if there are visible particles OR the particle effect should always be emitting
            if (this.continuous || hasVisibleParticle) {
                // draw the particles
                this.draw();
            } else { // otherwise... hide the particle effect
                this.hide();
            } // end if
        } // end if
    } // end update

    // resets the particle effect
    this.restart = function() {
        this.show();
        // reset all the particles
        this.points.forEach(
            function(value, index, array) {
                // put a small gap in between particle spawns
                setTimeout(function() {
                    value.restart();
                }, 150 * Math.random());
            } // end function
        );
    } // end restart

    // start the particle effect
    this.restart();
} // end Particles


// a class that separates R, G, and B color values
function RGBColor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;

    // returns a hex color string
    this.getHex = function() {
        hexString = "#";
        if (this.r < 16) { // a single-digit hex number
            hexString += "0" + this.r.toString(16);
        } else { // it's a two-digit hex number
            hexString += this.r.toString(16);
        } // end if
        if (this.g < 16) { // single-digit
            hexString += "0" + this.g.toString(16);
        } else { // two-digit
            hexString += this.g.toString(16);
        } // end if
        if (this.b < 16) { // single-digit
            hexString += "0" + this.b.toString(16);
        } else { // two-digit
            hexString += this.b.toString(16);
        } // end if
        return hexString;
    } // end getHex
} // end RGBColor


// does some fancy math to get the angle from 'from' to 'to'
// from and to must both have x and y properties
function getAngleBetween(from, to) {
  dx = to.x - from.x;
  dy = to.y - from.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
} // end getAngleBetween


// gets the distance between from and to
// from and to must have x and y properties
function getDistanceBetween(from, to) {
  dx = from.x - to.x;
  dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
} // end getDistanceBetween


// draws a circle with given radius and color on the context at the given position
function drawCircle(context, x, y, color, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
} // end drawCircle


// radius-based collision
// a and b must have x, y, and width properties
function areColliding(a, b) {
    return getDistanceBetween(a, b) < (a.width + b.width) / 2;
} // end areColliding


// linear interpolation for numbers
function lerp(from, to, weight) {
    return from + (to - from) * weight;
} // end lerp


// linear interpolation, but for RGBColors
function lerpColor(from, to, weight) {
    return new RGBColor(
        Math.round(lerp(from.r, to.r, weight)),
        Math.round(lerp(from.g, to.g, weight)),
        Math.round(lerp(from.b, to.b, weight))
    );
} // end lerpColor
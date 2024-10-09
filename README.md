A simple space shooter where you fly around and shoot enemies. Kill as many as you can to get POINTS before you die!

# GameExtension.js

Supplementary classes for simpleGame.js.

## Classes

### SpriteStack(constructor, count)

Initializes `count` instances of `constructor`.

This class initializes an array of sprites for future reference. Good for bullets, coins, and anything else that you need to initialize a bunch of
at the start of the program.

#### sprites

An array of sprites.

#### marker

Marks where in the array of sprites we took the last thing from

#### count

How many sprites the spritestack was initialized with

#### getNext()

Returns next element in the array.

#### getNextHidden()

Returns the next element in the array that is not visible. If all elements are visible, returns the next one in the array.

#### update()

Calls the `update()` function on all visible sprites in the array.

#### getVisibleCount()

Returns the number of visible sprites in the array.

#### forEach(func)

Calls forEach on the array of sprites, using the function passed as a parameter.

#### forEachVisible(func)

Calls forEach on the array of sprites, using the function passed as a parameter, but ignoring invisible sprites.

#### hideAll()

Hides all sprites in the array.

### Particles(scene, count, color)

Draws `count` particles of color `color` on `scene`'s canvas. The `color` parameter must be an instance of `RGBColor`.

#### scene
The scene passed as a parameter.

#### canvas
The canvas of the scene.

#### context
The context of the scene's canvas.

#### x
The x-position of the particle effect.

#### y
The y-position of the particle effect.

#### radius
The radius of the particles.

#### visible
Is the particle effect visible?

#### speed
The speed of the particles

#### lifetime
The number of seconds the particles last

#### continuous
When false, the particle effect emits once and then stops. Otherwise, it emits... continuously.

#### color
The RGBColor passed in the constructor.

#### fadeColor
This must be an instance of `RGBColor`. If set, the particles fade from `color` to `fadeColor` over the course of their lifetime.

#### points
An array of `Particle` classes.

#### Particle(parent)
A class with a position and lifetime that represents one particle of the particle effect.

**x:** x-position of the particle

**y:** y-position of the particle

**direction:** the direction of the particle's travel

**lifetime:** how long the particle is visible for

**visible:** is the particle visible

**timer:** used to hide the particle once `lifetime` seconds have passed

**restart()** move the particle back to the origin and randomizes its direction and lifetime.

**update()** moves and draws the particle

**getColor()** gets the color, lerped between the parent's `color` and `fadeColor` properties

#### setPosition(x, y)
Sets the particle effect's position

#### hide()
Hides the particle effect

#### show()
Shows the particle effect

#### setContinuous(value)
Sets the `continuous` property to `value`. If setting it to `true`, also starts the particle effect.

#### draw()
Draws the particles

#### update()
Updates and draws the particles.

#### restart()
Restarts the particle effect.
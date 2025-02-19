// enemy type constants
TYPE_SHIELD = 1;
TYPE_NORMAL = 0;
TYPE_ADVANCED = 2;
TYPE_ELITE = 3;
TYPE_OTHER = 4;
TYPE_ATTRIBUTES = {
    1:{
        "shield":true,
        "cooldown":0.5,
        "speed":100,
    },
    0:{
        "shield":false,
        "cooldown":0.5,
        "speed":100,
    },
    2:{
        "shield":false,
        "cooldown":0.4,
        "speed":150,
    },
    3:{
        "shield":true,
        "cooldown":0.4,
        "speed":150,
    },
    4:{
        "shield":false,
        "cooldown":0.3,
        "speed":90
    }
};

// player class
function Shippy() {
    tShippy = new Sprite(scene, "images/player.png", 75 / 2, 112 / 2);
    
    tShippy.health = 5;
    tShippy.turnSpeed = 0.6;
    tShippy.canShoot = true;
    tShippy.autoShoot = false;
    tShippy.autoShootToggled = false;
    tShippy.shootTimer = new Timer();
    // initialize bullets
    tShippy.bullets = new SpriteStack(Bullet, 10);
    // create a shield
    tShippy.shield = new Shield(tShippy);
    // laser sound
    tShippy.shootSound = new Sound("sfx/laser1");
    // damaged sound
    tShippy.hitSound = new Sound("sfx/damage");

    // give shield up/down sounds
    tShippy.shield.enableSound(new Sound("sfx/shieldDown"), new Sound("sfx/shieldUp"));

    // set speed and angle
    tShippy.setAngle(0);
    tShippy.moveMode = "easy";

    // check for keyboard input
    tShippy.checkKeys = function(){
        // turn left
        turnAmount = this.turnSpeed * 360 * delta;
        realTurn = 0.0;
        if (keysDown[K_LEFT] || keysDown[K_A]){
            realTurn = -turnAmount;
        } else if (keysDown[K_RIGHT] || keysDown[K_D]){
            realTurn = turnAmount;
        } // end if
        if (this.moveMode == "hard") {
            this.imgAngle += realTurn * Math.PI / 180;
            if ((keysDown[K_UP] || keysDown[K_W]) && this.speed <= 300.0){
                this.addVector(this.getImgAngle(), 300 * delta);
            } else {
                this.addVector(this.getMoveAngle() + 180, this.speed * delta);
            }
        } else {
            this.turnBy(realTurn);
            // important for bouncing off of asteroids
            this.imgAngle = this.moveAngle;
        }
        
        // toggle auto shoot
        if (keysDown[K_E]) {
            if (this.autoShootToggled == false) {
                this.autoShootToggled = true;
                this.autoShoot = ! this.autoShoot;
            }
        } else {
            this.autoShootToggled = false;
        } // end if

        // shoot
        if (keysDown[K_SPACE] || this.autoShoot) {
            if (this.canShoot || (this.autoShoot && this.shootTimer.getElapsedTime() > 0.2 + Math.random() * 0.1)) {
                // fire a bullet
                bullet = this.bullets.getNextHidden();
                bullet.fire(this);
                this.canShoot = false;
                this.shootSound.play();
                this.shootTimer.reset();
            } // end if
        } else {
            // if the space key is released, set canShoot to true
            this.canShoot = true;
        } // end if
    } // end checkKeys

    // update shippy
    tShippy.update = function() {
        // check for keyboard
        this.checkKeys();
        // do all the other updating
        this.updateSelf();
        this.bullets.update();
        this.shield.update();
    } // end update

    // damage the shippy
    tShippy.hit = function() {
        if (this.shield.visible) { // take out the shield if it's there
            this.shield.hit();
        } else { // otherwise, lose a health
            this.health -= 1;
            this.hitSound.play();
        } // end if
    } // end hit

    return tShippy;
} // end Shippy


function Asteroid() {
    tAsteroid = new Sprite(scene, "images/asteroids/asteroid0.png", 50, 50);

    tAsteroid.reset = function() {
        this.setPosition(Math.random() * 800, Math.random() * 600);
        this.setImgAngle(Math.random() * 360);
        this.setSpeed(Math.random() * 20 + 10);
        this.setMoveAngle(Math.random() * 360);
        this.image.src = "images/asteroids/asteroid" + Math.round(Math.random() * 7) + ".png";
    } // end reset

    tAsteroid.collideWith = function(obj, knockback) {
        angle = getAngleBetween(this, obj);

        this.addVector(angle + 180, knockback);
        obj.dx *= -1;
        obj.dy *= -1;
        obj.calcSpeedAngle();
    } // end collideWith

    tAsteroid.update = function() {
        this.addVector(this.getMoveAngle() + 180, this.speed * delta * 0.2);
        this.updateSelf();
    } // end update

    return tAsteroid;
} // end Asteroid


// player bullet class
function Bullet() {
    tBullet = new Sprite(scene, "images/laserBlue09.png", 10, 10);
    
    tBullet.setBoundAction(DIE);

    // shoot the bullet from parent
    tBullet.fire = function(parent) {
        // set angle to parent's forward direction
        this.setAngle(parent.getImgAngle());
        // set position to parent's position
        this.setPosition(parent.x, parent.y);
        // set speed and make visible
        this.setSpeed(400);
        this.show();
    } // end fire

    return tBullet;
} // end Bullet


// an enemy bullet
function EnemyBullet() {
    tBullet = new Bullet();
    // change the image
    tBullet.image.src = "images/greenLaser.png";
    tBullet.width = 12;
    tBullet.height = 5;

    return tBullet;
} // end EnemyBullet


// enemy class
function Enemy() {
    tEnemy = new Sprite(scene, "images/enemy0.png", 84/2, 93/2);
    // this variable stores the direction the ship is turning in
    tEnemy.turnDirection = 0;
    tEnemy.target = shippy;
    tEnemy.shootTimer = new Timer();
    // enemy type
    tEnemy.type = TYPE_NORMAL;
    // create a shield
    tEnemy.shield = new Shield(tEnemy);
    // attack cooldown time
    tEnemy.cooldown = 0.5;

    // set the enemy's type
    tEnemy.setType = function(newType) {
        this.type = newType;
        // update attributes
        this.setSpeed(TYPE_ATTRIBUTES[this.type]["speed"]);
        this.cooldown = TYPE_ATTRIBUTES[this.type]["cooldown"];
        this.shield.enabled = TYPE_ATTRIBUTES[this.type]["shield"];
        // update image
        this.image.src = "images/enemy" + this.type + ".png";
    }

    // launch the enemy (like a restart)
    tEnemy.launch = function() {
        // randomize position
        this.setPosition(Math.random() * this.cWidth, Math.random() * this.cHeight);
        this.show();

        // get a random enemy type
        typeChance = Math.random() * 100;
        if (typeChance < 10) {
            this.setType(TYPE_ELITE);
        } else if (typeChance < 20) {
            this.setType(TYPE_SHIELD);
        } else if (typeChance < 30) {
            this.setType(TYPE_ADVANCED);
        } else if (typeChance < 40) {
            this.setType(TYPE_OTHER);
        } else {
            this.setType(TYPE_NORMAL);
        } // end if
    } // end launch

    // chase the target
    tEnemy.chase = function() {
        // get angle to target
        angle = getAngleBetween(this, this.target) - this.getMoveAngle();
        angle %= 360;

        // if the enemy is not facing the target
        if (Math.abs(angle) > 10) {
            if (this.turnDirection == 0) {
                // if turnDirection is 0, set it to 1 or -1
                if (Math.random() < 0.5) {
                    this.turnDirection = 1;
                } else {
                    this.turnDirection = -1;
                } // end if
            } // end if

            // turn the enemy
            this.changeAngleBy(this.speed * this.turnDirection * delta);
        } else { // if the enemy is facing the target
            // stop turning
            this.turnDirection = 0;
        } // end if 
    } // end chase

    // shoot a bullet
    tEnemy.shoot = function() {
        // if cooldown time has elapsed
        if (this.shootTimer.getElapsedTime() >= this.cooldown) {
            // shoot a bullet
            enemyBullets.getNextHidden().fire(this);
            // reset the cooldown timer
            this.shootTimer.reset();
            // play the sound
            enemyShootSound.play();
        } // end if
    } // end shoot

    // update
    tEnemy.update = function() {
        // chase the target
        this.chase();
        // if the ship faces the target, shoot
        if (this.turnDirection == 0) {
            this.shoot();
        } // end if
        // important for bouncing off of asteroids
        this.imgAngle = this.moveAngle;
        // update other things
        this.updateSelf();

        this.shield.update();
    } // end update

    // damage the enemy
    tEnemy.hit = function() {
        if (this.shield.enabled) { // if we have a shield
            if (this.shield.visible) { // if it's on
                this.shield.hit(); // hit the shield
            } else { // the shield is down
                this.hide(); // die
            } // end if
        } else { // there is no shield
            this.hide(); // die
        } // end if
    } // end hit

    return tEnemy;
} // end Enemy


// particle effect for explosions
function Explosion() {
    // create particle effect with 20 particles, yellow color
    tExplosion = new Particles(scene, 20, new RGBColor(255, 255, 0));
    // set fade to red
    tExplosion.fadeColor = new RGBColor(255, 0, 0);
    // make it explode only once
    tExplosion.setContinuous(false);

    // send to position and enable particles
    tExplosion.explodeAt = function(x, y) {
        this.setPosition(x, y);
        this.restart();
    } // end explodeAt

    return tExplosion;
} // end Explosion


// generates a starry background
function SpaceBackground(scene) {
    this.scene = scene;
    this.canvas = scene.canvas;
    this.context = this.canvas.getContext("2d");
    this.cWidth = parseInt(this.canvas.width);
    this.cHeight = parseInt(this.canvas.height);

    this.minStars = 10;
    this.maxStars = 20;

    // star variable arrays
    this.pointXs = [];
    this.pointYs = [];
    this.starColors = [];
    this.starRadii = [];

    // color-radius pairs
    starOptions = [
        ['red', 3],
        ['#f5feff', 6],
        ['orange', 4],
        ['yellow', 5]
    ];

    // generate a random number of stars
    starCount = Math.round(lerp(this.minStars, this.maxStars, Math.random()))
    for (let i = 0; i < starCount; i++) {
        // get x and y coords
        this.pointXs.push(this.cWidth * Math.random());
        this.pointYs.push(this.cHeight * Math.random());
        // set color and radius
        starOption = starOptions[Math.floor(starOptions.length * Math.random())];
        this.starColors.push(starOption[0]);
        this.starRadii.push(starOption[1]);
    } // end for

    // draws the stars
    this.update = function() {
        // once per star
        for (let i = 0; i < this.pointXs.length; i++) {
            // draw the star
            drawCircle(this.context, this.pointXs[i], this.pointYs[i], this.starColors[i], this.starRadii[i])
        } // end for
    } // end update
} // end SpaceBackground


// a shield
function Shield(owner) {
    tShield = new Sprite(scene, "images/shield.png", 54, 133/2);
    // recharge parameters
    tShield.chargeTimer = new Timer();
    tShield.chargeTime = 3;

    tShield.owner = owner;
    tShield.enabled = true;
    tShield.soundEnabled = false;

    // set sounds for when the shield goes down and comes up
    tShield.enableSound = function(down, up) {
        this.soundEnabled = true;
        this.soundDown = down;
        this.soundUp = up;
    } // end enableSound
    
    // draw the shield, recharge if needed
    tShield.update = function() {
        if (this.enabled) { // if it's enabled
            // set position and angle to match owner
            this.setPosition(this.owner.x, this.owner.y);
            this.setImgAngle(this.owner.getImgAngle());
            
            // if it's not visible
            if (this.visible == false) {
                // check for recharge
                if (this.chargeTimer.getElapsedTime() >= this.chargeTime) {
                    // make it visible
                    this.visible = true;
                    if (this.soundEnabled) {
                        // play the shield recharged sound
                        this.soundUp.play();
                    } // end if
                } // end if
            } // end if
    
            this.updateSelf();
        } // end if
    } // end update

    // take down the shield
    tShield.hit = function() {
        // hide the shield
        this.hide();
        // reset the recharge timer
        this.chargeTimer.reset();
        if (this.soundEnabled) {
            // play the shield down sound
            this.soundDown.play();
        } // end if
    } // end hit

    return tShield;
} // end Shield
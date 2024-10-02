function Shippy() {
    tShippy = new Sprite(scene, "images/player.png", 75 / 2, 112 / 2);
    
    tShippy.maxSpeed = 10;
    tShippy.minSpeed = -3;
    tShippy.health = 10;
    tShippy.canShoot = true;
    tShippy.bullets = new SpriteStack(Bullet, 10);
    tShippy.shield = new Shield(tShippy);
    
    tShippy.setSpeed(0);
    tShippy.setAngle(0);

    tShippy.checkKeys = function(){
        if (keysDown[K_LEFT] || keysDown[K_A]){
            this.changeAngleBy(-5);
        } // end if
        if (keysDown[K_RIGHT] || keysDown[K_D]){
            this.changeAngleBy(5);
        } // end if
        if (keysDown[K_UP] || keysDown[K_W]){
            this.changeSpeedBy(1);
            if (this.speed > this.maxSpeed){
                this.setSpeed(this.maxSpeed);
            } // end if
        } // end if
        if (keysDown[K_DOWN] || keysDown[K_S]){
            this.changeSpeedBy(-1);
            if (this.speed < this.minSpeed){
                this.setSpeed(this.minSpeed);
            } // end if
        } // end if

        if (keysDown[K_SPACE]) {
            if (this.canShoot) {
              bullet = this.bullets.getNextHidden();
              bullet.fire(this);
              this.canShoot = false;
            } // end if
        } else {
            this.canShoot = true;
        } // end if
    } // end checkKeys

    tShippy.update = function() {
        this.checkKeys();
        this.updateSelf();
        this.bullets.update();
        this.shield.update();
    } // end update

    tShippy.hit = function() {
        if (this.shield.visible) {
            this.shield.hit();
        } else {
            this.health -= 1;
        } // end if
    } // end hit

    return tShippy;
} // end Shippy


function Bullet() {
    tBullet = new Sprite(scene, "images/laserBlue09.png", 10, 10);
    
    tBullet.setBoundAction(DIE);

    tBullet.fire = function(parent) {
        this.setAngle(parent.moveAngle * 180 / Math.PI + 90);
        this.setPosition(parent.x, parent.y);
        this.setSpeed(20);
        this.show();
    } // end fire

    return tBullet;
} // end Bullet


function EnemyBullet() {
    tBullet = new Bullet();
    tBullet.image.src = "images/greenLaser.png";
    tBullet.width = 12;
    tBullet.height = 5;
    return tBullet;
}


function Enemy() {
    tEnemy = new Sprite(scene, "images/enemy0.png", 84/2, 93/2);
    tEnemy.setImgAngle(90);
    tEnemy.turnDirection = 0;
    tEnemy.target = shippy;
    tEnemy.shootTimer = new Timer();
    tEnemy.type = TYPE_NORMAL;
    tEnemy.shield = new Shield(tEnemy);
    tEnemy.cooldown = 0.5;

    tEnemy.setType = function(newType) {
        this.type = newType;
        if (this.type == TYPE_SHIELD) {
            this.shield.show();
            this.cooldown = 0.5;
            this.setSpeed(5);
        } else if (this.type == TYPE_ADVANCED) {
            this.shield.hide();
            this.cooldown = 0.4;
            this.setSpeed(6);
        } else {
            this.shield.hide();
            this.cooldown = 0.5;
            this.setSpeed(5);
        } // end if

        this.image.src = "images/enemy" + this.type + ".png";
    }

    tEnemy.launch = function() {
        this.setPosition(Math.random() * this.cWidth, Math.random() * this.cHeight);
        this.show();

        typeChance = Math.random() * 100;
        if (typeChance < 20) {
            this.setType(TYPE_SHIELD);
        } else if (typeChance < 30) {
            this.setType(TYPE_ADVANCED);
        } else {
            this.setType(TYPE_NORMAL);
        } // end if
    } // end launch

    tEnemy.chase = function() {
        angle = getAngleBetween(this, this.target) - this.moveAngle * 180 / Math.PI - 90;
        angle %= 360;
        if (Math.abs(angle) > 10) {
            if (this.turnDirection == 0) {
                if (Math.random() < 0.5) {
                    this.turnDirection = 1;
                } else {
                    this.turnDirection = -1;
                } // end if
            } // end if

            this.changeAngleBy(this.speed * this.turnDirection);
        } else {
            this.turnDirection = 0;
        } // end if 
    } // end chase

    tEnemy.shoot = function() {
        if (this.shootTimer.getElapsedTime() >= this.cooldown) {
            bullet = enemyBullets.getNextHidden();
            bullet.fire(this);
            this.shootTimer.reset();
        } // end if
    } // end shoot

    tEnemy.update = function() {
        this.chase();
        if (this.turnDirection == 0) {
            this.shoot();
        } // end if
        this.updateSelf();

        if (this.type == TYPE_SHIELD) {
            this.shield.update();
        }
    } // end update

    tEnemy.hit = function() {
        if (this.type == TYPE_SHIELD) {
            if (this.shield.visible) {
                this.shield.hit();
            } else {
                this.hide();
            } // end if
        } else {
            this.hide();
        } // end if
    } // end hit

    return tEnemy;
} // end Enemy


function Explosion() {
    tExplosion = new Particles(scene, 20, 'red');
    tExplosion.setContinuous(false);
    return tExplosion;
} // end Explosion


function SpaceBackground(scene) {
    this.scene = scene;
    this.canvas = scene.canvas;
    this.context = this.canvas.getContext("2d");
    this.cWidth = parseInt(this.canvas.width);
    this.cHeight = parseInt(this.canvas.height);

    this.minStars = 10;
    this.maxStars = 20;

    this.pointXs = [];
    this.pointYs = [];
    this.starColors = [];
    this.starRadii = [];

    starOptions = [
        ['red', 3],
        ['lightblue', 6],
        ['orange', 4],
        ['yellow', 5]
    ];

    for (let i = 0; i < this.minStars + (this.maxStars - this.minStars) * Math.random(); i++) {
        this.pointXs.push(this.cWidth * Math.random());
        this.pointYs.push(this.cHeight * Math.random());
        starOption = starOptions[Math.floor(starOptions.length * Math.random())];
        this.starColors.push(starOption[0]);
        this.starRadii.push(starOption[1]);
    }

    this.update = function() {
        for (let i = 0; i < this.pointXs.length; i++) {
            drawCircle(this.context, this.pointXs[i], this.pointYs[i], this.starColors[i], this.starRadii[i])
        }
    }
}


function Shield(owner) {
    tShield = new Sprite(scene, "images/shield.png", 54, 133/2);
    tShield.chargeTimer = new Timer();
    tShield.chargeTime = 3;
    tShield.owner = owner;
    
    tShield.update = function() {
        this.setPosition(this.owner.x - 10, this.owner.y);
        this.setImgAngle(this.owner.moveAngle * 180 / Math.PI + 90);

        if (this.visible == false) {
            if (this.chargeTimer.getElapsedTime() >= this.chargeTime) {
                this.visible = true;
            } // end if
        } // end if

        this.updateSelf();
    } // end update

    tShield.hit = function() {
        this.hide();
        this.chargeTimer.reset();
    } // end hit

    return tShield;
}


TYPE_SHIELD = 1;
TYPE_NORMAL = 0;
TYPE_ADVANCED = 2;
function Shippy() {
    tShippy = new Sprite(scene, "myblock.png", 32, 32);
    
    tShippy.maxSpeed = 10;
    tShippy.minSpeed = -3;
    tShippy.health = 10;
    tShippy.canShoot = true;
    tShippy.bullets = new SpriteStack(Bullet, 10);
    
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
    } // end update

    return tShippy;
} // end Shippy


function Bullet() {
    tBullet = new Sprite(scene, "myblock.png", 10, 10);
    
    tBullet.setBoundAction(DIE);

    tBullet.fire = function(parent) {
        this.setAngle(parent.moveAngle * 360 / 6.283185 + 90);
        this.setPosition(parent.x, parent.y);
        this.setSpeed(20);
        this.show();
    } // end fire

    return tBullet;
} // end Bullet


function Enemy() {
    tEnemy = new Sprite(scene, "myblock.png", 40, 40);
    tEnemy.turnDirection = 0;
    tEnemy.target = shippy;
    tEnemy.shootTimer = new Timer();

    tEnemy.launch = function() {
        this.setPosition(Math.random() * this.cWidth, Math.random() * this.cHeight);
        this.show();
        this.setSpeed(5);
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

            this.changeAngleBy(5 * this.turnDirection);
        } else {
            this.turnDirection = 0;
        } // end if 
    } // end chase

    tEnemy.shoot = function() {
        if (this.shootTimer.getElapsedTime() >= 0.5) {
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
    } // end update

    return tEnemy;
} // end Enemy


function getAngleBetween(from, to) {
    dx = to.x - from.x;
    dy = to.y - from.y;
    return Math.atan2(dy, dx) * 180 / Math.PI + 90;
} // end getAngleBetween


function getDistanceBetween(from, to) {
    dx = from.x - to.x;
    dy = from.y - to.y;
    return Math.sqrt(dx * dx + dy * dy);
}
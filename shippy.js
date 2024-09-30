function Shippy() {
    tShippy = new Sprite(scene, "myblock.png", 32, 32);
    
    tShippy.maxSpeed = 10;
    tShippy.minSpeed = -3;
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
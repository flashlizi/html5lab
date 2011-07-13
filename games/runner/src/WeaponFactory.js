/**
 * 
 */
 
WeaponFactory = function(stage, player, weaponTool)
{
	Sprite.call(this);
	this.name = NameUtil.createUniqueName("WeaponFactory");
	
	this.stage = stage;
	this.scene = stage.getChildAt(0);
	this.player = player;	
	this.weaponTool = weaponTool;	
	
	//gatling icon
	this._gatingIcon = new MovieClip(ImageManager.icon.gatlingIcon);
	this._gatingIcon.stop();
	this._gatingIcon.width = 77;
	this._gatingIcon.height = 79;
	this.addChild(this._gatingIcon);
	
	//register mouse event for creating gating
	stage.addEventListener(StageEvent.MOUSE_MOVE, casual.delegate(this.mouseMoveHandler, this));
	stage.addEventListener(StageEvent.MOUSE_DOWN, casual.delegate(this.mouseDownHandler, this));
	stage.addEventListener(StageEvent.MOUSE_UP, casual.delegate(this.mouseUpHandler, this));
}
casual.inherit(WeaponFactory, Sprite);

WeaponFactory.prototype.mouseMoveHandler = function(e)
{
	this.placeWeapon(this._dragWeapon);
}

WeaponFactory.prototype.mouseDownHandler = function(e)
{	
	//skip right button click
	if(e.button == 2) return;
	if(this._gatingIcon.currentFrame == 2 && this._gatingIcon.hitTestPoint(e.mouseX, e.mouseY))
	{
		this.createWeapon();
	}	
}

WeaponFactory.prototype.mouseUpHandler = function(e)
{	
	if(!this._dragWeapon) return;
	var yes = this.placeWeapon(this._dragWeapon);
	if(yes)
	{		
		this.player.addWeapon(this._dragWeapon);
		this.player.money -= this._dragWeapon.cost;
		this.updateWeapon();
		this.weaponTool.removeRadius();
	}else
	{
		this._dragWeapon.parent.removeChild(this._dragWeapon);		
	}
	this._dragWeapon = null;
}

WeaponFactory.prototype.updateWeapon = function()
{
	if(this.canCreate(Gatling))
	{
		this._gatingIcon.gotoAndStop(2);
	}else
	{
		this._gatingIcon.gotoAndStop(1);
	}
}

WeaponFactory.prototype.createWeapon = function()
{
	if(this.canCreate(Gatling))
	{
		var g = new Gatling();	
		this._dragWeapon = g;
		this.placeWeapon(g);
		this.scene.addChild(g);
	}
}

WeaponFactory.prototype.placeWeapon = function(weapon)
{
	if(!weapon) return false;
	var p = this.getAvailablePositionNearby(this.stage.mouseX, this.stage.mouseY);
	if(p)
	{
		this._dragWeapon.x = p.x;
		this._dragWeapon.y = p.y;
		this._dragWeapon.tx = p.tx;
		this._dragWeapon.ty = p.ty;
		var radiusCircle;
		
		//if(p.tx <= 0 || p.tx >= 17 || p.ty <= 0 || p.ty == 3 || p.ty >= 7 || this.player.getWeaponAt(p.tx, p.ty) || !this.player.buildPath(p.tx, p.ty)) 
		if((p.tx==0 && p.ty==3) || p.tx < 0 || p.tx > 17 || p.ty < 0 || p.ty >= 7 || this.player.getWeaponAt(p.tx, p.ty) || !this.player.buildPath(p.tx, p.ty)) 
		{			
			radiusCircle = this.weaponTool.drawRadius(this._dragWeapon, false);
			radiusCircle.x = -this._dragWeapon.attackRadius - 2;
			radiusCircle.y = -this._dragWeapon.attackRadius - 8;
			this._dragWeapon.addChild(radiusCircle);
			this._dragWeapon.alpha = 0.5;
			return false;
		}else 
		{
			radiusCircle = this.weaponTool.drawRadius(this._dragWeapon, true);
			radiusCircle.x = -this._dragWeapon.attackRadius - 2;
			radiusCircle.y = -this._dragWeapon.attackRadius - 8;			
			this._dragWeapon.addChild(radiusCircle);
			this._dragWeapon.alpha = 1.0;
		}		
		return true;
	}
	return false;
}

WeaponFactory.prototype.getAvailablePositionNearby = function(x, y)
{
	var h = Math.round((x - this.player.startPoint[0]) / this.player.tileWidth);
	var v = Math.round((y - this.player.startPoint[1]) / this.player.tileHeight);
	x = this.player.startPoint[0] + h * this.player.tileWidth;
	y = this.player.startPoint[1] + v * this.player.tileHeight;
	return {x:x, y:y, tx:h, ty:v};
}

WeaponFactory.prototype.canCreate = function(weapon)
{
	return this.player.money >= Gatling.getLevel(0).cost;
}
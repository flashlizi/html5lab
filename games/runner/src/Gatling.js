/**
 * 
 */
 
Gatling = function()
{
	MovieClip.call(this);	
	this.name = NameUtil.createUniqueName("Gatling");
	
	this.status = "idle";	
	this.level = 0;
	this.cost = 0;
	this.sellMoney = 0;
	this.upgradeMoney = 0;
	this.minDamage = 0;
	this.maxDamage = 0;
	this.attackRadius = 0;
	this.turnSpeed = 0;
	this.realTurnSpeed = 0;
	this.target = null;
	this.tx = -1;
	this.ty = -1;
	
	this._turnTime = 0;
	this._fireTime = 0;
	this._currentAngleFrame = -1;
	this._currentAngle = 0;
	this._create();
}
casual.inherit(Gatling, MovieClip);

Gatling.IDLE = "idle";
Gatling.FIRE = "fire";

Gatling.currentLevel = 0;
Gatling.levels = [{cost:50, sellMoney:25, upgradeMoney:45, minDamage:10, maxDamage:20, attackRadius:135, turnSpeed:300},
				  {cost:90, sellMoney:45, upgradeMoney:65, minDamage:20, maxDamage:50, attackRadius:160, turnSpeed:300},
				  {cost:150, sellMoney:75, upgradeMoney:95, minDamage:50, maxDamage:80, attackRadius:200, turnSpeed:300}];

Gatling.setLevel = function(target, level)
{
	target.level = level;
	target.cost = Gatling.levels[level].cost;
	target.sellMoney = Gatling.levels[level].sellMoney;
	target.upgradeMoney = Gatling.levels[level].upgradeMoney;
	target.minDamage = Gatling.levels[level].minDamage;
	target.maxDamage = Gatling.levels[level].maxDamage;
	target.attackRadius = Gatling.levels[level].attackRadius;
	target.realTurnSpeed = target.turnSpeed = Gatling.levels[level].turnSpeed;
}

Gatling.getLevel = function(level)
{
	if(level == undefined) level = Gatling.currentLevel;
	if(level < 0 || level >= Gatling.levels.length) return null;
	return Gatling.levels[level];
}

Gatling.prototype.canUpgrade = function()
{
	return this.level < 10;
}

Gatling.prototype.upgrade = function()
{
	if(!this.canUpgrade()) return;
	this.level++;
	this.cost = this.cost + this.upgradeMoney;
	this.sellMoney = this.cost*0.5>>0;
	this.upgradeMoney = this.upgradeMoney + 25;	
	this.minDamage = this.minDamage + 10;
	this.maxDamage = this.maxDamage + 20 + this.level*this.level;
	if(this.attackRadius < 200) this.attackRadius = this.attackRadius + 10;
	this.turnSpeed += 2;
	this.realTurnSpeed +=2;
}

Gatling.prototype._create = function()
{
	//set level
	Gatling.setLevel(this, 0);
	
	//note: here we only have bitmaps for right side, we use scaleX=-1 for flipping to left side
	//idle level1
	this.addFrame(ImageManager.gatling.idle1);
	//attack level1
	this.addFrame(ImageManager.gatling.attack1);
	//towards top by default
	this.gotoAndStop(1);
}

Gatling.prototype.stop = function()
{
	this.status = Gatling.IDLE;
	var frame = this.getRealFrame(this._currentAngleFrame, this._currentAngle);
	this.gotoAndStop(frame);
	Gatling.superClass.stop.call(this);
}

Gatling.prototype.getDamange = function()
{
	return Math.round(Math.random()*(this.maxDamage - this.minDamage)) + this.minDamage;
}

Gatling.prototype.isInAttackRadius = function(distance)
{
	return distance <= this.attackRadius;
}

Gatling.prototype.aim = function(target, autoFire)
{
	//target can be either a DisplayObject or a Point like {x:10, y:10}
	var dx = target.x - this.x;
	var dy = target.y - this.y;
	var angle = 180 / Math.PI * Math.atan2(dy, dx) + 180;
	var distance = Math.sqrt(dx*dx + dy*dy);
	
	//each frame represent 10 degree angle
	var frame = Math.round(angle / 10);	
	var inRadius = this.isInAttackRadius(distance);
	var status;
	if(autoFire)
	{
		if(inRadius) status = Gatling.FIRE;
		else status = Gatling.IDLE;
	}
	var hit = status == Gatling.FIRE;
	//set turn and fire time
	if(hit) 
	{
		if(this.status == Gatling.IDLE)
		{
			this._turnTime = new Date().getTime();
			this._fireTime = 0;
		}else
		{
			this._fireTime = new Date().getTime() - this._turnTime;
		}	
	}
	//trace(angle, frame, distance, this.attackRadius, status);	
	
	//skip if there is no change and beyond radius
	if((!inRadius || this._currentAngleFrame == frame) && this.status == status) 
	{
		if(hit) return this._checkShot();
		return false;
	}	
	
	//save changes
	this._currentAngleFrame = frame;	
	this._currentAngle = angle;
	this.status = status;
	
	frame = this.getRealFrame(frame, angle);
	//aim it, hit it
	if(hit)
	{
		this.gotoAndPlay(frame);
		return this._checkShot();
	}else
	{
		this.gotoAndStop(frame);
	}
	return false;
}

Gatling.prototype.getRealFrame = function(angleFrame, angle)
{
	//count real frame accordingly	
	var frame = angleFrame;
	if(angle >= 90 && angle <= 270) 
	{
		//right
		frame = frame - 8;
		this.scaleX = 1;
	}else if(angle >=0 && angle < 90)
	{
		//left top
		frame = 10 - frame;
		this.scaleX = -1;
	}else if(angle > 270 && angle <= 360)
	{
		//left down
		frame = 19 -(frame - 27);
		this.scaleX = -1;
	}
	return frame;
}

Gatling.prototype._checkShot = function()
{
	if(this._fireTime >= this.realTurnSpeed)
	{
		this._fireTime = 0;
		this._turnTime = new Date().getTime();
		return true;
	}
	return false;
}
/**
 * 
 */
 
Soldier = function()
{
	Sprite.call(this);
	this.name = NameUtil.createUniqueName("Soldier");
	
	this.level = 0;
	this.maxHealth = 0;
	this.health = 0;	
	this.speed = 0;
	this.score = 0;
	this.money = 0;
	
	this.path = null;
	this.tx = -1;
	this.ty = 3;
	this.direction = [1, 0];
	
	this._avatar = null;
	this._healthBar = null;	
	this._healthBarBg = null;	
	this._create();
}
casual.inherit(Soldier, Sprite);

Soldier.currentLevel = 0;
Soldier.levels = [{maxHealth:100, score:10, money:3, speed:5}];

Soldier.setLevel = function(target, level)
{
	if(level >= Soldier.levels.length)
	{
		var nowLevel = Soldier.levels[level-1];
		var nextLevel = Soldier.levels[level] = {};
		Soldier.levels[level].maxHealth = nowLevel.maxHealth*1.50>>0;
		Soldier.levels[level].score = nowLevel.score*1.10>>0;
		Soldier.levels[level].money = nowLevel.money+(level>>1);
		Soldier.levels[level].speed = nowLevel.speed;
		//trace("level:", level, nextLevel.maxHealth, nextLevel.score, nextLevel.money);
	}
	
	if(target)
	{
		target.level = level;
		target.health = target.maxHealth = Soldier.levels[level].maxHealth;
		target.score = Soldier.levels[level].score;
		target.money = Soldier.levels[level].money;
		target.speed = Soldier.levels[level].speed;
	}	
}

Soldier.getLevel = function(level)
{
	if(level == undefined) level = Soldier.currentLevel;
	if(level < 0 || level >= Soldier.levels.length) return null;
	return Soldier.levels[level];
}

Soldier.upgrade = function()
{
	Soldier.currentLevel++;
	return true;
}

Soldier.prototype._create = function()
{
	//set level
	Soldier.setLevel(this, Soldier.currentLevel);	
	//create avatar
	this._avatar = new MovieClip();	
	//walk
	this._avatar.addFrame(ImageManager.soldier.walkRight);
	this._avatar.addFrame(ImageManager.soldier.walkTop);
	this._avatar.addFrame(ImageManager.soldier.walkDown);
	//death
	this._avatar.addFrame(ImageManager.soldier.deathRightForwards);
	this._avatar.addFrame(ImageManager.soldier.deathRightBackwards);
	this._avatar.addFrame(ImageManager.soldier.deathDownBackwards);
	this._avatar.addFrame(ImageManager.soldier.deathTopForwards);
	this.addChild(this._avatar);
	
	var x = -18;
	var y = -50;
	//health red bg
	var bg = new Bitmap(ImageManager.icon.src, ImageManager.icon.healthRed);
	bg.x = x;
	bg.y = y;
	this._healthBarBg = bg;
	this.addChild(bg);
	//health green bar
	var bar = new Bitmap(ImageManager.icon.src, ImageManager.icon.healthGreen);
	bar.x = x;
	bar.y = y;
	this._healthBar = bar;
	this.addChild(bar);
}

Soldier.prototype.setDirection = function(direction)
{
	if(this.direction[0] == direction[0] && this.direction[1] == direction[1]) return;
	
	this.direction = direction;
	this._avatar.scaleX = 1;
	this._healthBarBg.x = -18;
	this._healthBar.x = -18;
	
	if(direction[0] == 1) 
	{
		//walk right
		this._avatar.gotoAndPlay(1);
	}else if(direction[0] == -1) 
	{
		//walk left, reverse right frames
		this._healthBarBg.x = -20;
		this._healthBar.x = -20;
		this._avatar.scaleX = -1;
		this._avatar.gotoAndPlay(1);
	}else if(direction[1] == 1)
	{
		//walk down
		this._avatar.gotoAndPlay(23);
	}else if(direction[1] == -1)
	{
		//walk top
		this._healthBarBg.x = -21;
		this._healthBar.x = -21;
		this._avatar.gotoAndPlay(12);
	}
}

Soldier.prototype.getShot = function(damage)
{
	this.health -= damage;
	if(this.health < 0) this.health = 0;
	
	//update health bar
	var percent = this.health / this.maxHealth;
	//make it bigger than 1 to avoid render error
	var healthWidth = Math.round(40*percent) || 1;
	if(this._healthBar) this._healthBar.width = healthWidth;
}

Soldier.prototype.animateDeath = function()
{
	this.removeChild(this._healthBar);
	this.removeChild(this._healthBarBg);
	this._healthBar = null;
	this._healthBarBg = null;
	
	var deathFrame = 33;
	if(this.direction[0] == 1)
	{
		//deathRightForwards
		deathFrame += 1;		
	}else if(this.direction[0] == -1)
	{
		//deathRightBackwards
		deathFrame += ImageManager.soldier.deathRightForwards.length + 1;
	}else if(this.direction[1] == 1)
	{
		//deathDownBackwards
		deathFrame += ImageManager.soldier.deathRightForwards.length + ImageManager.soldier.deathRightBackwards.length + 1;
	}else if(this.direction[1] == -1)
	{
		//deathTopForwards		
		deathFrame = this._avatar._frames.length - ImageManager.soldier.deathTopForwards.length + 1;
	}
	
	this._avatar.gotoAndPlay(deathFrame);
}

Soldier.prototype.isDead = function()
{	
	return this.health == 0;
}

Soldier.prototype.isDeadFinished = function()
{
	return this._avatar.currentFrame > 33 && this._avatar._paused;
}

Soldier.prototype.render = function(context)
{
	if(this.isDead() && this._avatar.currentFrame < 34)
	{
		//animate death if health=0
		this.animateDeath();
	}else if(this.isDeadFinished()) 
	{
		//fade to ash if is dead
		this._avatar.alpha -= 0.1;
		this._avatar.stop();
	}
	
	Soldier.superClass.render.call(this, context);
}
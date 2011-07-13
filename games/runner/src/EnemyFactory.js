/**
 * 
 */
 
EnemyFactory = function(scene, player)
{	
	this.scene = scene;
	this.stage = scene.getStage();
	this.player = player;	
	this._soldierStartX = 0;
	this._soldierStartY = 315;
	this.started = false;

	this.count = 0;
	this.round = 0;
	this.roundCount = 0;
	this.roundTotal = 20;
	this.roundTime = 5;
	this.countDown = this.roundTime+1;
	this.createTime = 1.5;
}

EnemyFactory.prototype.run = function()
{	
	this._roundInterval = setInterval(casual.delegate(this.create, this), this.createTime*1000);
}

EnemyFactory.prototype.resume = function()
{
	if(this.roundCount == 0)
	{
		this._createInterval = setInterval(casual.delegate(this._countDown, this), 1000);
	}else
	{
		this.run();
	}
}

EnemyFactory.prototype.stop = function()
{
	if(this._roundInterval) clearInterval(this._roundInterval);
	this._roundInterval = null;
	if(this._createInterval) clearInterval(this._createInterval);
	this._createInterval = null;
}

EnemyFactory.prototype._countDown = function()
{
	if(--this.countDown < 0)
	{
		this.countDown = this.roundTime+1;
		clearInterval(this._createInterval);
		this._createInterval = null;
		this.create();
		this.run();
	}
}

EnemyFactory.prototype.nextRound = function()
{
	//go to next round
	this.started = true;
	this.round++;
	this.player.round = this.round;
	this.roundCount = 0;
	this._createInterval = setInterval(casual.delegate(this._countDown, this), 1000);

	//upgrade the soldier every 2 round
	var level = Math.floor(this.round / 2);
	Soldier.currentLevel = level;
}

EnemyFactory.prototype.create = function()
{
	if(this.roundCount >= this.roundTotal)
	{
		this.started = false;
		this.stop();
		return;
	}
	
	var s = new Soldier();
	s.x = this._soldierStartX;
	s.y = this._soldierStartY;
	s.mouseEnabled = false;
	this.player.addTarget(s);
	this.scene.addChild(s);
	
	this.count++;
	this.roundCount++;
}
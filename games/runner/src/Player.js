/**
 * 
 */
 
Player = function(scene, id)
{
	this.scene = scene;
	this.stage = scene.getStage();
	this.id = id;
	
	//tile map properties
	this.startPoint = [105, 140];
	this.tileWidth = 60;
	this.tileHeight = 60;
	this.mapWidth = 18;
	this.mapHeight = 7;

	this.fastForward = 1;
	
	//reset game
	this.reset();
	
	/*/add initial gatlings
	Soldier.levels[0].maxHealth = 2000;
	var t=[[5,2]];	
	t=[[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
		   [0,2],                  [4,2],                  [8,2],
		               [2,3],      [4,3],      [6,3],      [8,3],
		   [0,4],      [2,4],                  [6,4],
		   [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5]];	
	for(var i = 0; i < t.length; i++)
	{		
		var gatling = new Gatling();
		gatling.x = this.startPoint[0] + t[i][0] * this.tileWidth;
		gatling.y = this.startPoint[1] + t[i][1] * this.tileHeight;
		gatling.tx = t[i][0];
		gatling.ty = t[i][1];
		this.scene.addChild(gatling);
		this.weapons.push(gatling);
	}
	this.path = this.buildPath();
	//*/
}

Player.prototype.reset = function()
{
	this.money = 100;
	this.life = 20;
	this.score = 0;
	this.round = 1;
	this.weapons = [];
	this.targets = [];	
	this.path = this.buildPath();
}

Player.prototype.buildPath = function(tx, ty, start, end)
{
	var map = [];
	var s = start;
	if(!s || s[0] < 0) s = [0, 3];
	if(!end) end = [17, 3];		
	
	for(var i = 0; i < this.mapHeight; i++)
	{
		map[i] = [];
		for(var j = 0; j < this.mapWidth; j++)
		{
			map[i][j] = this.getWeaponAt(j, i) ? 1 : 0;
		}
	}
	if(tx || ty) map[ty][tx] = 1;
	var path = Astar.findPath(map, s, end);
	if(path.length > 0)
	{
		path.push([18, 3],[19, 3]); //add end points
		if(start && start[0] < 0) path.unshift(start); //add start point
		return path;
	}else 
	{
		return null;
	}
}

Player.prototype.buidAllPaths = function()
{
	//build a default path for new enemies
	this.path = this.buildPath();
	//build a single path for each enemy existed
	for(i = 0; i < this.targets.length; i++)
	{
		var t = this.targets[i];
		//if(t.tx < 0 || t.ty < 0 || t.tx >= this.mapWidth || t.ty >= this.mapHeight) continue;
		if(t.tx >= this.mapWidth || t.ty >= this.mapHeight) continue;
		t.path = this.buildPath(null, null, [t.tx, t.ty]);
	}
}

Player.prototype.addWeapon = function(weapon)
{
	this.weapons.push(weapon);
	this.buidAllPaths();
}

Player.prototype.removeWeapon = function(weapon)
{
	var index = this.weapons.indexOf(weapon);
	if(index >= 0) this.weapons.splice(index, 1);
	this.buidAllPaths();
}

Player.prototype.getWeaponAt = function(tx, ty)
{
	for(var i = 0; i < this.weapons.length; i++)
	{
		var w = this.weapons[i];
		if(w.tx == tx && w.ty == ty) return w;
	}
	return null;
}

Player.prototype.addTarget = function(target)
{	
	target.path = this.path;
	this.targets.push(target);
}

Player.prototype.findTarget = function(g, targets)
{
	for(var i = 0; i < targets.length; i++)
	{
		var target = targets[i];
		if(!target.isDead() && this.checkInAttackRadius(g, target))
		{
			return target;
		}
	}
	return null;
}

Player.prototype.checkInAttackRadius = function(g, target)
{
	var dx = target.x - g.x;
	var dy = target.y - g.y;
	var distance = Math.sqrt(dx*dx + dy*dy);
	return g.isInAttackRadius(distance);
}

Player.prototype.autoAttack = function()
{
	//check status for queued enemies
	for(var i = 0; i < this.targets.length; i++)
	{
		var target = this.targets[i];

		if(target.isDeadFinished() && target._avatar.alpha <= 0.1)
		{
			//over... remove target entirely
			this.scene.removeChild(target);
			this.targets.splice(i, 1);
			i--;
		}else if(target.isDead())
		{
			//killed... get money and score, but don't remove because the death isn't finished...
			if(target.money > 0)
			{
				this.money += target.money;
				this.score += target.score;
				target.money = 0;
			}
		}else if(target.x >= this.stage.getStageWidth() + target.width)
		{
			//escaped... lose life, remove target
			this.life--;
			this.scene.removeChild(target);
			this.targets.splice(i, 1);
			i--;
		}else
		{
			//alive... move target
			this.moveTarget(target);
		}
	}
	
	//check weapons for auto attacking
	for(var i = 0; i < this.weapons.length; i++)
	{
		var gatling = this.weapons[i];

		//correct real turn speed according the fastForward parameter
		gatling.realTurnSpeed = Math.round(gatling.turnSpeed/this.fastForward);

		//find target for gatling, if target is null or out of attack radius or escaped...
		var needChangeTarget = gatling.target == null || !this.checkInAttackRadius(gatling, gatling.target)
							   || (gatling.target.x >= this.stage.getStageWidth() + gatling.target.width);
		if(needChangeTarget)
		{		
			var newTarget = this.findTarget(gatling, this.targets);
			gatling.target = newTarget;
		}		
		
		//aim and fire to target
		if(gatling.target)
		{
			//hit: means can get shot for target
			var hit = gatling.aim(gatling.target, true);
			if(hit)
			{			
				var damage = gatling.getDamange();
				gatling.target.getShot(damage);
			}
			
			//is dead?
			if(gatling.target.isDead()) 
			{
				gatling.stop();
				gatling.target = null;
			}
		}else
		{
			gatling.stop();
		}
	}	
}

Player.prototype.moveTarget = function(target)
{
	if(target.x < this.startPoint[0])
	{
		var x = target.x + target.speed;
		if(x < this.startPoint[0]) target.x = x;
		else 
		{
			target.x = this.startPoint[0];
			target.tx = 0;
			target.ty = 3;
		}
	}else 
	{
		var t= this.getTile(target);
		
		if(target.direction[0] != 0) 
		{
			var dx = target.x - (this.startPoint[0] + t[0] * this.tileWidth);
			if(dx == 0) 
			{			
				target.setDirection(this.getNextDirection(target));
				target.tx += target.direction[0];
				target.ty += target.direction[1];
			}
			this.moveByDirection(target);
		}else if(target.direction[1] != 0)
		{
			var dy = target.y - (this.startPoint[1] + t[1] * this.tileHeight);
			if(dy == -5) 
			{
				target.setDirection(this.getNextDirection(target));	
				target.tx += target.direction[0];
				target.ty += target.direction[1];
			}
			this.moveByDirection(target);
		}			
	}
}

Player.prototype.moveByDirection = function(target)
{
	if(!target.direction) return;
	if(target.direction[0] != 0) target.x += target.speed*target.direction[0];
	else if(target.direction[1] != 0) target.y += target.speed*target.direction[1];
}

Player.prototype.getTile = function(target)
{
	var tx = Math.round((target.x - this.startPoint[0]) / this.tileWidth);
	var ty = Math.round((target.y - this.startPoint[1]) / this.tileHeight);
	return [tx, ty];
}

Player.prototype.getNextDirection = function(target)
{
	for(var i = 0; i < target.path.length - 1; i++)
	{
		var p = target.path[i];
		if(p[0] == target.tx && p[1] == target.ty)
		{
			var next = target.path[i+1];
			return [next[0]-target.tx, next[1]-target.ty];
		}
	}	
	return null;
}
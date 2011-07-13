/**
 * 
 */
 
ScoreBar = function(player)
{
	Sprite.call(this);	
	this.name = NameUtil.createUniqueName("ScoreBar");	
	this.player = player;
	
	this._create();
}
casual.inherit(ScoreBar, Sprite);

ScoreBar.prototype._create = function()
{
	//money icon
	this._moneyIcon = new Bitmap(ImageManager.icon.src, ImageManager.icon.money);
	this.addChild(this._moneyIcon);
	
	//life icon
	this._lifeIcon = new Bitmap(ImageManager.icon.src, ImageManager.icon.life);
	this._lifeIcon.x = 1135;
	this._lifeIcon.y = 0;
	this.addChild(this._lifeIcon);
	
	//digits
	this._digits = new MovieClip(ImageManager.font.digit);
	
	//round title
	this._roundTitle = new MovieClip();
	this._roundTitle.addFrame(ImageManager.font.eng.R);
	this._roundTitle.addFrame(ImageManager.font.eng.O);
	this._roundTitle.addFrame(ImageManager.font.eng.U);
	this._roundTitle.addFrame(ImageManager.font.eng.N);
	this._roundTitle.addFrame(ImageManager.font.eng.D);
	
	//paused title
	this._pausedTitle = new MovieClip();
	this._pausedTitle.addFrame(ImageManager.font.eng.P);
	this._pausedTitle.addFrame(ImageManager.font.eng.A);
	this._pausedTitle.addFrame(ImageManager.font.eng.U);
	this._pausedTitle.addFrame(ImageManager.font.eng.S);
	this._pausedTitle.addFrame(ImageManager.font.eng.E);
	this._pausedTitle.addFrame(ImageManager.font.eng.D);
}

ScoreBar.prototype.render = function(context)
{
	var w = this.getStage().getStageWidth();
	var offsetX = 60;
	var offsetY = 30;
	
	//render money
	var str = this.player.money.toString();
	for(var i = 0; i < str.length; i++)
	{
		var n = Number(str[i]);
		var frame = this._digits._frames[n];
		if(frame) frame.render(context, this.x + offsetX, this.y + offsetY);
		offsetX += frame.disObj.regX + 8;
	}
	
	if(enemyFactory.countDown <= enemyFactory.roundTime)
	{			
		//render count down
		str = enemyFactory.countDown.toString();
	}else
	{
		//render score	
		str = this.player.score.toString();	
	}
	offsetX = w - str.length*16 >> 1;
	for(var i = 0; i < str.length; i++)
	{
		var n = Number(str[i]);
		var frame = this._digits._frames[n];
		if(frame) frame.render(context, this.x + offsetX, this.y + offsetY);
		offsetX += frame.disObj.regX + 8;
	}
	
	if(stage.getPaused())
	{
		//render paused title
		offsetX = w - 120 >> 1;
		for(var i = 0; i < this._pausedTitle.getTotalFrames(); i++)
		{
			var frame = this._pausedTitle._frames[i];
			if(frame) frame.render(context, this.x + offsetX, this.y + 75);
			offsetX += frame.disObj.width - 5;
		}
	}else
	{
		//render round title
		str = this.player.round.toString();
		offsetX = w - 120 - str.length*16 >> 1;
		for(var i = 0; i < this._roundTitle.getTotalFrames(); i++)
		{
			var frame = this._roundTitle._frames[i];
			if(frame) frame.render(context, this.x + offsetX, this.y + 75);
			offsetX += frame.disObj.width - 5;
		}
		//render round
		offsetX += 7;
		for(var i = 0; i < str.length; i++)
		{
			var n = Number(str[i]);
			var frame = this._digits._frames[n];
			if(frame) frame.render(context, this.x + offsetX, this.y + 75);
			offsetX += frame.disObj.regX + 8;
		}	
	}
	
	//render life
	offsetX = this._lifeIcon.x - 20;
	str = this.player.life.toString();
	for(var i = str.length - 1; i >= 0; i--)
	{
		var n = Number(str[i]);
		var frame = this._digits._frames[n];
		if(frame) frame.render(context, this.x + offsetX, this.y + offsetY);
		if(frame) offsetX -= frame.disObj.regX + 8;
	}
	
	ScoreBar.superClass.render.call(this, context);
}
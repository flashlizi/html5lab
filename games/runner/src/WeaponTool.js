/**
 * 
 */
 
WeaponTool = function(stage, player)
{
	Sprite.call(this);
	this.name = NameUtil.createUniqueName("WeaponTool");
	
	this.player = player;
	this.stage = stage;
	this.weapon = null;
	
	//icons
	this.sellIcon = new Bitmap(ImageManager.icon.src, ImageManager.icon.sellIcon);
	this.sellIcon.name = "sellIcon";
	this.sellIcon.mouseEnabled = true;
	this.upgradeIcon = new Bitmap(ImageManager.icon.src, ImageManager.icon.upgradeIcon);
	this.upgradeIcon.name = "upgradeIcon";
	this.upgradeIcon.mouseEnabled = true;
	this.upgradeDisabledIcon = new Bitmap(ImageManager.icon.src, ImageManager.icon.upgradeDisabledIcon);
	this.upgradeDisabledIcon.name = "upgradeDisabledIcon";
	this.upgradeDisabledIcon.mouseEnabled = true;
}
casual.inherit(WeaponTool, Sprite);

WeaponTool.prototype.drawRadius = function(weapon, enabled)
{	
	if(enabled == undefined) enabled = false;
	if(!this._radiusCircle) this._radiusCircle = new Shape();
	var radius = weapon.attackRadius;	
	if(this._radiusCircle.radius != radius)
	{
		this._radiusCircle.radius = radius;
		this._radiusCircle.graphics.drawCircle(2, 2, radius);	
		this._radiusCircle.x = -radius;
		this._radiusCircle.y = -radius-8;
	}
	if(this._radiusCircle.enabled != enabled)
	{
		this._radiusCircle.enabled = enabled;
		this._radiusCircle.graphics.lineStyle(4, "#b8eaff", 0.4);
		this._radiusCircle.graphics.beginFill(enabled ? "#008b00" : "#ff0000", 0.4);		
	}
	this._radiusCircle.graphics.clear();
	this._radiusCircle.graphics.endFill();
	return 	this._radiusCircle;
}

WeaponTool.prototype.removeRadius = function()
{
	if(this._radiusCircle.parent) this._radiusCircle.parent.removeChild(this._radiusCircle);
}

WeaponTool.prototype.remove = function()
{
	if(this.rightIcon) this.removeChild(this.rightIcon);
	this.stage.removeChild(this);
	this.weapon = null;
}

WeaponTool.prototype.show = function(weapon, enabled, hasTool)
{
	this.weapon = weapon;
	this.drawRadius(weapon, enabled);
	this.addChildAt(this._radiusCircle, 0);
	
	if(hasTool)
	{
		this.addChild(this.sellIcon);
		this.sellIcon.x = 0;
		this.sellIcon.y = 0;
		this.sellIcon.scaleX = this.sellIcon.scaleY = 0.20;		
		
		if(weapon.canUpgrade() && this.player.money >= weapon.upgradeMoney) this.rightIcon = this.upgradeIcon;
		else this.rightIcon = this.upgradeDisabledIcon;	
		this.rightIcon.x = 0;
		this.rightIcon.y = 0;
		this.rightIcon.scaleX = this.rightIcon.scaleY = 0.20;
		this.addChild(this.rightIcon);
	}
		
	var p = weapon.localToGlobal(0, 0);
	this.x = weapon.x - 0;
	this.y = weapon.y - 5;
	this._radiusCircle.x = -weapon.attackRadius - 2;
	this._radiusCircle.y = -weapon.attackRadius - 4;
	this.stage.addChild(this);
}

WeaponTool.prototype._render = function(context)
{
	var scale = this.sellIcon.scaleX;
	if(scale < 1)
	{
		this.sellIcon.scaleX = this.sellIcon.scaleY = scale + 0.20;
		this.sellIcon.x -= 17;
		this.rightIcon.scaleX = this.rightIcon.scaleY = scale + 0.20;
		this.rightIcon.x += 20;
	}
	
	//WeaponTool.superClass.render.call(this, context);
	WeaponTool.superClass._render.call(this, context);
	
	if(scale >= 1)
	{
		//render sell number
		var p = this.localToGlobal(0, 0);
		var str = (this.weapon.sellMoney).toString();
		var offsetX = this.sellIcon.x + 25 - (35-str.length*7)*0.5;
		var offsetY = this.sellIcon.y + 30;
		for(var i = str.length - 1; i >= 0; i--)
		{
			var frame = ImageManager.font.darkdigit[Number(str[i])];
			frame.disObj.scaleX = frame.disObj.scaleY = 0.7;
			frame.render(context, p.x + offsetX, p.y + offsetY);
			offsetX -= frame.disObj.regX*0.7-1;
		}
		
		//render upgrade number
		str = (this.weapon.upgradeMoney).toString();
		offsetX = this.rightIcon.x + 25 - (28-str.length*7)*0.5;
		var offsetY = this.rightIcon.y + 30;
		for(var i = str.length - 1; i >= 0; i--)
		{
			var frame = ImageManager.font.darkdigit[Number(str[i])];
			frame.disObj.scaleX = frame.disObj.scaleY = 0.7;
			frame.render(context, p.x + offsetX, p.y + offsetY);
			offsetX -= frame.disObj.regX*0.7-1;
		}
	}	
}
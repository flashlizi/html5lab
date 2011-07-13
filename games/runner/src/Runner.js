/**
 * Field Runner
 */

Runner = {};

var imageURLs =["images/grasslands_grid_s.png", 
				"images/gatling_01.png", 
				"images/gatling_02.png", 
				"images/soldier_01.png",
				"images/font.png",
				"images/other.png"];

var bgURLs = ["sounds/grasslands.ogg",
			  "sounds/grasslands.mp3"];

var loaded = 0;

var canvas;
var context;
var stage;
var scene;
var gatling;
var scoreBar;

//soldier AI
var soldierStartX = 0;
var soldierStartY = 315;
var soldierInterval;
//fps
var frames = 0;
var lastTime = 0;
var fpsInterval;
//player
var player;
//weapon factory
var weaponFactory;
//enemy factory
var enemyFactory;
//control button
var controlBtn;
var fastBtn;
var selectedWeapon;
var weaponTool;
var defaultWeapons;

var bgSound;


Runner.startup = function()
{
	Runner.loadImage();
}

Runner.loadImage = function()
{
	var img = new Image();
	img.onload = Runner.imgLoadHandler;
	img.src = imageURLs.shift();
	ImageManager.push(img);
	document.getElementById("status").innerHTML = "Loading(" + loaded + "/6)" + ": " + img.src;
}

Runner.imgLoadHandler = function(e)
{
	loaded++;
	if(imageURLs.length > 0) Runner.loadImage();
	else 
	{		
		document.getElementById("status").innerHTML = "";
		document.getElementById("main").style.backgroundImage = "url("+ImageManager[0].src+")";
		window.Astar = casual.Astar;

		//init canvas
		canvas = document.getElementById("canvas");
		canvas.width = 1200;
		canvas.height = 580;
		//disabled canvas right menu
		canvas.oncontextmenu = function(){return false;};
		context = canvas.getContext("2d");
		//ready, go
		ImageManager.init();
		Runner.createGame();
	}
}

Runner.createGame = function()
{
	//create stage
	stage = new Stage(context);
	stage.setFrameRate(25);
	stage.traceMouseTarget = false;
	
	/*/
	var soldier = new MovieClip();
	soldier.addFrame(ImageManager.soldier.deathTopForwards);
	soldier.x = 500;
	soldier.y = 250;
	stage.addChild(soldier);
	return;
	//*/
	
	//main scene
	scene = new Sprite();
	scene.id = "scene";
	scene.x = 0;
	scene.y = 0;
	stage.addChild(scene);
	
	//player
	player = new Player(scene);
	
	//weapon tool
	weaponTool = new WeaponTool(stage, player);
	
	//weapon factory
	weaponFactory = new WeaponFactory(stage, player, weaponTool);
	weaponFactory.x = 1100;
	weaponFactory.y = 495;
	weaponFactory.updateWeapon();
	stage.addChild(weaponFactory);
	
	//score bar
	scoreBar = new ScoreBar(player);
	scoreBar.x = 5;
	scoreBar.y = 5;
	scoreBar.score = player.score;
	stage.addChild(scoreBar);
	
	//control button
	controlBtn = new MovieClip(ImageManager.icon.control);
	controlBtn.stop();
	controlBtn.x = 20;
	controlBtn.y = 530;
	controlBtn.name = "controlBtn";
	stage.addChild(controlBtn);

	//fast forward button
	fastBtn = new MovieClip(ImageManager.icon.fastForward);
	fastBtn.stop();
	fastBtn.x = controlBtn.x + 45;
	fastBtn.y = controlBtn.y + 4;
	fastBtn.name = "fastBtn";
	stage.addChild(fastBtn);
	
	//enemy factory
	enemyFactory = new EnemyFactory(scene, player);
	
	//default weapons
	if(defaultWeapons)
	{
		for(var i = 0; i < defaultWeapons.length; i++)
		{		
			var gatling = new Gatling();
			gatling.x = player.startPoint[0] + defaultWeapons[i][0] * player.tileWidth;
			gatling.y = player.startPoint[1] + defaultWeapons[i][1] * player.tileHeight;
			gatling.tx = defaultWeapons[i][0];
			gatling.ty = defaultWeapons[i][1];
			scene.addChild(gatling);
			player.weapons.push(gatling);
		}
		player.path = player.buildPath();
	}
	
	/*/test
	var s = new Soldier();
	s.x = player.startPoint[0] + 3 * 60;
	s.y = player.startPoint[1] + 3 * 60;
	s.setDirection([-1,0]);
	//s.animateDeath();
	scene.addChild(s);
	//*/
	
	//fps monitor
	fpsInterval = setInterval(Runner.showFPS, 1000);	
	
	stage.addEventListener(StageEvent.ENTER_FRAME, Runner.enterFrameHandler);	
	stage.addEventListener(StageEvent.MOUSE_DOWN, Runner.mouseDownHandler);
	//stage.addEventListener(StageEvent.MOUSE_MOVE, Runner.mouseMoveHandler);
	//stage.addEventListener(StageEvent.MOUSE_UP, Runner.mouseUpHandler);

	//background music
	var isGECKO = (/GECKO/).test(window.navigator.userAgent.toUpperCase());	
	if(isGECKO) 
	{
		bgSound = new casual.Audio(bgURLs[0], true, true);
		bgSound._element.addEventListener("ended", function(){this.play();}, false);
	}else 
	{
		bgSound = new casual.Audio(bgURLs[1], true, true);
	}
}

Runner.enterFrameHandler = function(e)
{
	//for fps monitor
	frames++;
	
	//game over
	if(player.life == 0)
	{
		Runner.gameOver();
		return;
	}
	
	//continue to get new wave of enemies to run
	if(player.targets.length == 0 && !enemyFactory.started && !stage.getPaused())
	{
		enemyFactory.nextRound();
		return;
	}
	
	player.autoAttack();
	weaponFactory.updateWeapon();	
	//Runner.gameOver();
}

Runner.gameOver = function()
{
	//stop stage rendering
	stage.setPaused(true);
	//stop enemy
	enemyFactory.started = false;
	enemyFactory.stop();
	
	//draw a transparent modal layer
	context.globalAlpha = 0.7;
	context.fillStyle = "#000000";
	context.fillRect(0,0,context.canvas.width, context.canvas.height);
	context.globalAlpha = 1.0;
	
	//show GAME OVER!
	var x = 500;
	var y = 250;
	var over = "GAME OVER!";
	for(var i = 0; i < over.length; i++)
	{
		var c = over[i];
		if(c == " ")
		{
			x += 15;
			continue;
		}else if(c == "!")
		{
			c = "em";
		}
		var frame = ImageManager.font.eng[c];
		frame.render(context, x, y);
		x += frame.disObj.width - 5;
	}
	
	//show tip
	context.fillStyle = "#d89304";
	context.font = "10px verdana";
	context.fillText("(Click anywhere to play again)", 515, y + 30);
}

Runner.mouseDownHandler = function(e)
{	
	if(player.life <= 0)
	{
		//restart the game
		player.reset();	
		player.money = 100;
		scene.removeAllChildren();
		Gatling.level = 0;
		Soldier.level = 0;
		stage.setPaused(false);
		enemyFactory.count = 0;
		enemyFactory.round = 0;
		enemyFactory.started = false;
	}else
	{		
		var obj = stage.getObjectUnderPoint(e.mouseX, e.mouseY, true);
		//var obj = stage.mouseTarget;
		//trace("select:", obj, e.mouseX, e.mouseY);
		
		if(obj == controlBtn)
		{
			//resume or pause game
			if(stage.getPaused())
			{
				controlBtn.gotoAndStop(1);
				stage.setPaused(false);
				enemyFactory.resume();
			}else
			{
				controlBtn.gotoAndStop(2);
				stage.setPaused(true, true);
				enemyFactory.stop();
			}
		}else if(obj == fastBtn)
		{
			if(fastBtn.currentFrame == 1)
			{
				stage.setFrameRate(50);
				fastBtn.gotoAndStop(2);
				player.fastForward = 2;
			}else
			{
				stage.setFrameRate(25);
				fastBtn.gotoAndStop(1);
				player.fastForward = 1;
			}
			
		}else if(obj instanceof Gatling)
		{			
			//draw radius for selected weapon
			selectedWeapon = obj;
			//obj.drawRadius(true);
			weaponTool.show(selectedWeapon, true, true);
			return;
		}else if(obj && obj.name == "sellIcon")
		{
			player.money += selectedWeapon.sellMoney;
			player.removeWeapon(selectedWeapon);
			scene.removeChild(selectedWeapon);
			weaponTool.remove();
			selectedWeapon = null;	
			return;
		}else if(obj && obj.name == "upgradeIcon")
		{
			player.money -= selectedWeapon.upgradeMoney;
			selectedWeapon.upgrade();
			weaponTool.remove();
			selectedWeapon = null;
			return;
		}else if(obj && obj.name == "upgradeDisabledIcon")
		{
			return;
		}
		
		//unselect weapon
		if(selectedWeapon) weaponTool.remove();
	}
}

Runner.mouseMoveHandler = function(e)
{
	//
}

Runner.mouseUpHandler = function(e)
{
	//stage.stopDrag();
}

Runner.showFPS = function()
{	
	var nowTime = new Date().getTime();
	var fps = frames * 1000 / (nowTime - lastTime);
	lastTime = nowTime;
	frames = 0;
	document.getElementById("status").innerHTML = "FPS: " + fps.toFixed(1);
}
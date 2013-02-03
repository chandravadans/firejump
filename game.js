var width = (window.innerWidth), 
	height = (window.innerHeight),
	gLoop,
	points = 0,
	state = true,
	c = document.getElementById('c'), 
	ctx = c.getContext('2d');
    var flag=0;			
	c.width = width;
	c.height = height;
	var lives=3;

	var highsc=parseInt($.jStorage.get("hiscore", "-999"));
	if(highsc=="-999")
{
	$.jStorage.set("hiscore","0");
	highsc=0;
}


	var audiojump = document.createElement("audio");
	audiojump.src = "jump.wav";

	var audiobonus = document.createElement("audio");
	audiobonus.src = "wohoo.wav";//add SOUND

	var audiolifeboard = document.createElement("audio");
	audiolifeboard.src = "yess.wav";


var roundRect=function (ctx, x, y, width, height, radius, fill, stroke) 
{
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
}


var clear = function(){
	ctx.fillStyle = '#000000'//'#d0e7f9';
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	ctx.fill();
}

var howManyCircles = 50, circles = [];

for (var i = 0; i < howManyCircles; i++) 
	circles.push([(Math.random() * width), (Math.random() * height), Math.random() * 3, 0.3+Math.random()]);

var DrawCircles = function(){
	for (var i = 0; i < howManyCircles; i++) {
		ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
		ctx.beginPath();
		ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	}
};

var MoveCircles = function(e){
	for (var i = 0; i < howManyCircles; i++) {
		if (circles[i][1] - circles[i][2] > height) {
			circles[i][0] = Math.random() * width;
			circles[i][2] = Math.random() * 3;
			circles[i][1] = 0 - circles[i][2];
			circles[i][3] = 0.3+Math.random();
		}
		else {
			circles[i][1] += e;
		}
	}
};

var player = new (function(){
	var that = this;
	that.image = new Image();

	that.image.src = "foxy.png"
	that.width = 65;
	that.height = 95;
	that.frames = 1;
	that.actualFrame = 0;
	that.X = 0;
	that.Y = 0;	

	that.isJumping = false;
	that.isFalling = false;
	that.jumpSpeed = 0;
	that.fallSpeed = 0;
	
    that.jump = function() {
		if (!that.isJumping && !that.isFalling) {
			that.fallSpeed = 0;
			that.isJumping = true;
			that.jumpSpeed = 17;
		}
	}
	
	that.checkJump = function() {
		//a lot of changes here
				
		if (that.Y > height*0.4) {
			that.setPosition(that.X, that.Y - that.jumpSpeed);		
		}
		else {
			if (that.jumpSpeed > 10) 
			{
				points++;
				if(points%100==0)
					flag++;
			}
			// if player is in mid of the gamescreen
			// dont move player up, move obstacles down instead
			MoveCircles(that.jumpSpeed * 0.5);
			
			platforms.forEach(function(platform, ind){
				platform.y += that.jumpSpeed;

				if (platform.y > height) {
					var type = ~~(Math.random() * 5);
					if (type == 0) 
						type = 1;
					else 
						type = 0;
					if(flag)		//Lifeboard
					{
						platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, 2);
						flag=0;
					}
					else
						platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);

					
				}
			});
		}
		
		
		that.jumpSpeed--;
		if (that.jumpSpeed == 0) {
			that.isJumping = false;
			that.isFalling = true;
			that.fallSpeed = 1;
		}
	
	}
	
	that.fallStop = function(){
		that.isFalling = false;
		that.fallSpeed = 0;
		that.jump();	
	}
	
	that.checkFall = function(){
		if (that.Y < height - that.height) {
			that.setPosition(that.X, that.Y + that.fallSpeed);
			that.fallSpeed++;
		} else {
			if (points == 0) 
				that.fallStop();
			else
			{
				that.fallStop();
				lives--;
				if(lives==0)
					GameOver();
			}
		}
	}
	
	that.moveLeft = function(){
		if (that.X > 0) {
			that.setPosition(that.X - 5, that.Y);
		}
	}
	
	that.moveRight = function(){
		if (that.X + that.width < width) {
			that.setPosition(that.X + 5, that.Y);
		}
	}

	
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	that.interval = 0;
	that.draw = function(){
		try {
			ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
		} 
		catch (e) {
		};
		
		if (that.interval == 4 ) {
			if (that.actualFrame == that.frames) {
				that.actualFrame = 0;
			}
			else {
				that.actualFrame++;
			}
			that.interval = 0;
		}
		that.interval++;		
	}
})();


player.setPosition(~~((width-player.width)/2), height - player.height);
player.jump();

document.onmousemove = function(e){
	if (player.X + c.offsetLeft > e.pageX) {
		player.moveLeft();
	} else if (player.X + c.offsetLeft < e.pageX) {
		player.moveRight();
	}
	
}
	var nrOfPlatforms = 5, 
		platforms = [],
		platformWidth = 70,
		platformHeight = 20;
		 
	var Platform = function(x, y, type){
		var that=this;
		
		that.firstColor = '#FF8C00';
		that.secondColor = '#EEEE00';
		//that.patt=patt1;
		that.onCollide = function()
		{
			audiojump.play();
			player.fallStop();
		};
		
		if (type === 1) 
		{
			//Spring board
			that.firstColor = '#00CC66';
			that.secondColor = '#33FF99';
			//that.patt=patt2;

			that.onCollide = function(){
				audiobonus.play();
				player.fallStop();
				player.jumpSpeed = 50;
			};
		}
		if(type===2)
		{
			//Life Board
			that.firstColor = '#3399CC';
			that.secondColor = '#3366CC';
			//that.patt=patt2;

			that.onCollide = function()
			{

				audiolifeboard.play();
				player.fallStop();
				player.jumpSpeed=30;
				ctx.fillStyle = '#000000'//'#d0e7f9';
				lives++;
			};

		}
		
		

		that.x = ~~ x;
		that.y = y;
		that.type = type;
		
		that.isMoving = ~~(Math.random() * 2);
		that.direction= ~~(Math.random() * 2) ? -1 : 1;
			
		that.draw = function(){
			ctx.fillStyle = 'rgba(255, 255, 255, 1)';
			var gradient = ctx.createRadialGradient(that.x + (platformWidth/2), that.y + (platformHeight/2),5, that.x + (platformWidth/2), that.y + (platformHeight/2), 20);
			gradient.addColorStop(0, that.firstColor);
			gradient.addColorStop(1, that.secondColor);
			ctx.fillStyle = gradient;
			//var x=ctx.createPattern(img1,"no-repeat");
			ctx.fillStyle=gradient;
			//ctx.fillStyle=that.patt;
			ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
			//roundRect(that.x,that.y,platformWidth,platformHeight,3,true,true);
		};
	
		return that;
	};
		
	var generatePlatforms = function(){
		var position = 0, type;
		for (var i = 0; i < nrOfPlatforms; i++) {
			type = ~~(Math.random()*5);
			if (type == 0) 
				type = 1;
			else 
				type = 0;
			platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
			if (position < height - platformHeight) 
				position += ~~(height / nrOfPlatforms);
		}
	}();
	
	var checkCollision = function(){
	platforms.forEach(function(e, ind){
		if (
		(player.isFalling) && 
		(player.X < e.x + platformWidth) && 
		(player.X + player.width > e.x) && 
		(player.Y + player.height > e.y) && 
		(player.Y + player.height < e.y + platformHeight)
		) {
			e.onCollide();
		}
	})
	}

var GameLoop = function(){
	clear();
	//MoveCircles(5);
	DrawCircles();

	if (player.isJumping) player.checkJump();
	if (player.isFalling) player.checkFall();
	
	player.draw();
	
	platforms.forEach(function(platform, index){
		if (platform.isMoving) {
			if (platform.x < 0) {
				platform.direction = 1;
			} else if (platform.x > width - platformWidth) {
				platform.direction = -1;
			}
				platform.x += platform.direction * (index / 2) * ~~(points / 100);
			}
		platform.draw();
	});
	
	checkCollision();
	
	ctx.fillStyle = "White";
	ctx.fillText("Points:" + points, 10, height-10);

	ctx.fillStyle = "White";
	ctx.fillText("Lives:" + lives, 90, height-10);

	ctx.fillStyle = "White";
	if(points>highsc)
		highsc=points;
	ctx.fillText("High:"+highsc, 150, height-10);
	
	if (state)
		gLoop = setTimeout(GameLoop, 1000 / 50);
}

	var GameOver = function(){
		state = false;

	clearTimeout(gLoop);
	setTimeout(function()
			{
			clear();
			ctx.fillStyle = "White";
			ctx.font = "10pt Arial";
			ctx.fillText("End of journey!", width / 2 - 60, height / 2 - 50);
			ctx.fillText("Foxy is " + points+" steps ", width / 2 - 60, height / 2 - 30);
			ctx.fillText("closer to understanding the universe! ", width / 2 - 60, height / 2 - 10);
			}, 100);
	
	$.jStorage.set("hiscore",highsc);

			//ClearAudio();
			var audioend = document.createElement("audio");
			audioend.src = "bgmus.wav";
			audioend.play();


			var rstrt=document.getElementById("overlay");
			rstrt.hidden=false;
			rstrt.style.position = 'absolute';
			rstrt.style.left = window.innerWidth * 0.5 -60;
			rstrt.style.top =  window.innerHeight * 0.5+30;
		
		
	};
	
GameLoop();

var GameRestart = function(){
	window.location.reload();
	document.getElementById("overlay").hidden=true;
	return false;
}

//作业：子弹达到敌机，但是敌机还没挂掉的效果加上。
var context;
var cW=320, cH=480;


window.onload = init;
window.onmousemove = mouseMoveHandler;

//初始化函数
function init(){ 
    var canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');
    log(context);
    //背景图片加载
    bg = loadImage('res/bg03.jpg');
    bg2 = loadImage('res/bg03.jpg');
    crtBg = bg;
    nextBg = bg2;
    //玩家图片加载
    player = loadImage('res/ship01.png');
    attachImage = loadImage('res/explode_3.png');
    
    loadExplosionImages();
    
    bgMusic = loadAudio("res/sfx/bgMusic.mp3");
    bgMusic.play();
    fireEffect = loadAudio("res/sfx/fireEffect.mp3");
    explodeEffect = loadAudio("res/sfx/explodeEffect.mp3");
    
    setInterval(loop,1000/30);
}

//----------------------游戏循环逻辑----------------------------

var count=0;
//主循环逻辑
function loop(){
    count++;
    clearScreen();
    drawBG();
    drawPlayer();
    if(count%5==0) {
    	playerShoot(0,0);
    }
    drawPlayerBullets();
    if(count%30==0) {
    	spawnEnemy();
    }
    drawEnemy();
    
    hitTest();
    
    drawExplosion();
}

//-------------------------玩家控制------------------------------
var player;
var playerWidth = 47.5;
var playerHeight = 54;
var playerX = 100 ,playerY = 300;
var playerIndex = 0;
//绘制玩家
function drawPlayer(){ 
    var playerClipX = playerWidth * playerIndex;
    context.drawImage(player,
                      playerClipX,
                      0,
                      playerWidth,
                      playerHeight,
                      playerX,
                      playerY,
                      playerWidth,
                      playerHeight);
    playerIndex = (playerIndex + 1) % 4; 
}

//鼠标移动处理
function mouseMoveHandler(e){
    //playerX = e.x - playerWidth /2;  这里的注释掉的代码可以用在chrome和ie11，但ff不可用，下面的代码可以用在ff,chrome,ie11
    //playerY = e.y - playerHeight / 2;
    var x = e.clientX > 320 ? 320 : e.clientX;
    var y = e.clientY > 450 ? 450 : e.clientY;
    playerX = x - playerWidth / 2;
    playerY = y - playerHeight / 2;
//  log("鼠标移动后：clientX："+e.clientX+"，clientY："+e.clientY+"，playerWidth:"+playerWidth+",playerHeight:"+playerHeight+",e.x:"+e.x        +",e.y:"+e.y+",playerX:"+playerY+",playerY:"+playerY);
}
//--------------------------音效---------------------
var bgMusic, fireEffect, explodeEffect;


//--------------------------爆炸效果---------------------

var explosionImages = []; //爆炸效果图片数组
//加载爆炸效果图片
function loadExplosionImages(){
	for (var i=1;i<36;i++) {
		var n = i<10 ? "0"+i : i;
		var img = loadImage("res/explosion/explosion_" + n + ".png");
		explosionImages.push(img);
	}
}

var explosionArr = [];  //爆炸效果数组
// 在制定位置添加爆炸效果
function explode(x,y){
	var explosion = {x:x,y:y,crtIndex:1};
	explosionArr.push(explosion);
}

function drawExplosion(){
	for (var i=explosionArr.length-1;i>=0;i--) {
		var explosion = explosionArr[i];
		if(explosion.crtIndex>=35){
			explosionArr.splice(i);
			continue;
		}
		var img = explosionImages[explosion.crtIndex];
		context.drawImage(img,explosion.x-img.width*0.5,explosion.y-img.height*0.5);
		explosion.crtIndex++;
	}
}

//--------------------------碰撞检测---------------------
function hitTest(){
	testPlayBulletAndEnemies();
}

function testPlayBulletAndEnemies(){
	for (var i=playerBullets.length-1;i>=0;i--) {
		var bullet = playerBullets[i];
		for (var j=enemyArr.length-1;j>=0;j--) {
			var enemy = enemyArr[j];
			var hit = hitTestObject(enemy,bullet);
			if(hit){
				playerBullets.splice(i,1);
				
				enemy.hp -= 20;
				if(enemy.hp<=0){
					enemyArr.splice(j,1);
					explode(enemy.x+enemy.img.width*0.5,enemy.y+enemy.img.height*0.5);
					fireEffect.play();
				}else{
					enemy.hitTimes = enemy.hitTimes % 6; 
					drawAttachEffect(enemy.hitTimes>3?3:enemy.hitTimes,enemy.x+enemy.img.width*0.5,enemy.y+enemy.img.height*0.5);
					enemy.hitTimes++;
				}
				break;
			}
		}
	}
}

var attachImage;
// 绘制打击效果
function drawAttachEffect(hitTimes,x,y){
	var j = 3-hitTimes;
	for (var i = 3; i >=0; i--) {
		context.drawImage(attachImage,
              i*64,
              j*64,
              64,
              64,
              x-attachImage.width*0.125,
              y-attachImage.height*0.125,
              64,
              64);
	}
}

//检测物体碰撞
function hitTestObject(obj1,obj2){
	return hitTestPoint(obj1.x,obj1.y,obj1.img.width,obj1.img.height,obj2.x,obj2.y);
}

function hitTestPoint(x1,y1,w1,h1,x2,y2){
	if (x2>=x1 && x2<=x1+w1 && y2>=y1 && y2<=y1+h1) {
		return true;
	} else{
		return false;
	}
}

//--------------------------敌人飞机---------------------
var enemyArr = [];
//生成敌人
function spawnEnemy(){
	var enemy = {};
	var i = parseInt(Math.random() * 6);
	enemy.img = loadImage("res/Enemy/E"+i+".png");
	enemy.x = 320 * Math.random();
	enemy.y = -50;
	enemy.vx = 0;
	enemy.vy = 1 + 5 * Math.random();
	enemy.hp = 20*(i+1);
	enemy.hitTimes = 0;
	
	enemyArr.push(enemy);
}
//绘制敌人
function drawEnemy(){
	for (var i=enemyArr.length-1;i>=0;i--) {
		var enemy = enemyArr[i];
		enemy.x += enemy.vx;
		enemy.y += enemy.vy;
		if(enemy.y>400){
			enemyArr.splice(i,1);
			continue;
		}
		
		context.drawImage(enemy.img, enemy.x, enemy.y);
	}
}



//--------------------------玩家发射子弹---------------------
var playerBullets = []; //子弹数组
function playerShoot(xOff,yOff){
	fireEffect.play();
	
    var bullet = {};
    bullet.img = loadImage('res/bullet/bullet01.png');
    bullet.x = playerX + 14 + xOff;
    bullet.y = playerY - 14 + yOff;
    bullet.vx = 0;
    bullet.vy = -8;
    bullet.damage = 10;
    
    playerBullets.push(bullet);
}

//绘制子弹
function drawPlayerBullets() {
    for (var i = playerBullets.length - 1; i>=0; i--) {
        var bullet = playerBullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        if (bullet.y < 10) {
            playerBullets.splice(i,1);
            continue;
        }
        context.drawImage(bullet.img, bullet.x, bullet.y);
    }
}


//------------------------背景滚动------------------------------

var bg,bg2;
var bgMoveSpeed = 2;
var crtBgY = -160;
var crtBg,nextBg; //当前图片及下一张图片
//背景滚动
function drawBG(){
    crtBgY += bgMoveSpeed;
    context.drawImage(crtBg,0,crtBgY);
    context.drawImage(nextBg,0,crtBgY-640);
    
    if (crtBgY > cH) {
        if (crtBg == bg) {
            crtBg = bg2;
            nextBg = bg;
        }else{
            crtBg = bg;
            nextBg = bg2;
        }
        crtBgY = crtBgY-640;
    }
}

//-----------------------------------公共方法-------------------------

//加载图片
function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}

//加载声音
function loadAudio(src) {
    var a = new Audio();
    a.src = src;
    return a;
}

//清空画布
function clearScreen(){
    context.clearRect(0,0,cW,cH);
}

//日志函数
function log(s){console.log(s);}


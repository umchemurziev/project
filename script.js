var a = document.querySelector(".input_a");
var b = document.querySelector(".input_b");
var c = document.querySelector(".input_c");
var buttom = document.querySelector("#submit");

var ctx=canvas.getContext("2d");
ctx.fillStyle="#ccc";
for(var i=0;i<canvas.width;i+=10)ctx.fillRect(i,0,1,canvas.height);
for(var i=0;i<canvas.height;i+=10)ctx.fillRect(0,i,canvas.height,1);

function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    ctx.stroke();
}

canvas_arrow(ctx, 0, canvas.height/2, canvas.width, canvas.height/2); // Рисуем ось x
canvas_arrow(ctx, canvas.width/2, canvas.height, canvas.width/2, 0); // Рисуем ось y

ctx.font = "20px Arial"; // Рисуем x
ctx.fillStyle = "black";
ctx.fillText("x", canvas.width-25, canvas.height/2+25);

ctx.font = "20px Arial"; // Рисуем y
ctx.fillStyle = "black";
ctx.fillText("y", canvas.width/2+20, 0+25);

function draw(a, b, c) {
	for(var i=-20;i<20;i+=0.01){
     ctx.fillStyle="blue"; // цвет квадратической параболы
     ctx.fillRect(200+i*10,ctx.height-(Math.pow(i,2)*a+i*b+c),1,1);
     }
}

console.log(a.value);
buttom.onclick = () => {
	console.log(a.value);
	draw(a.value, b.value ,c.value);
}


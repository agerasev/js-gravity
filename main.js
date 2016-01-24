var App = {
	canvas: null,
	width: 300,
	height: 150,
	anim: true,
	timer: null,
}

function pageToWorld(v) {
	return Vec2.create(v.x - 0.5*App.width, 0.5*App.height - v.y);
}

function worldToPage(v) {
	return Vec2.create(v.x + 0.5*App.width, 0.5*App.height - v.y);
}

function drawPlanet(p) {
	var ctx = App.canvas.getContext("2d");
	
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.beginPath();
	var ppos = worldToPage(p.pos);
	ctx.arc(ppos.x, ppos.y, p.rad, 0, 2*Math.PI);
	ctx.fill();
}

function render(ticks) {
	//console.log("[info] render " + (ticks - App.ticks));

	var ctx = App.canvas.getContext("2d");
	ctx.fillStyle = "rgba(0,0,0,0.05)";
	ctx.fillRect(0,0,App.width,App.height);

	for(i = 0; i < Planets.length; ++i) {
		drawPlanet(Planets[i]);
	}

	window.requestAnimationFrame(render);
}

function pause() {
	console.log("[info] pause");

	clearInterval(App.timer);

	var bp = $("#button_pause");
	bp.html("Resume");
	bp.off("click");
	bp.on("click", resume);
}

function resume() {
	console.log("[info] resume");

	App.timer = setInterval(function() {
		solve(0.01);
		removeExoplanets(2*Math.sqrt(App.width*App.width + App.height*App.height));
		//mergePlanets();
	}, 10);

	var bp = $("#button_pause");
	bp.html("Pause");
	bp.off("click");
	bp.on("click", pause);
}

function resize() {
	App.width = $(window).width();
	App.height = $(window).height();

	App.canvas.width = App.width;
	App.canvas.height = App.height;

	$("#button_pause").offset({left: 8, top: 8});
	$("#panel_main").offset({left: App.width - $(panel_main).width() - 8, top: 8});

	console.log("[info] resize {" + App.width + ", " + App.height + "}");
}

var mouse_down, mouse_up, draw_arrow = false;
function ready() {
	console.log("[info] ready");

	App.canvas = document.getElementById("canvas_main");
	$("#canvas_main")
	.mousedown(function(e) {
		mouse_down = Vec2.create(e.pageX, e.pageY);
		draw_arrow = true;
	})
	.mouseup(function(e) {
		mouse_up = pageToWorld(Vec2.create(e.pageX, e.pageY));
		mouse_down = pageToWorld(mouse_down);
		draw_arrow = false;
		var p = Planet.create(125, mouse_down, Vec2.sub(mouse_up, mouse_down));
		Planets[Planets.length] = p;
	})
	.mousemove(function(e) {
		mouse_up = Vec2.create(e.pageX, e.pageY);
	});

	$("#button_momentum").click(function() {
		zeroMomentum();
	});
	$("#button_barycenter").click(function() {
		zeroBarycenter();
	});

	resize();

	window.requestAnimationFrame(render);
	resume();
}

$(window).resize(resize);
$(document).ready(ready);
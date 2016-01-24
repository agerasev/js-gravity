var App = {
	canvas: null,
	width: 300,
	height: 150,
	anim: true,
	timer: null,

	// preview
	pre_pos: null, 
	pre_vel: null, 
	draw_path: false,
}

function getNewPlanet() {
	var m = parseFloat(document.getElementById("input_mass").value);
	if(m == m && m > 1.0) {
		return Planet.create(
			m, App.pre_pos, App.pre_vel, 
			document.getElementById("input_color").value
			);
	}
	return null;
}

function pageToWorld(v) {
	return Vec2.create(v.x - 0.5*App.width, 0.5*App.height - v.y);
}

function worldToPage(v) {
	return Vec2.create(v.x + 0.5*App.width, 0.5*App.height - v.y);
}

function drawPlanet(p) {
	var ctx = App.canvas.getContext("2d");
	
	ctx.fillStyle = p.color;
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
	//ctx.clearRect(0,0,App.width,App.height);

	if(App.draw_path) {
		var p = getNewPlanet();
		if(p != null) {
			drawPlanet(p);
			/*
			for(var i = 0; i < 10; ++i) {
				p = solveSingle(p,0.01,10);
				drawPlanet(p);
			}
			*/
		}
	}

	for(var i = 0; i < Planets.length; ++i) {
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
		mergePlanets();
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
	$("#panel_main").offset({left: App.width - $(panel_main).outerWidth() - 8, top: 8});

	console.log("[info] resize {" + App.width + ", " + App.height + "}");
}

function ready() {
	console.log("[info] ready");

	App.canvas = document.getElementById("canvas_main");
	$("#canvas_main")
	.mousedown(function(e) {
		App.pre_pos = pageToWorld(Vec2.create(e.pageX, e.pageY));
		App.draw_path = true;
		e.preventDefault();
	})
	.mouseup(function(e) {
		var end = pageToWorld(Vec2.create(e.pageX, e.pageY));
		App.pre_vel = Vec2.sub(end, App.pre_pos);
		var p = getNewPlanet();
		if(p != null)
			Planets[Planets.length] = p;
		App.draw_path = false;
		App.pre_pos = null;
	})
	.mousemove(function(e) {
		if(App.pre_pos != null) {
			var end = pageToWorld(Vec2.create(e.pageX, e.pageY));
			App.pre_vel = Vec2.sub(end, App.pre_pos);
		}
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
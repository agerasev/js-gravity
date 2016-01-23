var App = {
	canvas: null,
	width: 300,
	height: 150,
	ticks: 0.0,
	anim: false,
}

var Planet = {};
Planet.create = function(mass, pos, vel) {
	pos = (pos == undefined) ? Vec2.create() : pos;
	vel = (vel == undefined) ? Vec2.create() : vel;
	return {
		pos: pos, 
		vel: vel, 
		rad: Math.pow(mass, 1.0/3.0), 
		mass: mass,

		pos_eff: pos,
		vel_eff: vel,
		pos_deriv: [],
		vel_deriv: [],
	};
};

function drawPlanet(p) {
	var ctx = App.canvas.getContext("2d");
	
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.beginPath();
	ctx.arc(p.pos.x + App.width/2.0, App.height/2 - p.pos.y, p.rad, 0, 2*Math.PI);
	ctx.fill();
}

var g = 8e8;

var Planets = [
	Planet.create(8000, Vec2.create(0,0), Vec2.create(0,-1)),
	Planet.create(125, Vec2.create(-300, 0), Vec2.create(0,64)),
];

function compute_deriv(k) {
	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.vel_deriv[k] = Vec2.create();
	}

	for(i = 0; i < Planets.length; ++i) {
		for(j = 0; j < i; ++j) {
			var a = Planets[i];
			var b = Planets[j];

			var d = Vec2.sub(b.pos_eff, a.pos_eff);
			var l = Math.sqrt(Vec2.dot(d,d));
			var f = Vec2.mul(Vec2.div(d, l*l*l), g);

			a.vel_deriv[k] = Vec2.add(a.vel_deriv[k], Vec2.div(f, a.mass));
			b.vel_deriv[k] = Vec2.sub(b.vel_deriv[k], Vec2.div(f, b.mass));
		}
	}

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_deriv[k] = Vec2.clone(p.vel_eff);
	}
}

/* Solver uses the Runge-Kutta method */
function solve(dt) {
	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.clone(p.pos);
		p.vel_eff = Vec2.clone(p.vel);
	}

	compute_deriv(0);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[0], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[0], 0.5*dt));
	}

	compute_deriv(1);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[1], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[1], 0.5*dt));
	}

	compute_deriv(2);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[2], dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[2], dt));
	}

	compute_deriv(3);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos = Vec2.add(p.pos, Vec2.mul(
			Vec2.add(Vec2.add(p.pos_deriv[0], p.pos_deriv[3]), Vec2.mul(Vec2.add(p.pos_deriv[1], p.pos_deriv[2]), 2.0)), 
			dt/6.0));
		p.vel = Vec2.add(p.vel, Vec2.mul(
			Vec2.add(Vec2.add(p.vel_deriv[0], p.vel_deriv[3]), Vec2.mul(Vec2.add(p.vel_deriv[1], p.vel_deriv[2]), 2.0)), 
			dt/6.0));
	}
}

function render(ticks) {
	//console.log("[info] render " + (ticks - App.ticks));
	if(App.ticks < 0.0)
		App.ticks = ticks;

	solve(0.001*(ticks - App.ticks));

	var ctx = App.canvas.getContext("2d");
	ctx.fillStyle = "rgba(0,0,0,0.05)";
	ctx.fillRect(0,0,App.width,App.height);

	for(i = 0; i < Planets.length; ++i) {
		drawPlanet(Planets[i]);
	}

	App.ticks = ticks;
	if(App.anim)
		window.requestAnimationFrame(render);
}

function pause() {
	console.log("[info] pause");

	App.anim = false;

	var bp = $("#button_pause");
	bp.html("Resume");
	bp.off("click");
	bp.on("click", resume);
}

function resume() {
	console.log("[info] resume");

	App.anim = true;
	App.ticks = -1.0;
	window.requestAnimationFrame(render);

	var bp = $("#button_pause");
	bp.html("Pause");
	bp.off("click");
	bp.on("click", pause);
}

function resize() {
	App.width = $(window).width();
	App.height = $(window).height();
	if(App.canvas) {
		App.canvas.width = App.width;
		App.canvas.height = App.height;
	} else {
		console.log("[error] canvas is null");
	}
	console.log("[info] resize {" + App.width + ", " + App.height + "}");
}

function ready() {
	console.log("[info] ready");

	App.canvas = document.getElementById("canvas_main");
	$("#button_pause").offset({left: 8, top: 8});

	resize();
	resume();
}

$(window).resize(resize);
$(document).ready(ready);
var Planet = {};

function getRadiusByMass(mass) {
	return Math.pow(mass, 1.0/3.0);
}

Planet.create = function(mass, pos, vel, color) {
	pos = (pos == undefined) ? Vec2.create() : Vec2.clone(pos);
	vel = (vel == undefined) ? Vec2.create() : Vec2.clone(vel);
	color = (color == undefined) ? "#FFFFFF" : color;
	return {
		pos: pos, 
		vel: vel, 
		rad: getRadiusByMass(mass), 
		mass: mass,

		pos_eff: Vec2.clone(pos),
		vel_eff: Vec2.clone(vel),
		pos_deriv: [],
		vel_deriv: [],

		color: color,
	};
};

var g = 4e2;
var el = 1e5;

var Planets = [
	Planet.create(8000, Vec2.create(0,0), Vec2.create(0,-1)),
	Planet.create(125, Vec2.create(-300, 0), Vec2.create(0,64), "#00AA00"),
];

function getGravityForce(m0, m1, l) {
	return -g*m0*m1/(l*l);
}

function getElasticForce(r0, r1, l) {
	return el*((r0 + r1) - l);
}

function getForce(a, b) {
	var d = Vec2.sub(b.pos_eff, a.pos_eff);
	var l = Math.sqrt(Vec2.dot(d,d));
	d = Vec2.div(d, l);
	var f = Vec2.create();

	var ml = a.rad + b.rad;
	if(l < ml) { 
		f = Vec2.mul(d, getGravityForce(a.mass, b.mass, ml));
		f = Vec2.mul(d, getElasticForce(a.rad, b.rad, l));
	} else {
		f = Vec2.mul(d, getGravityForce(a.mass, b.mass, l));
	}

	return f;
}

function computeDeriv(k) {
	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.vel_deriv[k] = Vec2.create();
	}

	for(var i = 0; i < Planets.length; ++i) {
		for(var j = 0; j < i; ++j) {
			var a = Planets[i];
			var b = Planets[j];

			var f = getForce(a, b);

			a.vel_deriv[k] = Vec2.sub(a.vel_deriv[k], Vec2.div(f, a.mass));
			b.vel_deriv[k] = Vec2.add(b.vel_deriv[k], Vec2.div(f, b.mass));
		}
	}

	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_deriv[k] = Vec2.clone(p.vel_eff);
	}
}

/* Solver uses the Runge-Kutta method */
function solve(dt) {
	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.clone(p.pos);
		p.vel_eff = Vec2.clone(p.vel);
	}

	computeDeriv(0);

	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[0], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[0], 0.5*dt));
	}

	computeDeriv(1);

	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[1], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[1], 0.5*dt));
	}

	computeDeriv(2);

	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[2], dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[2], dt));
	}

	computeDeriv(3);

	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos = Vec2.add(p.pos, Vec2.mul(
			Vec2.add(Vec2.add(p.pos_deriv[0], p.pos_deriv[3]), Vec2.mul(Vec2.add(p.pos_deriv[1], p.pos_deriv[2]), 2.0)), 
			dt/6.0));
		p.vel = Vec2.add(p.vel, Vec2.mul(
			Vec2.add(Vec2.add(p.vel_deriv[0], p.vel_deriv[3]), Vec2.mul(Vec2.add(p.vel_deriv[1], p.vel_deriv[2]), 2.0)), 
			dt/6.0));
	}
}

function solveSingle(planet, dt, steps) {
	var p = planet;

	p.pos_eff = Vec2.clone(p.pos);
	p.vel_eff = Vec2.clone(p.vel);

	for(var s = 0; s < steps; ++s) {
		for(var i = 0; i < Planets.length; ++i) {
			var f = getForce(Planets[i], p);
			p.vel_eff = Vec2.add(p.vel_eff, Vec2.mul(f, dt/p.mass));
			p.pos_eff = Vec2.add(p.pos_eff, Vec2.mul(p.vel_eff, 0.5*dt));
		}
	}

	p.pos = Vec2.clone(p.pos_eff);
	p.vel = Vec2.clone(p.vel_eff);

	return p;
}

function removeExoplanets(radius) {
	for(var i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		if(Math.sqrt(Vec2.dot(p.pos, p.pos)) > radius) {
			Planets.splice(i,1);
			--i;
		}
	}
	//console.log(Planets.length);
}

function blendColors(c0, c1, p) {
    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
}

function mergePlanets() {
	for(var i = 0; i < Planets.length; ++i) {
		for(var j = 0; j < i; ++j) {
			var a = Planets[i];
			var b = Planets[j];
			
			var d = Vec2.sub(b.pos, a.pos);
			var l = Math.sqrt(Vec2.dot(d,d));
			if(l < 0.5*(a.rad + b.rad)) {
				var mass = a.mass + b.mass;
				b.pos = Vec2.div(Vec2.add(Vec2.mul(a.pos, a.mass), Vec2.mul(b.pos, b.mass)), mass);
				b.vel = Vec2.div(Vec2.add(Vec2.mul(a.vel, a.mass), Vec2.mul(b.vel, b.mass)), mass);
				b.mass = mass;
				b.rad = getRadiusByMass(mass);
				b.color = blendColors(b.color, a.color, a.mass/mass);
				Planets.splice(i,1);
				--i;
				return;
			}
		}
	}
}

function zeroBarycenter() {
	var position = Vec2.create();
	var mass = 0.0;
	for(var i = 0; i < Planets.length; ++i) {
		position = Vec2.add(position, Vec2.mul(Planets[i].pos, Planets[i].mass));
		mass += Planets[i].mass;
	}
	var center = Vec2.div(position, mass);
	for(var i = 0; i < Planets.length; ++i) {
		Planets[i].pos = Vec2.sub(Planets[i].pos, center);
	}
}

function zeroMomentum() {
	var momentum = Vec2.create();
	var mass = 0.0;
	for(var i = 0; i < Planets.length; ++i) {
		momentum = Vec2.add(momentum, Vec2.mul(Planets[i].vel, Planets[i].mass));
		mass += Planets[i].mass;
	}
	var velocity = Vec2.div(momentum, mass);
	for(var i = 0; i < Planets.length; ++i) {
		Planets[i].vel = Vec2.sub(Planets[i].vel, velocity);
	}
}

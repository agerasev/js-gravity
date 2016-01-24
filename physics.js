var Planet = {};

function getRadiusByMass(mass) {
	return 2*Math.pow(mass, 1.0/3.0);
}

Planet.create = function(mass, pos, vel) {
	pos = (pos == undefined) ? Vec2.create() : Vec2.clone(pos);
	vel = (vel == undefined) ? Vec2.create() : Vec2.clone(vel);
	return {
		pos: pos, 
		vel: vel, 
		rad: getRadiusByMass(mass), 
		mass: mass,

		pos_eff: Vec2.clone(pos),
		vel_eff: Vec2.clone(vel),
		pos_deriv: [],
		vel_deriv: [],
	};
};

var g = 4e8;
var el = 4e5;

var Planets = [
	Planet.create(8000, Vec2.create(0,0), Vec2.create(0,-1)),
	Planet.create(125, Vec2.create(-300, 0), Vec2.create(0,64)),
];

function computeDeriv(k) {
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
			var f = Vec2.create();

			var ml = a.rad + b.rad;
			if(l < ml) { 
				var dl = ml - l;
				f = Vec2.add(f, Vec2.mul(Vec2.div(d, ml*ml*l), g)); // Gravity
				f = Vec2.sub(f, Vec2.mul(d, el*dl/l)); // Elasticity
			} else {
				f = Vec2.add(f, Vec2.mul(Vec2.div(d, l*l*l), g)); // Gravity
			}

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

	computeDeriv(0);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[0], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[0], 0.5*dt));
	}

	computeDeriv(1);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[1], 0.5*dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[1], 0.5*dt));
	}

	computeDeriv(2);

	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[2], dt));
		p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[2], dt));
	}

	computeDeriv(3);

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

function removeExoplanets(radius) {
	for(i = 0; i < Planets.length; ++i) {
		var p = Planets[i];
		if(Math.sqrt(Vec2.dot(p.pos, p.pos)) > radius) {
			Planets.splice(i,1);
			--i;
		}
	}
	//console.log(Planets.length);
}

function mergePlanets() {
	for(i = 0; i < Planets.length; ++i) {
		for(j = 0; j < i; ++j) {
			var a = Planets[i];
			var b = Planets[j];
			
			var d = Vec2.sub(b.pos, a.pos);
			var l = Math.sqrt(Vec2.dot(d,d));
			if(l < 2.0*(a.rad + b.rad)) {
				var mass = a.mass + b.mass;
				b.pos = Vec2.div(Vec2.sum(Vec2.mul(a.pos, a.mass), Vec2.mul(b.pos, b.mass)), mass);
				b.vel = Vec2.div(Vec2.sum(Vec2.mul(a.vel, a.mass), Vec2.mul(b.vel, b.mass)), mass);
				b.mass = mass;
				b.rad = getRadiusByMass(mass);
				Planets.splice(i,1);
				--i;
				break;
			}
		}
	}
}

function zeroBarycenter() {
	var position = Vec2.create();
	var mass = 0.0;
	for(i = 0; i < Planets.length; ++i) {
		position = Vec2.add(position, Vec2.mul(Planets[i].pos, Planets[i].mass));
		mass += Planets[i].mass;
	}
	var center = Vec2.div(position, mass);
	for(i = 0; i < Planets.length; ++i) {
		Planets[i].pos = Vec2.sub(Planets[i].pos, center);
	}
}

function zeroMomentum() {
	var momentum = Vec2.create();
	var mass = 0.0;
	for(i = 0; i < Planets.length; ++i) {
		momentum = Vec2.add(momentum, Vec2.mul(Planets[i].vel, Planets[i].mass));
		mass += Planets[i].mass;
	}
	var velocity = Vec2.div(momentum, mass);
	for(i = 0; i < Planets.length; ++i) {
		Planets[i].vel = Vec2.sub(Planets[i].vel, velocity);
	}
}

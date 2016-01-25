var Physics = {
	G:  4e2,
	EL: 1e5,

	borders: {on: true, x: 300.0, y: 150.0},
	gravity: true,
	repulsion: true,
	van_der_vaals: false,

	getGravityForce: function (m0, m1, l) {
		return -Physics.G*m0*m1/(l*l);
	},

	getElasticForce: function (r0, r1, l) {
		return Physics.EL*((r0 + r1) - l);
	},

	getForce: function (a, b) {
		var d = Vec2.sub(b.pos_eff, a.pos_eff);
		var l = Math.sqrt(Vec2.dot(d,d));
		d = Vec2.div(d, l);
		var f = Vec2.create();

		var ml = a.rad + b.rad;
		if(l < ml) { 
			if(Physics.gravity)
				f = Vec2.mul(d, Physics.getGravityForce(a.mass, b.mass, ml));
			if(Physics.repulsion)
				f = Vec2.mul(d, Physics.getElasticForce(a.rad, b.rad, l));
		} else {
			if(Physics.gravity)
				f = Vec2.mul(d, Physics.getGravityForce(a.mass, b.mass, l));
		}

		return f;
	},

	computeDeriv: function (k) {
		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.vel_deriv[k] = Vec2.create();
		}

		for(var i = 0; i < Bodies.length; ++i) {
			for(var j = 0; j < i; ++j) {
				var a = Bodies[i];
				var b = Bodies[j];

				var f = Physics.getForce(a, b);

				a.vel_deriv[k] = Vec2.sub(a.vel_deriv[k], Vec2.div(f, a.mass));
				b.vel_deriv[k] = Vec2.add(b.vel_deriv[k], Vec2.div(f, b.mass));
			}
		}

		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos_deriv[k] = Vec2.clone(p.vel_eff);
		}
	},

	/* Solver uses the Runge-Kutta method */
	solve: function (dt) {
		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos_eff = Vec2.clone(p.pos);
			p.vel_eff = Vec2.clone(p.vel);
		}

		Physics.computeDeriv(0);

		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[0], 0.5*dt));
			p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[0], 0.5*dt));
		}

		Physics.computeDeriv(1);

		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[1], 0.5*dt));
			p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[1], 0.5*dt));
		}

		Physics.computeDeriv(2);

		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos_eff = Vec2.add(p.pos, Vec2.mul(p.pos_deriv[2], dt));
			p.vel_eff = Vec2.add(p.vel, Vec2.mul(p.vel_deriv[2], dt));
		}

		Physics.computeDeriv(3);

		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			p.pos = Vec2.add(p.pos, Vec2.mul(
				Vec2.add(Vec2.add(p.pos_deriv[0], p.pos_deriv[3]), Vec2.mul(Vec2.add(p.pos_deriv[1], p.pos_deriv[2]), 2.0)), 
				dt/6.0));
			p.vel = Vec2.add(p.vel, Vec2.mul(
				Vec2.add(Vec2.add(p.vel_deriv[0], p.vel_deriv[3]), Vec2.mul(Vec2.add(p.vel_deriv[1], p.vel_deriv[2]), 2.0)), 
				dt/6.0));
		}
	},

	solveSingle: function (planet, dt, steps) {
		var p = planet;

		p.pos_eff = Vec2.clone(p.pos);
		p.vel_eff = Vec2.clone(p.vel);

		for(var s = 0; s < steps; ++s) {
			for(var i = 0; i < Bodies.length; ++i) {
				var f = Physics.getForce(Bodies[i], p);
				p.vel_eff = Vec2.add(p.vel_eff, Vec2.mul(f, dt/p.mass));
				p.pos_eff = Vec2.add(p.pos_eff, Vec2.mul(p.vel_eff, 0.5*dt));
			}
		}

		p.pos = Vec2.clone(p.pos_eff);
		p.vel = Vec2.clone(p.vel_eff);

		return p;
	},

	removeExitedBodies: function (radius) {
		for(var i = 0; i < Bodies.length; ++i) {
			var p = Bodies[i];
			if(Math.sqrt(Vec2.dot(p.pos, p.pos)) > radius) {
				Bodies.splice(i,1);
				--i;
			}
		}
		//console.log(Bodies.length);
	},

	blendColors: function (c0, c1, p) {
	    var f=parseInt(c0.slice(1),16),t=parseInt(c1.slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF,R2=t>>16,G2=t>>8&0x00FF,B2=t&0x0000FF;
	    return "#"+(0x1000000+(Math.round((R2-R1)*p)+R1)*0x10000+(Math.round((G2-G1)*p)+G1)*0x100+(Math.round((B2-B1)*p)+B1)).toString(16).slice(1);
	},

	mergeBodies: function () {
		for(var i = 0; i < Bodies.length; ++i) {
			for(var j = 0; j < i; ++j) {
				var a = Bodies[i];
				var b = Bodies[j];
				
				var d = Vec2.sub(b.pos, a.pos);
				var l = Math.sqrt(Vec2.dot(d,d));
				if(l < 0.5*(a.rad + b.rad)) {
					var mass = a.mass + b.mass;
					b.pos = Vec2.div(Vec2.add(Vec2.mul(a.pos, a.mass), Vec2.mul(b.pos, b.mass)), mass);
					b.vel = Vec2.div(Vec2.add(Vec2.mul(a.vel, a.mass), Vec2.mul(b.vel, b.mass)), mass);
					b.mass = mass;
					b.rad = Physics.getRadiusByMass(mass);
					b.color = Physics.blendColors(b.color, a.color, a.mass/mass);
					Bodies.splice(i,1);
					--i;
					return;
				}
			}
		}
	},

	zeroBarycenter: function () {
		var position = Vec2.create();
		var mass = 0.0;
		for(var i = 0; i < Bodies.length; ++i) {
			position = Vec2.add(position, Vec2.mul(Bodies[i].pos, Bodies[i].mass));
			mass += Bodies[i].mass;
		}
		var center = Vec2.div(position, mass);
		for(var i = 0; i < Bodies.length; ++i) {
			Bodies[i].pos = Vec2.sub(Bodies[i].pos, center);
		}
	},

	zeroMomentum: function () {
		var momentum = Vec2.create();
		var mass = 0.0;
		for(var i = 0; i < Bodies.length; ++i) {
			momentum = Vec2.add(momentum, Vec2.mul(Bodies[i].vel, Bodies[i].mass));
			mass += Bodies[i].mass;
		}
		var velocity = Vec2.div(momentum, mass);
		for(var i = 0; i < Bodies.length; ++i) {
			Bodies[i].vel = Vec2.sub(Bodies[i].vel, velocity);
		}
	},
};

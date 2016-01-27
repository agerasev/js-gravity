var Body = {
	getRadiusByMass: function(mass) {
		return Math.pow(mass, 1.0/3.0);
	},
	create: function(mass, pos, vel, color) {
		pos = (pos == undefined) ? Vec2.create() : Vec2.clone(pos);
		vel = (vel == undefined) ? Vec2.create() : Vec2.clone(vel);
		color = (color == undefined) ? "#FFFFFF" : color;
		return {
			pos: pos, 
			vel: vel, 
			rad: Body.getRadiusByMass(mass), 
			mass: mass,

			pos_eff: Vec2.clone(pos),
			vel_eff: Vec2.clone(vel),
			pos_deriv: [],
			vel_deriv: [],

			color: color,
		};
	},
}

var Bodies = [
	Body.create(100000, Vec2.create(0,0), Vec2.create(0,0), "#FFFF00"),
	Body.create(200, Vec2.create(100, 0), Vec2.create(0,-300), "#FF0000"),
	Body.create(1000, Vec2.create(-400, 0), Vec2.create(0,150), "#00FF00"),
	Body.create(100, Vec2.create(-400 + 40, 0), Vec2.create(0,150 + 54), "#0000FF"),
];
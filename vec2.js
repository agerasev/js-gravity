var Vec2 = {};

Vec2.create = function(x, y) {
	var r = new Object();
	r.x = (x == undefined) ? 0.0 : 1.0*x;
	r.y = (y == undefined) ? r.x : 1.0*y;
	return r;
}
Vec2.clone = function(a) {
	return {x: a.x, y: a.y};
}
Vec2.add = function(a, b) {
	return {x: a.x + b.x, y: a.y + b.y};
}
Vec2.sub = function(a, b) {
	return {x: a.x - b.x, y: a.y - b.y};
}
Vec2.mul = function(a, b) {
	return {x: a.x*b, y: a.y*b};
}
Vec2.div = function(a, b) {
	return {x: a.x/b, y: a.y/b};
}
Vec2.dot = function(a, b) {
	return a.x*b.x + a.y*b.y;
}
Vec2.cross = function(a, b) {
	return a.x*b.y - a.y*b.x;
}
Vec2.toString = function(a) {
	return "{" + a.x + ", " + a.y + "}";
}

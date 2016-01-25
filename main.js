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

	// options
	track: true,
	track_opacity: 0.05,
	borders: false,
}

function getNewBody() {
	var m = parseFloat(document.getElementById("input_mass").value);
	if(m == m && m > 1.0) {
		return Body.create(
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

function drawBody(p) {
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
	if(App.track) {
		ctx.fillStyle = "rgba(0,0,0," + App.track_opacity + ")";
		ctx.fillRect(0,0,App.width,App.height);
	} else {
		ctx.clearRect(0,0,App.width,App.height);
	}

	if(App.draw_path) {
		var p = getNewBody();
		if(p != null) {
			drawBody(p);
			/*
			for(var i = 0; i < 10; ++i) {
				p = solveSingle(p,0.01,10);
				drawBody(p);
			}
			*/
		}
	}

	for(var i = 0; i < Bodies.length; ++i) {
		drawBody(Bodies[i]);
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
		Physics.solve(0.01);
		Physics.removeExitedBodies(2*Math.sqrt(App.width*App.width + App.height*App.height));
		Physics.mergeBodies();
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

	// init canvas
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
		var p = getNewBody();
		if(p != null)
			Bodies[Bodies.length] = p;
		App.draw_path = false;
		App.pre_pos = null;
	})
	.mousemove(function(e) {
		if(App.pre_pos != null) {
			var end = pageToWorld(Vec2.create(e.pageX, e.pageY));
			App.pre_vel = Vec2.sub(end, App.pre_pos);
		}
	});

	// init inputs
	var cb;
	(cb = function(){App.track = $("#flag_track").prop("checked");})();
	$("#flag_track").change(cb);
	(cb = function(){App.borders = $("#flag_borders").prop("checked");})();
	$("#flag_borders").change(cb);
	(cb = function() {
		App.track_opacity = parseFloat(
			document.getElementById("input_track_opacity").value
			);
	})();
	$("#input_track_opacity").change(cb);
	

	// init buttons
	$("#button_momentum").click(function() {
		Physics.zeroMomentum();
	});
	$("#button_barycenter").click(function() {
		Physics.zeroBarycenter();
	});

	resize();

	window.requestAnimationFrame(render);
	resume();
}

$(window).resize(resize);
$(document).ready(ready);
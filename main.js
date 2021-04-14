let data = JSON.parse(`{
	"nodes": [
		{ "name": "node_1"},
		{ "name": "node_2"},
		{ "name": "node_3"}
	],
	"edges": [
		{ "src": "node_1", "dest": "node_2" },
		{ "src": "node_2", "dest": "node_3" },
		{ "src": "node_3", "dest": "node_1" },
		{ "src": "node_3", "dest": "node_2" },
		{ "src": "node_1", "dest": "node_1" }
	]
}`);

let terms = ["node_2"];


// let data = {
// 	nodes : [
// 	{ name : "node_1", term: false },
// 	{ name : "node_2", term: true  },
// 	{ name : "node_3", term: false }
// 	],
// 	edges : [
// 	{ src : "node_1", dest : "node_2" },
// 	{ src : "node_2", dest : "node_3" },
// 	{ src : "node_3", dest : "node_1" },
// 	{ src : "node_3", dest : "node_2" },
// 	{ src : "node_1", dest : "node_1" }
// 	]
// }


(function ($) {
	function getRadians(degrees) {
		return (Math.PI / 180) * degrees;
	}

	var Renderer = function (canvas) {
		var canvas = $(canvas).get(0);
		var ctx = canvas.getContext("2d");
		var particleSystem;

		var that = {
			init: function (system) {
				//начальная инициализация
				particleSystem = system;
				particleSystem.screenSize(canvas.width, canvas.height);
				particleSystem.screenPadding(80);
				that.initMouseHandling();
			},

			redraw: function () {
				//действия при перересовке
				ctx.fillStyle = "white"; //белым цветом
				ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область

				particleSystem.eachEdge( //отрисуем каждую грань
					function (edge, pt1, pt2) { //будем работать с гранями и точками её начала и конца
						// ctx.strokeStyle = "rgba(0,0,0, 1)"; //грани будут чёрным цветом с некой прозрачностью
						// ctx.lineWidth = 1; //толщиной в один пиксель
						// ctx.beginPath();  //начинаем рисовать
						// ctx.moveTo(pt1.x, pt1.y); //от точки один
						// ctx.lineTo(pt2.x, pt2.y); //до точки два

						if (pt1.x === pt2.x && pt1.y === pt2.y) {
							canvas_loop(ctx, pt1);
						} else {
							canvas_arrow(ctx, pt1, pt2);
						}

						function canvas_loop(ctx, pt) {
							ctx.beginPath();
							ctx.arc(pt.x, pt.y - 15, 15, Math.PI / 1.4, 2.2 * Math.PI);
							var headlen = 20;   // length of head in pixels
							var angle = Math.atan2(0, 0);
							ctx.moveTo(pt.x + 12, pt.y - 6);
							ctx.lineTo(pt.x + 10, pt.y - 15)
							// context.lineTo((x - headlen * Math.cos(angle - Math.PI / 6)), y - headlen * Math.sin(angle - Math.PI / 6));
							ctx.moveTo(pt.x + 12, pt.y - 6);
							ctx.lineTo(pt.x + 20, pt.y - 10);
							// context.lineTo(x + 10 - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
							ctx.stroke();
						}

						function canvas_arrow(ctx, from, to) {
							ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут чёрным цветом с некой прозрачностью
							ctx.lineWidth = 1; //толщиной в один пиксель
							ctx.beginPath();  //начинаем рисовать
							var headlen = 20;   // length of head in pixels
							var angle = Math.atan2(to.y - from.y, to.x - from.x);
							ctx.moveTo(from.x, from.y);
							// ctx.lineTo(tox, toy);
							// ctx.lineTo((tox - headlen * Math.cos(angle - Math.PI / 6)), toy - headlen * Math.sin(angle - Math.PI / 6));
							// ctx.moveTo(tox, toy);
							// ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
							// ctx.stroke();
							var arrow_end = {
								x: to.x - (to.x - from.x) * 0.058,
								y: to.y - (to.y - from.y) * 0.058
							}

							ctx.lineTo(arrow_end.x, arrow_end.y);
							ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
							ctx.moveTo(arrow_end.x, arrow_end.y);
							ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
							ctx.stroke();
						}

						// canvas_arrow(ctx, pt1.x, pt1.y, pt2.x, pt2.y);
						// ctx.stroke();
					});

				particleSystem.eachNode( //теперь каждую вершину
					function (node, pt) {  //получаем вершину и точку где она
						var w = 10;   //ширина квадрата
						// ctx.fillStyle = "orange"; //с его цветом понятно
						// ctx.fillRect(pt.x - w / 2, pt.y - w / 2, w, w); //рисуем;

						ctx.beginPath();
						ctx.arc(pt.x, pt.y, w, 0, 2 * Math.PI);
						if (terms.includes(node.name)) {
							ctx.fillStyle = "#00ff00";
						} else {
							ctx.fillStyle = "#109bfc";
						}
						ctx.fill();
						ctx.stroke();

						ctx.fillStyle = "black"; //цвет для шрифта
						ctx.font = 'italic 13px sans-serif'; //шрифт
						ctx.fillText(node.name, pt.x + 8, pt.y + 8); //пишем имя у каждой точки
					});
			},

			initMouseHandling: function () { //события с мышью
				var dragged = null;   //вершина которую перемещают
				var handler = {
					clicked: function (e) { //нажали
						var pos = $(canvas).offset(); //получаем позицию canvas
						_mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top); //и позицию нажатия кнопки относительно canvas
						dragged = particleSystem.nearest(_mouseP); //определяем ближайшую вершину к нажатию
						if (dragged && dragged.node !== null) {
							dragged.node.fixed = true; //фиксируем её
						}
						$(canvas).bind('mousemove', handler.dragged); //слушаем события перемещения мыши
						$(window).bind('mouseup', handler.dropped);  //и отпускания кнопки
						return false;
					},
					dragged: function (e) { //перетаскиваем вершину
						var pos = $(canvas).offset();
						var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

						if (dragged && dragged.node !== null) {
							var p = particleSystem.fromScreen(s);
							dragged.node.p = p; //тянем вершину за нажатой мышью
						}

						return false;
					},
					dropped: function (e) { //отпустили
						if (dragged === null || dragged.node === undefined) return; //если не перемещали, то уходим
						if (dragged.node !== null) dragged.node.fixed = false; //если перемещали - отпускаем
						dragged = null; //очищаем
						$(canvas).unbind('mousemove', handler.dragged); //перестаём слушать события
						$(window).unbind('mouseup', handler.dropped);
						_mouseP = null;
						return false;
					}
				}
				// слушаем события нажатия мыши
				$(canvas).mousedown(handler.clicked);
			},

		}
		return that;
	}

	$(document).ready(function () {
		// sys = arbor.ParticleSystem({ friction: 0, stiffness: 600, repulsion: 1000 }); // создаём систему

		// arbor.ParticleSystem({ friction: 1 })
		sys = arbor.ParticleSystem(1000, 600, 0.5, false, 55, 0.02, 0.6);

		// sys.parameters({ gravity: false }); // гравитация вкл
		sys.renderer = Renderer("#viewport"); //начинаем рисовать в выбраной области

		(() => {
			$.each(data.nodes, function (i, node) {
				sys.addNode(node.name); //добавляем вершину
			});

			$.each(data.edges, function (i, edge) {
				sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest)); //добавляем грань
			});
		})();

		// $.getJSON("data.json", //получаем с сервера файл с данными
		// 	function (data) {
		// 		$.each(data.nodes, function (i, node) {
		// 			sys.addNode(node.name); //добавляем вершину
		// 		});

		// 		$.each(data.edges, function (i, edge) {
		// 			sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest)); //добавляем грань
		// 		});
		// 	});

	})

})(this.jQuery)

// "use strict";

let automaton__pict = document.querySelector(".automaton__pict");

let is_NFA_page = true;
let is_DFA_page = false;

let NFA = document.querySelector("#NFA");
let DFA = document.querySelector("#DFA");
let button_nfa_to_dfa = document.querySelector("#button-nfa-to-dfa");

let change_page = (page_from, page_to) => {
    page_from.classList.remove("panel__btn--active");
    page_to.classList.add("panel__btn--active");
    if (page_to == DFA) {
        is_DFA_page = true;
        is_NFA_page = false;
        button_nfa_to_dfa.classList.add("invisible");
        automaton__pict.innerHTML = `<img src="images/DFA.png" alt="DFA">`;
    } else {
        is_NFA_page = true;
        is_DFA_page = false;
        button_nfa_to_dfa.classList.remove("invisible");
        automaton__pict.innerHTML = `<canvas id="viewport" width="800" height="400"></canvas>`;
    }
}

NFA.onclick = () => {
    change_page(DFA, NFA);
}

DFA.onclick = () => {
    change_page(NFA, DFA);
}

button_nfa_to_dfa.onclick = () => {
    change_page(NFA, DFA);
}


let nodes_names = new Set();

// Храним ребра и вершины
let data = {
    nodes: [],
    edges: []
};


// Храним ребра и символы перехода
let edges_symbols = [];


// "Добавить" работает толоко если все ввести
$(".from").blur(() => {
    if ($(".from").val() && $(".to").val() && $(".symb").val()) {
        $(".draw_form__add").prop('disabled', false);
    } else {
        $(".draw_form__add").prop('disabled', true);
    }
});
$(".to").blur(() => {
    if ($(".from").val() && $(".to").val() && $(".symb").val()) {
        $(".draw_form__add").prop('disabled', false);
    } else {
        $(".draw_form__add").prop('disabled', true);
    }
});
$(".symb").blur(() => {
    if ($(".from").val() && $(".to").val() && $(".symb").val()) {
        $(".draw_form__add").prop('disabled', false);
    } else {
        $(".draw_form__add").prop('disabled', true);
    }
});



// "Кнопка добавить"
$(".draw_form__add").click((evt) => {
    evt.preventDefault();
    $(".draw_form__add").prop('disabled', true); // Делаем кнопку "Добавить" недоступной

    if (!nodes_names.has($(".from").val())) {
        $(".automaton__code2").append(
            `<label>${$(".from").val()}<input type="checkbox" class="checkbox" name="${$(".from").val()}"></input></label><br>`
        );
    }

    if (!nodes_names.has($(".to").val())) {
        $(".automaton__code2").append(
            `<label>${$(".to").val()}<input type="checkbox" class="checkbox" name="${$(".to").val()}"></input></label><br>`
        );
    }

    nodes_names.add($(".from").val());
    nodes_names.add($(".to").val());

    // Добавляем новые символы перехода
    let flag = true;
    for (let i = 0; i < edges_symbols.length; i++) {
        if (edges_symbols[i].split(":")[0] == $(".from").val() && edges_symbols[i].split(":")[1] == $(".to").val()) {
            edges_symbols[i] += ", " + $(".symb").val();
            flag = false;
        }
    }

    if (flag) {
        let edge = "";
        edge += $(".from").val() + ":" + $(".to").val() + ":" + $(".symb").val();
        edges_symbols.push(edge);
    }


    $(".automaton__code").append(`<h1>Из ${$(".from").val()} в ${$(".to").val()} по символам: ${$(".symb").val()}</h1>`); // Печатаем ребро


    // NODES1 Добавлеение вершины from
    let f = true;
    for (let i = 0; i < data.nodes.length; i++) {
        if ($(".from").val() == data.nodes[i].name) {
            f = false;
            break;
        }
    }
    if (f) {
        data.nodes.push({ name: $(".from").val() });
    }

    // NODES2 Добавление вершины to
    let g = true;
    for (let i = 0; i < data.nodes.length; i++) {
        if ($(".to").val() == data.nodes[i].name) {
            g = false;
            break;
        }
    }
    if (g) {
        data.nodes.push({ name: $(".to").val() });
    }

    // EDGES 
    data.edges.push({
        src: $(".from").val(),
        dest: $(".to").val()
    })

    // Обнуление 
    $(".from").val("");
    $(".to").val("");
    $(".symb").val("");
})

let terms = [];

let edges_done = [];

let rev_edges = [];

$(".end_draw").click((evt) => { // Построить
    evt.preventDefault();
    createCanvas(this.jQuery);
});

function createCanvas($) {
    let exit1 = false;
    let exit2 = false;

    let del = false;
    let del2 = false;

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
                let mas_cb = $(".checkbox");
                for (let i = 0; i < mas_cb.length; i++) {
                    $(mas_cb[i]).change(() => {
                        if ($(mas_cb[i]).is(':checked') && !terms.includes($(mas_cb[i]).attr("name"))) {
                            terms.push($(mas_cb[i]).attr("name"));
                        } else if (!$(mas_cb[i]).is(':checked') && terms.includes($(mas_cb[i]).attr("name"))) {
                            terms.splice(terms.indexOf($(mas_cb[i]).attr("name")), 1);
                        }
                        // else {
                        // terms.splice(terms.indexOf($(mas_cb[i]).attr("name")), 1);
                        // }
                    })
                }

                $(".end_draw").click((evt) => {
                    evt.preventDefault();
                    exit1 = true;
                });

                if (exit1) {
                    exit2 = true;
                    return;
                }

                $(".delete").click((evt) => {
                    evt.preventDefault();
                    data = {
                        nodes: [],
                        edges: []
                    };
                    edges_symbols = [];
                    del = true;
                    $(".automaton__code").html(`<h1>Ребра:</h1>`);
                });

                if (del) {
                    del2 = true;
                    ctx.fillStyle = "white"; //белым цветом
                    ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область
                    return;
                }

                //действия при перересовке
                ctx.fillStyle = "white"; //белым цветом
                ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область

                particleSystem.eachEdge( //отрисуем каждую грань
                    function (edge, pt1, pt2) { //будем работать с гранями и точками её начала и конца
                        let temp = edge.source.name + ":" + edge.target.name;
                        let rev_temp = edge.target.name + ":" + edge.source.name;
                        if (!edges_done.includes(temp) && !edges_done.includes(rev_temp)) {
                            edges_done.push(temp);
                        };


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

                            let symbols = "";
                            for (let i = 0; i < edges_symbols.length; ++i) {
                                if (edge.source.name == edges_symbols[i].split(":")[0] &&
                                    edge.target.name == edges_symbols[i].split(":")[1]) {
                                    symbols = edges_symbols[i].split(":")[2];
                                }
                            }
                            ctx.fillStyle = "black"; //цвет для шрифта
                            ctx.font = 'italic 16px sans-serif'; //шрифт
                            ctx.fillText(symbols, pt.x - 15, pt.y - 33); //пишем имя у каждой точки

                            // ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут чёрным цветом с некой прозрачностью
                            // ctx.lineWidth = 1; //толщиной в один пиксель

                        }

                        function canvas_arrow(ctx, from, to) {
                            let symbols = "";
                            for (let i = 0; i < edges_symbols.length; ++i) {
                                if (edge.source.name == edges_symbols[i].split(":")[0] &&
                                    edge.target.name == edges_symbols[i].split(":")[1]) {
                                    symbols = edges_symbols[i].split(":")[2];
                                }
                            }
                            var headlen = 20;   // length of head in pixels
                            var angle = Math.atan2(to.y - from.y, to.x - from.x);
                            var arrow_end = {
                                x: to.x - (to.x - from.x) * 0.058,
                                y: to.y - (to.y - from.y) * 0.058
                            }

                            if (edges_done.includes(edge.target.name + ":" + edge.source.name)) {
                                ctx.strokeStyle = "rgba(255,0,0, 0.7)"; //грани будут красный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
                                ctx.stroke();

                                ctx.fillStyle = "red"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 + 10); //пишем имя у каждой точки

                                let rev_temp = edge.target.name + ":" + edge.source.name;
                                rev_edges.push(rev_temp);

                            } else if (rev_edges.includes(edge.source.name + ":" + edge.target.name)) {
                                ctx.strokeStyle = "rgba(0,0,0, 0.7)"; //грани будут чёрным цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                ctx.stroke();
                                ctx.strokeStyle = "rgba(0,255,0, 0.7)"; //грани будут зеленый цветом с некой прозрачностью
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
                                ctx.stroke();

                                ctx.fillStyle = "green"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 - 10); //пишем имя у каждой точки
                            } else {
                                ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут черный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
                                ctx.stroke();

                                ctx.fillStyle = "black"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2); //пишем имя у каждой точки
                            }

                            // ctx.fillStyle = "orange"; //с его цветом понятно
                            // 					ctx.fillRect((from.x + to.x)/2, (from.y + to.y)/2, 40,-20)


                            ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут чёрным цветом с некой прозрачностью
                            ctx.lineWidth = 1; //толщиной в один пиксель
                        }
                    });

                particleSystem.eachNode( //теперь каждую вершину
                    function (node, pt) {  //получаем вершину и точку где она

                        var w = 10;   //ширина квадрата

                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, w, 0, 2 * Math.PI);
                        if (terms.includes(node.name)) {
                            ctx.fillStyle = "#00ff00";
                        } else if (data.nodes[0].name == node.name) {
                            ctx.fillStyle = "#ff0000";
                        } else {
                            ctx.fillStyle = "#109bfc";
                        }
                        ctx.fill();
                        ctx.stroke();

                        ctx.fillStyle = "black"; //цвет для шрифта
                        ctx.font = 'italic 16px sans-serif'; //шрифт
                        ctx.fillText(node.name, pt.x + 10, pt.y + 8); //пишем имя у каждой точки
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

    if (exit2) {
        return;
    }

    if (del2) {
        return;
    }
};

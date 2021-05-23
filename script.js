// "use strict";

let web_site = {
    automaton__pict: $(".automaton__pict"),
    automaton__pict2: $(".automaton__pict2"),
    automaton__nodes_names: $(".automaton__nodes--names"),
    automaton__edges: $(".automaton__edges"),
    automaton__nodes: $(".automaton__nodes"),

    times_add: 0,
    is_built: false,
    is_NFA_page: true,
    is_DFA_page: false,
    NFA: $("#NFA"),
    DFA: $("#DFA"),

    // Перестроить
    button_nfa_to_dfa: $("#button-nfa-to-dfa"),

    // Поля для ввода
    from: $(".from"),
    to: $(".to"),
    symb: $(".symb"),

    // Кнопка Добавить
    button_add: $(".draw-form__add"),
    button_build : $(".build-automaton"),
}

let automaton_NFA = {
    nodes_names: new Set(),
    data: {
        nodes: [],
        edges: []
    },
    edges_symbols: [],
    edges_symbols_DFA: [],
    alphabet: new Set(),

    // Финальные вершины
    terms: [],
    // Добавленные ребра
    edges_done: [],
    // Обратные ребра
    rev_edges: [],
}

let change_page = (page_from, page_to) => {
    $(page_from).removeClass("panel__btn--active");
    $(page_to).addClass("panel__btn--active");
    if (page_to === web_site.DFA) {
        web_site.is_DFA_page = true;
        web_site.is_NFA_page = false;

        $(web_site.button_nfa_to_dfa).addClass("invisible");
        $(web_site.automaton__pict2).removeClass("invisible");
        $(web_site.automaton__edges).addClass("invisible");
        $(web_site.automaton__nodes).addClass("invisible");

        // $(web_site.automaton__pict).html(`<img src="images/DFA.png" alt="DFA">`);

    } else {
        web_site.is_NFA_page = true;
        web_site.is_DFA_page = false;
        $(web_site.button_nfa_to_dfa).removeClass("invisible");
        $(web_site.automaton__pict2).addClass("invisible");
        $(web_site.automaton__edges).removeClass("invisible");
        $(web_site.automaton__nodes).removeClass("invisible");
        $(web_site.automaton__pict).html(`<canvas id="viewport" width="800" height="400"></canvas>`);
    }
}

$(web_site.NFA).click(() => {
    // change_page(web_site.DFA, web_site.NFA);
})

$(web_site.DFA).click(() => {
    // change_page(web_site.NFA, web_site.DFA);
})


// Cигма автомата
let sigma = (from, symb) => {
    let temp = [];
    for (let i = 0; i < automaton_NFA.edges_symbols.length; ++i) {
        if (automaton_NFA.edges_symbols[i].split(":")[2].split(", ").includes(symb) && automaton_NFA.edges_symbols[i].split(":")[0] === from) {
            temp.push(automaton_NFA.edges_symbols[i].split(":")[1]);
        }
    }
    return temp;
}

let allEpsilon = (node) => {
    // console.log("node: ", node);
    let visited = new Set();
    let goEpsilon = (node) => {
        visited.add(node);
        let edges = sigma(node, "∑");
        for (let i = 0; i < edges.length; ++i) {
            if (!visited.has(edges[i])) {
                goEpsilon(edges[i]);
            }
        }
    }
    // console.log("visited: ", visited);
    goEpsilon(node);
    return visited;
}

let build_DFA = (automaton_NFA) => {
    let automaton_DFA = {
        data: {
            nodes: [],
            edges: []
        },
        nodes_names: new Set(),
        edges_symbols: [],
        alphabet: new Set(),

        // Финальные вершины
        terms: [],
        // Добавленные ребра
        edges_done: [],
        // Обратные ребра
        rev_edges: [],

        names_ind: 0, // индекс для названия вершин
        nodes_pair: new Map(), // название вершины - из каких состоит
        nodes_pair2: new Map(), // из каких состоит - название вершины
        normal_edges_symbols: [], // как в NFA
        first_names: [], // для первых назв верш
    }
    let s = allEpsilon(automaton_NFA.data.nodes[0].name);
    let P;
    P = [];
    // console.log("s = ", s);
    P.push(s);
    let Q_d = [];
    while (P.length) {
        let p_d = P[0];
        P.shift();
        for (let c of automaton_NFA.alphabet) {
            let q_d = new Set();
            for (let p of p_d) {
                let tt = sigma(p, c);
                if (tt.length) {
                    // q_d.push(tt);
                    let temp = [];
                    for (let n of tt) {
                        temp.push(allEpsilon(n));
                    }
                    for (let n2 of temp) {
                        for (let n3 of n2) {
                            q_d.add(n3);
                        }
                    }
                }
            }
            // console.log("p_d = ", p_d, ", q_d = ", q_d, ",c = ", c);
            let p_d_str = "";
            for (let word of p_d) {
                if (p_d_str.length) {
                    p_d_str += ":" + word;
                } else {
                    p_d_str += word;
                }
            }
            let q_d_str = "";
            for (let word of q_d) {
                if (q_d_str.length) {
                    q_d_str += ":" + word;
                } else {
                    q_d_str += word;
                }
            }
            let tutu = [p_d_str, q_d_str, c];
            if (q_d.size) {
                let flag = true;
                for (let i = 0; i < automaton_DFA.edges_symbols.length; ++i) {
                    if (automaton_DFA.edges_symbols[i][0] === p_d_str && automaton_DFA.edges_symbols[i][1] === q_d_str) {
                        automaton_DFA.edges_symbols[i][2] += ", " + c;
                        flag = false;
                    }
                }
                if (flag) automaton_DFA.edges_symbols.push(tutu);
            }
            // console.log(tutu);
            if (!Q_d.includes(q_d_str) && q_d.size) {
                P.push(q_d);
                Q_d.push(q_d_str);
            }
        }
    }
    for (let nods of automaton_DFA.edges_symbols) {
        if (!automaton_DFA.first_names.includes(nods[0])) {
            automaton_DFA.first_names.push(nods[0]);
            if (automaton_DFA.names_ind) {
                automaton_DFA.nodes_pair.set("q" + automaton_DFA.names_ind, nods[0]);
                automaton_DFA.nodes_names.add("q" + automaton_DFA.names_ind);
                automaton_DFA.nodes_pair2.set(nods[0], "q" + automaton_DFA.names_ind);
                automaton_DFA.data.nodes.push({ name: "q" + automaton_DFA.names_ind });
                automaton_DFA.names_ind += 1;
            } else {
                automaton_DFA.nodes_pair.set("S", nods[0]);
                automaton_DFA.nodes_names.add("S");
                automaton_DFA.nodes_pair2.set(nods[0], "S");
                automaton_DFA.data.nodes.push({ name: "S" });
            }
        }
        if (!automaton_DFA.first_names.includes(nods[1])) {
            automaton_DFA.first_names.push(nods[1]);
            automaton_DFA.names_ind += 1;
            automaton_DFA.nodes_pair.set("q" + automaton_DFA.names_ind, nods[1]);
            automaton_DFA.nodes_names.add("q" + automaton_DFA.names_ind);
            automaton_DFA.nodes_pair2.set(nods[1], "q" + automaton_DFA.names_ind);
            automaton_DFA.data.nodes.push({ name: "q" + automaton_DFA.names_ind });
        }
        automaton_DFA.alphabet = automaton_NFA.alphabet;
        let temp_edge = {
            src: automaton_DFA.nodes_pair2.get(nods[0]),
            dest: automaton_DFA.nodes_pair2.get(nods[1]),
        }
        if (!automaton_DFA.data.edges.includes(temp_edge)) {
            automaton_DFA.data.edges.push(temp_edge);
        }
    }
    for (let edge_symbols of automaton_DFA.edges_symbols) {
        let str_edge_symbols = automaton_DFA.nodes_pair2.get(edge_symbols[0]) + ":" + automaton_DFA.nodes_pair2.get(edge_symbols[1]) + ":" + edge_symbols[2];
        automaton_DFA.normal_edges_symbols.push(str_edge_symbols);
    }

    for (let nod of automaton_DFA.nodes_names) {

        let nod2 = automaton_DFA.nodes_pair.get(nod).split(":");
        if (nod2) {
            for (let nod3 of nod2) {
                if (automaton_NFA.terms.includes(nod3)) {
                    automaton_DFA.terms.push(nod);
                }
            }
        }
    }
    automaton_DFA.edges_symbols = automaton_DFA.normal_edges_symbols;
    return automaton_DFA;
}


$(web_site.button_nfa_to_dfa).click(() => {
    $(web_site.automaton__pict).css({ 'width' : '40%' });
    $(web_site.automaton__pict2).css({ 'width' : '40%' });
    $(web_site.automaton__nodes_names).removeClass("invisible");
    $(web_site.button_build).prop('disabled', true);
    change_page(web_site.NFA, web_site.DFA);
    automaton_DFA = build_DFA(automaton_NFA);
    // automaton_NFA.data.edges += automaton_DFA.data.edges;
    // automaton_NFA.data.nodes += automaton_DFA.data.nodes;
    // automaton_NFA.edges_symbols += automaton_DFA.normal_edges_symbols;
    console.log(automaton_NFA);
    console.log(automaton_DFA);
    createCanvas2(this.jQuery);
    for (let node of automaton_DFA.nodes_names) {
        $(web_site.automaton__nodes_names).append(`<h1>${node} = ${automaton_DFA.nodes_pair.get(node).split(":")}</h1>`);
    }
})

let button_change = () => {
    if ($(web_site.from).val() && $(web_site.to).val() && $(web_site.symb).val()) {
        $(web_site.button_add).prop('disabled', false);
    } else {
        $(web_site.button_add).prop('disabled', true);
    }
}

// "Добавить" работает толоко если все ввести
$(web_site.from).change(() => {
    button_change();
});
$(web_site.to).change(() => {
    button_change();
});
$(web_site.symb).change(() => {
    button_change();
});

// "Кнопка добавить"
$(web_site.button_add).click(() => {
    $(web_site.button_build).prop('disabled', false); // Делаем кнопку "Построить" доступной
    $(web_site.button_add).prop('disabled', true); // Делаем кнопку "Добавить" недоступной

    if (!automaton_NFA.nodes_names.has($(web_site.from).val())) {
        $(".automaton__nodes").append(
            `<label>${$(web_site.from).val()}<input type="checkbox" class="checkbox" name="${$(web_site.from).val()}"/></label><br>`
        );
    }
    automaton_NFA.nodes_names.add($(web_site.from).val());

    if (!automaton_NFA.nodes_names.has($(web_site.to).val())) {
        $(".automaton__nodes").append(
            `<label>${$(web_site.to).val()}<input type="checkbox" class="checkbox" name="${$(web_site.to).val()}"/></label><br>`
        );
    }

    automaton_NFA.nodes_names.add($(web_site.to).val());
    if ($(web_site.symb).val() !== "∑") automaton_NFA.alphabet.add($(web_site.symb).val());

    // Добавляем новые символы перехода
    let flag = true;
    for (let i = 0; i < automaton_NFA.edges_symbols.length; i++) {
        if (automaton_NFA.edges_symbols[i].split(":")[0] === $(web_site.from).val() && automaton_NFA.edges_symbols[i].split(":")[1] === $(web_site.to).val()) {
            automaton_NFA.edges_symbols[i] += ", " + $(web_site.symb).val();
            flag = false;
        }
    }

    if (flag) {
        let edge = "";
        edge += $(web_site.from).val() + ":" + $(web_site.to).val() + ":" + $(web_site.symb).val();
        automaton_NFA.edges_symbols.push(edge);
    }


    $(".automaton__edges").append(`<h1>Из ${$(web_site.from).val()} в ${$(web_site.to).val()} по символу: ${$(web_site.symb).val()}</h1>`); // Печатаем ребро


    // NODES1 Добавлеение вершины from
    let f = true;
    for (let i = 0; i < automaton_NFA.data.nodes.length; i++) {
        if ($(web_site.from).val() === automaton_NFA.data.nodes[i].name) {
            f = false;
            break;
        }
    }
    if (f) {
        automaton_NFA.data.nodes.push({ name: $(web_site.from).val() });
    }

    // NODES2 Добавление вершины to
    let g = true;
    for (let i = 0; i < automaton_NFA.data.nodes.length; i++) {
        if ($(web_site.to).val() === automaton_NFA.data.nodes[i].name) {
            g = false;
            break;
        }
    }
    if (g) {
        automaton_NFA.data.nodes.push({ name: $(web_site.to).val() });
    }

    // EDGES 
    automaton_NFA.data.edges.push({
        src: $(web_site.from).val(),
        dest: $(web_site.to).val()
    })

    // Обнуление 
    $(web_site.from).val("");
    $(web_site.to).val("");
    $(web_site.symb).val("");
})

$(".build-automaton").click((evt) => { // Построить
    evt.preventDefault();
    $(web_site.button_nfa_to_dfa).prop('disabled', false);
    web_site.is_built = true;
    createCanvas(this.jQuery);
});

function createCanvas($) {
    let rebuild = false;
    let rm = false;

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
                        if ($(mas_cb[i]).is(':checked') && !automaton_NFA.terms.includes($(mas_cb[i]).attr("name"))) {
                            automaton_NFA.terms.push($(mas_cb[i]).attr("name"));
                        } else if (!$(mas_cb[i]).is(':checked') && automaton_NFA.terms.includes($(mas_cb[i]).attr("name"))) {
                            automaton_NFA.terms.splice(automaton_NFA.terms.indexOf($(mas_cb[i]).attr("name")), 1);
                        }
                    })
                }

                $(".build-automaton").click((evt) => {
                    evt.preventDefault();
                    rebuild = true;
                });

                if (rebuild) return;

                $(".delete").click((evt) => {
                    $(web_site.automaton__pict).css({ 'width' : '49%' });
                    $(web_site.automaton__pict2).css({ 'width' : '49%' });
                    $(web_site.automaton__nodes_names).addClass("invisible");

                    $(web_site.button_build).prop('disabled', true); // Делаем кнопку "Построить" недоступной
                    $(web_site.button_nfa_to_dfa).prop('disabled', true);
                    web_site.is_built = false;
                    change_page(web_site.DFA, web_site.NFA);
                    evt.preventDefault();
                    automaton_NFA.data = {
                        nodes: [],
                        edges: []
                    };
                    automaton_NFA.edges_symbols = [];
                    automaton_NFA.nodes_names.clear();
                    automaton_NFA.edges_done = [];
                    automaton_NFA.rev_edges = [];
                    $(".automaton__edges").html(`<h1>Ребра:</h1>`);
                    $(web_site.automaton__nodes_names).html(`<h1>Вершины:</h1>`);
                    $(".automaton__nodes").html(`<h1>Какие состояния конечные?</h1>`);
                    ctx.fillStyle = "white"; //белым цветом
                    ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область
                    rm = true;
                });

                if (rm) return;

                //действия при перересовке
                ctx.fillStyle = "white"; //белым цветом
                ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область

                particleSystem.eachEdge( //отрисуем каждую грань
                    function (edge, pt1, pt2) { //будем работать с гранями и точками её начала и конца
                        let temp = edge.source.name + ":" + edge.target.name;
                        let rev_temp = edge.target.name + ":" + edge.source.name;
                        if (!automaton_NFA.edges_done.includes(temp) && !automaton_NFA.edges_done.includes(rev_temp)) {
                            automaton_NFA.edges_done.push(temp);
                        }


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
                            ctx.moveTo(pt.x + 12, pt.y - 6);
                            ctx.lineTo(pt.x + 20, pt.y - 10);
                            ctx.stroke();

                            let symbols = "";
                            for (let i = 0; i < automaton_NFA.edges_symbols.length; ++i) {
                                if (edge.source.name === automaton_NFA.edges_symbols[i].split(":")[0] &&
                                    edge.target.name === automaton_NFA.edges_symbols[i].split(":")[1]) {
                                    symbols = automaton_NFA.edges_symbols[i].split(":")[2];
                                }
                            }
                            ctx.fillStyle = "black"; //цвет для шрифта
                            ctx.font = 'italic 16px sans-serif'; //шрифт
                            ctx.fillText(symbols, pt.x - 15, pt.y - 33); //пишем имя у каждой точки
                        }

                        function canvas_arrow(ctx, from, to) {
                            let symbols = "";
                            for (let i = 0; i < automaton_NFA.edges_symbols.length; ++i) {
                                if (edge.source.name === automaton_NFA.edges_symbols[i].split(":")[0] &&
                                    edge.target.name === automaton_NFA.edges_symbols[i].split(":")[1]) {
                                    symbols = automaton_NFA.edges_symbols[i].split(":")[2];
                                }
                            }
                            var headlen = 20;   // length of head in pixels
                            var angle = Math.atan2(to.y - from.y, to.x - from.x);
                            var arrow_end = {
                                x: to.x - (to.x - from.x) * 0.058,
                                y: to.y - (to.y - from.y) * 0.058
                            }

                            function draw_arrow() {
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
                                ctx.stroke();
                            }

                            if (automaton_NFA.edges_done.includes(edge.target.name + ":" + edge.source.name)) {
                                ctx.strokeStyle = "rgba(255,0,0, 0.7)"; //грани будут красный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "red"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 + 10); //пишем имя у каждой точки

                                let rev_temp = edge.target.name + ":" + edge.source.name;
                                automaton_NFA.rev_edges.push(rev_temp);

                            } else if (automaton_NFA.rev_edges.includes(edge.source.name + ":" + edge.target.name)) {
                                ctx.strokeStyle = "rgba(0,0,0, 0.7)"; //грани будут чёрным цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                ctx.stroke();
                                ctx.strokeStyle = "rgba(0,255,0, 0.7)"; //грани будут зеленый цветом с некой прозрачностью
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "green"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 - 10); //пишем имя у каждой точки
                            } else {
                                ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут черный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "black"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2); //пишем имя у каждой точки
                            }

                            ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут чёрным цветом с некой прозрачностью
                            ctx.lineWidth = 1; //толщиной в один пиксель
                        }
                    });

                particleSystem.eachNode( //теперь каждую вершину
                    function (node, pt) {  //получаем вершину и точку где она

                        var w = 10;   //ширина квадрата

                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, w, 0, 2 * Math.PI);
                        if (automaton_NFA.terms.includes(node.name)) {
                            ctx.fillStyle = "#00ff00";
                        } else if (automaton_NFA.data.nodes[0].name === node.name) {
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

        sys = arbor.ParticleSystem(1000, 600, 0.5, false, 120, 0.02, 0.6);

        sys.renderer = Renderer("#viewport"); //начинаем рисовать в выбраной области

        (() => {
            $.each(automaton_NFA.data.nodes, function (i, node) {
                sys.addNode(node.name); //добавляем вершину
            });

            $.each(automaton_NFA.data.edges, function (i, edge) {
                sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest)); //добавляем грань
            });
        })();


    })

    if (rm || rebuild) {
        return;
    }
}

function createCanvas2($) {
    let rebuild = false;
    let rm = false;

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
                        if ($(mas_cb[i]).is(':checked') && !automaton_DFA.terms.includes($(mas_cb[i]).attr("name"))) {
                            automaton_DFA.terms.push($(mas_cb[i]).attr("name"));
                        } else if (!$(mas_cb[i]).is(':checked') && automaton_DFA.terms.includes($(mas_cb[i]).attr("name"))) {
                            automaton_DFA.terms.splice(automaton_DFA.terms.indexOf($(mas_cb[i]).attr("name")), 1);
                        }
                    })
                }

                $(".build-automaton").click((evt) => {
                    evt.preventDefault();
                    rebuild = true;
                });

                if (rebuild) return;

                $(".delete").click((evt) => {
                    evt.preventDefault();
                    automaton_DFA.data = {
                        nodes: [],
                        edges: []
                    };
                    automaton_DFA.edges_symbols = [];
                    automaton_DFA.nodes_names.clear();
                    automaton_DFA.edges_done = [];
                    automaton_DFA.rev_edges = [];
                    $(".automaton__edges").html(`<h1>Ребра:</h1>`);
                    $(".automaton__nodes").html(`<h1>Какие состояния конечные?</h1>`);
                    ctx.fillStyle = "white"; //белым цветом
                    ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область
                    rm = true;
                });

                if (rm) return;

                //действия при перересовке
                ctx.fillStyle = "white"; //белым цветом
                ctx.fillRect(0, 0, canvas.width, canvas.height); //закрашиваем всю область

                particleSystem.eachEdge( //отрисуем каждую грань
                    function (edge, pt1, pt2) { //будем работать с гранями и точками её начала и конца
                        let temp = edge.source.name + ":" + edge.target.name;
                        let rev_temp = edge.target.name + ":" + edge.source.name;
                        if (!automaton_DFA.edges_done.includes(temp) && !automaton_DFA.edges_done.includes(rev_temp)) {
                            automaton_DFA.edges_done.push(temp);
                        }


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
                            ctx.moveTo(pt.x + 12, pt.y - 6);
                            ctx.lineTo(pt.x + 20, pt.y - 10);
                            ctx.stroke();

                            let symbols = "";
                            for (let i = 0; i < automaton_DFA.edges_symbols.length; ++i) {
                                if (edge.source.name === automaton_DFA.edges_symbols[i].split(":")[0] &&
                                    edge.target.name === automaton_DFA.edges_symbols[i].split(":")[1]) {
                                    symbols = automaton_DFA.edges_symbols[i].split(":")[2];
                                }
                            }
                            ctx.fillStyle = "black"; //цвет для шрифта
                            ctx.font = 'italic 16px sans-serif'; //шрифт
                            ctx.fillText(symbols, pt.x - 15, pt.y - 33); //пишем имя у каждой точки
                        }

                        function canvas_arrow(ctx, from, to) {
                            let symbols = "";
                            for (let i = 0; i < automaton_DFA.edges_symbols.length; ++i) {
                                if (edge.source.name === automaton_DFA.edges_symbols[i].split(":")[0] &&
                                    edge.target.name === automaton_DFA.edges_symbols[i].split(":")[1]) {
                                    symbols = automaton_DFA.edges_symbols[i].split(":")[2];
                                }
                            }
                            var headlen = 20;   // length of head in pixels
                            var angle = Math.atan2(to.y - from.y, to.x - from.x);
                            var arrow_end = {
                                x: to.x - (to.x - from.x) * 0.058,
                                y: to.y - (to.y - from.y) * 0.058
                            }

                            function draw_arrow() {
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle - Math.PI / 6), arrow_end.y - headlen * Math.sin(angle - Math.PI / 6));
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                ctx.lineTo(arrow_end.x - headlen * Math.cos(angle + Math.PI / 6), arrow_end.y - headlen * Math.sin(angle + Math.PI / 6));
                                ctx.stroke();
                            }

                            if (automaton_DFA.edges_done.includes(edge.target.name + ":" + edge.source.name)) {
                                ctx.strokeStyle = "rgba(255,0,0, 0.7)"; //грани будут красный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "red"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 + 10); //пишем имя у каждой точки

                                let rev_temp = edge.target.name + ":" + edge.source.name;
                                automaton_DFA.rev_edges.push(rev_temp);

                            } else if (automaton_DFA.rev_edges.includes(edge.source.name + ":" + edge.target.name)) {
                                ctx.strokeStyle = "rgba(0,0,0, 0.7)"; //грани будут чёрным цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                ctx.stroke();
                                ctx.strokeStyle = "rgba(0,255,0, 0.7)"; //грани будут зеленый цветом с некой прозрачностью
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "green"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2 - 10); //пишем имя у каждой точки
                            } else {
                                ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут черный цветом с некой прозрачностью
                                ctx.lineWidth = 1; //толщиной в один пиксель
                                ctx.beginPath();  //начинаем рисовать
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(arrow_end.x, arrow_end.y);
                                draw_arrow();

                                ctx.fillStyle = "black"; //цвет для шрифта
                                ctx.font = 'italic 16px sans-serif'; //шрифт
                                ctx.fillText(symbols, (from.x + to.x) / 2, (from.y + to.y) / 2); //пишем имя у каждой точки
                            }

                            ctx.strokeStyle = "rgba(0,0,0, 0.5)"; //грани будут чёрным цветом с некой прозрачностью
                            ctx.lineWidth = 1; //толщиной в один пиксель
                        }
                    });

                particleSystem.eachNode( //теперь каждую вершину
                    function (node, pt) {  //получаем вершину и точку где она

                        var w = 10;   //ширина квадрата

                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, w, 0, 2 * Math.PI);
                        if (automaton_DFA.terms.includes(node.name)) {
                            ctx.fillStyle = "#00ff00";
                        } else if (automaton_DFA.data.nodes[0].name === node.name) {
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

        sys = arbor.ParticleSystem(1000, 600, 0.5, false, 120, 0.02, 0.6);

        sys.renderer = Renderer("#viewport2"); //начинаем рисовать в выбраной области

        (() => {
            $.each(automaton_DFA.data.nodes, function (i, node) {
                sys.addNode(node.name); //добавляем вершину
            });

            $.each(automaton_DFA.data.edges, function (i, edge) {
                sys.addEdge(sys.getNode(edge.src), sys.getNode(edge.dest)); //добавляем грань
            });
        })();


    })

    if (rm || rebuild) {
        return;
    }
}
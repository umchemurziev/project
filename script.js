"use strict";

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
        automaton__pict.innerHTML = `<img src="images/NFA.png" alt="NFA">`;
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

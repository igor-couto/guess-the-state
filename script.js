const answerInput = document.getElementById("answerInput");
const completedElement = document.getElementById("concluidos");
const mistakesElement = document.getElementById("erros");

const selectAudio = new Audio("sound/select.wav");
const correctAudio = new Audio("sound/correct.wav");
const errorAudio = new Audio("sound/error.wav");

let mapSvg;
let selectedState;
let completed = 0;
let mistakes = 0;

document.addEventListener("DOMContentLoaded", function() {

    function defineStatesBehavior() {
        mapSvg = document.getElementById("map-svg");

        mapSvg.addEventListener(
            "load",
            () => {
                const states = mapSvg.querySelector("#Estados").children;

                Array.from(states).forEach(state => {
                    state.style.cursor = "pointer";
                    state.onclick = () => selectState(state.id);
                });
            },
            false
        );
    }

    function defineEnterKeyBehavior() {
        window.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    document.getElementById("btn").click();
                }
            },
            true
        );
    }

    function selectState(stateName) {
        selectAudio.play();
        selectedState = stateName;
        answerInput.focus();
    }

    defineStatesBehavior();
    defineEnterKeyBehavior();
});

function validateAnswer() {
    if (!selectedState) return;

    const answer = clearText(answerInput.value);

    if (clearText(selectedState) === answer) {
        correctAudio.play();
        completed++;
        completedElement.textContent = completed;
        answerInput.value = "";

        const stateElement = mapSvg.getElementById(selectedState);
        const stateStyle = getComputedStyle(stateElement);

        stateElement.onclick = null;
        stateElement.style.cursor = "auto";
        stateElement.style.fill = stateStyle.fill.replace(".5", "1");
    } else {
        errorAudio.play();
        mistakes++;
        mistakesElement.textContent = mistakes;
    }
}

function clearText(text) {
    text = text.toLowerCase().replace(/\s/g, "");
    const accentMap = {
        a: /[áàâã]/gi,
        e: /[éèê]/gi,
        i: /[íìî]/gi,
        o: /[óòôõ]/gi,
        u: /[úùû]/gi,
        c: /[ç]/gi
    };
    for (const letter in accentMap) {
        text = text.replace(accentMap[letter], letter);
    }
    return text;
}
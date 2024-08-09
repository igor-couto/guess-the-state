const answerInput = document.getElementById("answerInput");
const completedElement = document.getElementById("completed");
const mistakesElement = document.getElementById("mistakes");

const selectAudio = new Audio("../../assets/sound/select.wav");
const correctAudio = new Audio("../../assets/sound/correct.wav");
const errorAudio = new Audio("../../assets/sound/error.wav");

let mapSvg;
let selectedState;
let completed = 0;
let mistakes = 0;

function selectState(stateName) {
    selectAudio.play();

    if (selectedState) {
        const previousStateElement = mapSvg.getElementById(selectedState);
        previousStateElement.classList.remove("selected-state");
    }

    selectedState = stateName;
    const currentStateElement = mapSvg.getElementById(selectedState);
    
    const bbox = currentStateElement.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    currentStateElement.style.transformOrigin = `${centerX}px ${centerY}px`;

    currentStateElement.classList.add("selected-state");

    answerInput.focus();
}

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

                selectRandomState(states);
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

    defineStatesBehavior();
    defineEnterKeyBehavior();
});

function selectRandomState(states) {
    const selectableStates = Array.from(states).filter(state => state.style.cursor === "pointer");
    if (selectableStates.length === 0) {
        alert("Congratulations! You've completed the game.");
        return;
    }
    const randomIndex = Math.floor(Math.random() * selectableStates.length);
    const randomState = selectableStates[randomIndex];
    selectState(randomState.id);
}

function validateAnswer() {
    if (!selectedState || !answerInput.value) return;

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
        stateElement.classList.remove("selected-state");

        selectedState = null;

        const states = mapSvg.querySelector("#Estados").children;
        selectRandomState(states);
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
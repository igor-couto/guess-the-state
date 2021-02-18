const answerInput = document.getElementById("answerInput");
const completedElement = document.getElementById("concluidos");
const mistakesElement = document.getElementById("erros");

const selectAudio = new Audio("sound/select.wav");
const correctAudio = new Audio("sound/correct.wav");
const errorAudio = new Audio("sound/error.wav");

let svgDocument;

let selectedState;
let completed = 0;
let mistakes = 0;

DefineStatesBehavior();

DefineEnterKeyBehavior();

function DefineStatesBehavior() {
  const mapSvg = document.getElementById("map-svg");

  mapSvg.addEventListener(
    "load",
    () => {
      svgDocument = mapSvg.contentDocument;
      let states = svgDocument.getElementById("Estados").children;

      for (i = 0; i < states.length; i++) {
        let state = states[i];
        state.style = "cursor: pointer";
        state.onclick = () => selectState(state.id);
      }
    },
    false
  );
}

function DefineEnterKeyBehavior() {
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key == "Enter") document.getElementById("btn").click();
    },
    true
  );
}

function selectState(stateName) {
  selectAudio.play();
  selectedState = stateName;
  answerInput.focus();
}

function validateAnswer() {
  if (!selectedState) return;

  let answer = clearText(answerInput.value);

  if (clearText(selectedState) === answer) {
    correctAudio.play();

    completed++;
    completedElement.innerHTML = completed;

    answerInput.value = "";

    let stateElement = svgDocument.getElementById(selectedState);
    let stateStyle = getComputedStyle(stateElement);

    stateElement.onclick = null;
    stateElement.style = "cursor: auto;";
    stateElement.style = "fill: " + stateStyle.fill.replace(".5", "1");
  } else {
    errorAudio.play();
    mistakes++;
    mistakesElement.innerHTML = mistakes;
  }
}

function clearText(text) {
  text = text.toLowerCase();
  text = text.replace(" ", "");
  text = text.replace(new RegExp("[áàâã]", "gi"), "a");
  text = text.replace(new RegExp("[éèê]", "gi"), "e");
  text = text.replace(new RegExp("[íìî]", "gi"), "i");
  text = text.replace(new RegExp("[óòôõ]", "gi"), "o");
  text = text.replace(new RegExp("[úùû]", "gi"), "u");
  text = text.replace(new RegExp("[ç]", "gi"), "c");
  return text;
}

const BRAZIL_STATES = [
    { id: "Acre", name: "Acre", answers: ["Acre", "AC"] },
    { id: "Alagoas", name: "Alagoas", answers: ["Alagoas", "AL"] },
    { id: "Amapá", name: "Amapá", answers: ["Amapá", "Amapa", "AP"] },
    { id: "Amazonas", name: "Amazonas", answers: ["Amazonas", "AM"] },
    { id: "Bahia", name: "Bahia", answers: ["Bahia", "BA"] },
    { id: "Ceará", name: "Ceará", answers: ["Ceará", "Ceara", "CE"] },
    { id: "Distrito Federal", name: "Distrito Federal", answers: ["Distrito Federal", "DF"] },
    { id: "Espírito Santo", name: "Espírito Santo", answers: ["Espírito Santo", "Espirito Santo", "ES"] },
    { id: "Goiás", name: "Goiás", answers: ["Goiás", "Goias", "GO"] },
    { id: "Maranhão", name: "Maranhão", answers: ["Maranhão", "Maranhao", "MA"] },
    { id: "Mato Grosso", name: "Mato Grosso", answers: ["Mato Grosso", "MT"] },
    { id: "Mato Grosso do Sul", name: "Mato Grosso do Sul", answers: ["Mato Grosso do Sul", "MS"] },
    { id: "Minas Gerais", name: "Minas Gerais", answers: ["Minas Gerais", "MG"] },
    { id: "Pará", name: "Pará", answers: ["Pará", "Para", "PA"] },
    { id: "Paraíba", name: "Paraíba", answers: ["Paraíba", "Paraiba", "PB"] },
    { id: "Paraná", name: "Paraná", answers: ["Paraná", "Parana", "PR"] },
    { id: "Pernambuco", name: "Pernambuco", answers: ["Pernambuco", "PE"] },
    { id: "Piauí", name: "Piauí", answers: ["Piauí", "Piaui", "PI"] },
    { id: "Rio de Janeiro", name: "Rio de Janeiro", answers: ["Rio de Janeiro", "RJ"] },
    { id: "Rio Grande do Norte", name: "Rio Grande do Norte", answers: ["Rio Grande do Norte", "RN"] },
    { id: "Rio Grande do Sul", name: "Rio Grande do Sul", answers: ["Rio Grande do Sul", "RS"] },
    { id: "Rondônia", name: "Rondônia", answers: ["Rondônia", "Rondonia", "RO"] },
    { id: "Roraima", name: "Roraima", answers: ["Roraima", "RR"] },
    { id: "Santa Catarina", name: "Santa Catarina", answers: ["Santa Catarina", "SC"] },
    { id: "São Paulo", name: "São Paulo", answers: ["São Paulo", "Sao Paulo", "SP"] },
    { id: "Sergipe", name: "Sergipe", answers: ["Sergipe", "SE"] },
    { id: "Tocantins", name: "Tocantins", answers: ["Tocantins", "TO"] }
];

window.createCountryGame({
    regions: BRAZIL_STATES,
    completionMessage: "Congratulations! You've completed Brazil.",
    map: {
        containerSelector: "#map",
        src: "../../assets/states.svg",
        fallbackScriptSrc: "./map.js",
        fallbackGlobal: "BRAZIL_MAP_SVG",
        svgId: "map-svg",
        ariaLabel: "Brazil's map",
        regionsSelector: "#Estados > path",
        errorMessage: "The Brazil map could not be loaded."
    },
    elements: {
        inputSelector: "#answerInput",
        buttonSelector: "#btn",
        completedSelector: "#completed",
        totalSelector: "#total",
        mistakesSelector: "#mistakes"
    },
    sounds: {
        select: "../../assets/sound/select.wav",
        correct: "../../assets/sound/correct.wav",
        error: "../../assets/sound/error.wav"
    }
});

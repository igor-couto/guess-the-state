const ARGENTINA_PROVINCES = [
    { id: "Buenos Aires", name: "Buenos Aires", answers: ["Buenos Aires", "Provincia de Buenos Aires"] },
    { id: "Catamarca", name: "Catamarca", answers: ["Catamarca"] },
    { id: "Chaco", name: "Chaco", answers: ["Chaco"] },
    { id: "Chubut", name: "Chubut", answers: ["Chubut"] },
    { id: "Ciudad de Buenos Aires", name: "Ciudad de Buenos Aires", answers: ["Ciudad de Buenos Aires", "CABA", "Capital Federal", "Ciudad Autónoma de Buenos Aires"] },
    { id: "Córdoba", name: "Córdoba", answers: ["Córdoba"] },
    { id: "Corrientes", name: "Corrientes", answers: ["Corrientes"] },
    { id: "Entre Ríos", name: "Entre Ríos", answers: ["Entre Ríos"] },
    { id: "Formosa", name: "Formosa", answers: ["Formosa"] },
    { id: "Jujuy", name: "Jujuy", answers: ["Jujuy"] },
    { id: "La Pampa", name: "La Pampa", answers: ["La Pampa"] },
    { id: "La Rioja", name: "La Rioja", answers: ["La Rioja"] },
    { id: "Mendoza", name: "Mendoza", answers: ["Mendoza"] },
    { id: "Misiones", name: "Misiones", answers: ["Misiones"] },
    { id: "Neuquén", name: "Neuquén", answers: ["Neuquén"] },
    { id: "Río Negro", name: "Río Negro", answers: ["Río Negro"] },
    { id: "Salta", name: "Salta", answers: ["Salta"] },
    { id: "San Juan", name: "San Juan", answers: ["San Juan"] },
    { id: "San Luis", name: "San Luis", answers: ["San Luis"] },
    { id: "Santa Cruz", name: "Santa Cruz", answers: ["Santa Cruz"] },
    { id: "Santa Fe", name: "Santa Fe", answers: ["Santa Fe"] },
    { id: "Santiago del Estero", name: "Santiago del Estero", answers: ["Santiago del Estero"] },
    { id: "Tierra del Fuego", name: "Tierra del Fuego", answers: ["Tierra del Fuego", "TDF"] },
    { id: "Tucumán", name: "Tucumán", answers: ["Tucumán"] }
];

window.createCountryGame({
    regions: ARGENTINA_PROVINCES,
    completionMessage: "Congratulations! You've completed Argentina.",
    map: {
        containerSelector: "#map",
        src: "../../assets/argentina.svg",
        fallbackScriptSrc: "./map.js",
        fallbackGlobal: "ARGENTINA_MAP_SVG",
        svgId: "map-svg",
        ariaLabel: "Argentina's map",
        regionsSelector: "#Provinces > path",
        errorMessage: "The Argentina map could not be loaded."
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

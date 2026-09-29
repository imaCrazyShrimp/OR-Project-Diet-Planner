const dietSelector = document.getElementById("diet-select");
const nextButton = document.getElementById("btn-next"); // const means var that can't accept other values
const previousButton = document.getElementById("btn-previous");
const problemSummary = document.getElementById("problem-summary");
const graphContainer = document.getElementById("graph-container");
const results = document.getElementById("results");

const dietProblems = {
    "Rice-and-Beans": {
        name: "Arroz y Frijoles",
        objective: { x: 0.5, y:0.8 },
        constraints: [
            { label: "Protein",  a: 4,    b: 8,   operator: ">=", value: 32},
            { label: "Calories", a: 200,  b: 220, operator: ">=", value: 800}
        ]
    }
};
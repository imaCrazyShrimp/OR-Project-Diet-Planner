// state variables
let currentProblem = null; 
let currentStep = 0;
let currentBounds = null;

// reference selector
const dietSelector = document.getElementById("diet-select");
const nextButton = document.getElementById("btn-next"); // const means var that can't accept other values
const previousButton = document.getElementById("btn-previous");
const problemSummary = document.getElementById("problem-summary");
const graphContainer = document.getElementById("graph-container");
const results = document.getElementById("results");

const CANVAS_SIZE = 275;

const dietProblems = {
    "Rice-and-Beans": {
        name: "Arroz y Frijoles",
        objective: { x: 0.5, y: 0.8 },
        constraints: [
            { label: "Proteína",  a: 4,    b: 8,   operator: ">=", value: 32  },
            { label: "Calorías", a: 200,  b: 220, operator: ">=", value: 1000 }
        ]
    },
   
    "Eggs-and-Toasts": {
        name: "Huevos y Pan Tostado",
        objective: { x: 0.6, y: 0.5 },
        constraints: [
            { label: "Proteína",  a: 6,    b: 4,   operator: ">=", value: 20  },
            { label: "Calorías", a: 70,  b: 70,   operator: ">=", value: 300 }
        ]
    },

    "Chicken-and-Salad": {
        name: "Pollo y Ensalada",
        objective: { x: 1.50, y: 0.75 },
        constraints: [
            { label: "Proteína",  a: 25,  b: 2,   operator: ">=", value: 50  },
            { label: "Calorías", a: 150, b: 50,  operator: ">=", value: 400 }
        ]
    }
};

// functions
function renderGraph() {
    graphContainer.innerHTML = "";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", CANVAS_SIZE);
    svg.setAttribute("height", CANVAS_SIZE);

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", CANVAS_SIZE);
    xAxis.setAttribute("x2", CANVAS_SIZE);
    xAxis.setAttribute("y2", CANVAS_SIZE);
    xAxis.setAttribute("stroke", "black");

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", CANVAS_SIZE);
    yAxis.setAttribute("stroke", "black");

    svg.appendChild(xAxis);
    svg.appendChild(yAxis);
    graphContainer.appendChild(svg);

    return svg;
}

function renderConstraints(svg) {
    if (!currentProblem) {
        return;
    }

    currentProblem.constraints.forEach(function(constraint, index) {
        
        if (currentStep >= index + 1) {
            const xIntercept = constraint.value / constraint.a;
            const yIntercept = constraint.value / constraint.b;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", toSvgX(xIntercept));
            line.setAttribute("y1", toSvgY(0));
            line.setAttribute("x2", toSvgX(0));
            line.setAttribute("y2", toSvgY(yIntercept));
            line.setAttribute("stroke", "red");

            svg.appendChild(line);
        }
    });
}

function render() {
    renderSummary();
    const svg = renderGraph();
    renderConstraints(svg);
}

function renderSummary() {
        
    if (!currentProblem) { // check if null or undefined
        problemSummary.textContent = "";
        return;
    }

    const sentence = `<strong>Minimizar costo:</strong><br>C = ${currentProblem.objective.x}x + ${currentProblem.objective.y}y  `;
    let constraintParts = [];

    currentProblem.constraints.forEach(function(constraint){
        constraintParts.push(`${constraint.label}: ${constraint.a}x + ${constraint.b}y ${constraint.operator} ${constraint.value}`);
    });

    const constraintText = constraintParts.join("<br>");
    const fullSumary = `${sentence}<br><strong>Restricciones:</strong><br>${constraintText}`;
        
    problemSummary.innerHTML = fullSumary;
}

function renderStep() {
     
    if (!currentProblem) { // check if null or undefined
        graphContainer.textContent = "";
        return;
    }

    const maxStep = getMaxStep();

    const sentence = `Paso ${currentStep} de ${maxStep}`;

    graphContainer.textContent = sentence;

    console.log(sentence);
}

function getMaxStep() {
    return currentProblem.constraints.length + 2;
}

function getAxisBounds(problem) {
    let maxX = 0;
    let maxY = 0;

    problem.constraints.forEach(function(constraint) {
        const xIntercept = constraint.value / constraint.a;
        const yIntercept = constraint.value / constraint.b;

        if (xIntercept > maxX) {
            maxX = xIntercept;
        }
        if (yIntercept > maxY) {
            maxY = yIntercept;
        }
    });

    return {
        maxX: maxX * 1.2, // add padding to keep the lines from touching the edges
        maxY: maxY * 1.2
    };
}

function toSvgX(mathX) {
    return (mathX / currentBounds.maxX) * CANVAS_SIZE;
}

function toSvgY(mathY) {
    return CANVAS_SIZE - (mathY / currentBounds.maxY) * CANVAS_SIZE;
}

// Event listeners
dietSelector.addEventListener("change", function() {
    currentProblem = dietProblems[dietSelector.value];

    if (!currentProblem) {
        currentBounds = null;
        currentStep = 0;
        render();
        return;
    }
    
    currentStep = 0;  
    currentBounds = getAxisBounds(currentProblem);
    render();
});

nextButton.addEventListener("click", function() {
    if (currentProblem === null) { 
        return; // nothing selected yet, do nothing
    }
    
    const maxStep = getMaxStep();

    if (currentStep < maxStep) {
        currentStep = currentStep + 1;
    }

    render();
});

previousButton.addEventListener("click", function() {
    if (currentProblem === null) {
        return;
    }

    if (currentStep > 0) { 
        currentStep = currentStep - 1;
    }

    render();
});
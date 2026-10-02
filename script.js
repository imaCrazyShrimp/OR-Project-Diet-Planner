// state variables
let currentProblem = null; 
let currentStep = 0;

// reference selector
const dietSelector = document.getElementById("diet-select");
const nextButton = document.getElementById("btn-next"); // const means var that can't accept other values
const previousButton = document.getElementById("btn-previous");
const problemSummary = document.getElementById("problem-summary");
const graphContainer = document.getElementById("graph-container");
const results = document.getElementById("results");

const dietProblems = {
    "Rice-and-Beans": {
        name: "Arroz y Frijoles",
        objective: { x: 0.5, y: 0.8 },
        constraints: [
            { label: "Proteína",  a: 4,    b: 8,   operator: ">=", value: 32  },
            { label: "Calorías", a: 200,  b: 220, operator: ">=", value: 800 }
        ]
    },
   
    "Eggs-and-Toasts": {
        name: "Huevos y Pan Tostado",
        objective: { x: 0.6, y: 0.4 },
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

// Event listeners
dietSelector.addEventListener("change", function() {
    currentProblem = dietProblems[dietSelector.value];
    
    if (!currentProblem) { // check if null or undefined
        problemSummary.textContent = "";
        return;
    }

    const sentence = `<strong>Minimizar costo:</strong><br>C = ${currentProblem.objective.x}x + ${currentProblem.objective.y}y</li>`;
    let constraintParts = [];

    currentProblem.constraints.forEach(function(constraint){
        constraintParts.push(`${constraint.label}: ${constraint.a}x + ${constraint.b}y >= ${constraint.value}`);
    });

    const constraintText = constraintParts.join("<br>");
    const fullSumary = `${sentence}<br><strong>Restricciones:</strong><br>${constraintText}`;
        
    problemSummary.innerHTML = fullSumary;

    console.log(sentence);
    console.log(constraintText);

    currentStep = 0;  
    console.log(currentProblem);
});

nextButton.addEventListener("click", function() {
    if (currentProblem === null) { 
        return; // nothing selected yet, do nothing
    }
    
    const maxStep = currentProblem.constraints.length + 2;

    if (currentStep < maxStep) {
        currentStep = currentStep + 1;
    }

    console.log(currentStep);
});

previousButton.addEventListener("click", function() {
    if (currentProblem === null) {
        return;
    }

    if (currentStep > 0) { 
        currentStep = currentStep - 1;
    }

    console.log(currentStep);
});
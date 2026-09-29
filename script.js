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
            { label: "Protein",  a: 4,    b: 8,   operator: ">=", value: 32  },
            { label: "Calories", a: 200,  b: 220, operator: ">=", value: 800 }
        ]
    },
   
    "Eggs-and-Toasts": {
        name: "Huevos y Pan Tostado",
        objective: { x: 0.6, y: 0.4 },
        constraints: [
            { label: "Protein",  a: 6,    b: 4,   operator: ">=", value: 20  },
            { label: "Calories", a: 70,  b: 70,   operator: ">=", value: 300 }
        ]
    },

    "Chicken-and-Salad": {
        name: "Pollo y Ensalada",
        objective: { x: 1.50, y: 0.75 },
        constraints: [
            { label: "Protein",  a: 25,  b: 2,   operator: ">=", value: 50  },
            { label: "Calories", a: 150, b: 50,  operator: ">=", value: 400 }
        ]
    }
};
// state variables
let currentProblem = null; 
let currentStep = 0;
let currentBounds = null;
let currentCorners = null;
let currentOptimal = null;

// reference selector
const dietSelector = document.getElementById("diet-select");
const nextButton = document.getElementById("btn-next"); // const means var that can't accept other values
const previousButton = document.getElementById("btn-previous");
const problemSummary = document.getElementById("problem-summary");
const graphContainer = document.getElementById("graph-container");
const results = document.getElementById("results");

const CANVAS_SIZE = 400;                    // the plotting area
const MARGIN = 45;                          // room around it for the numbers
const TOTAL_SIZE = CANVAS_SIZE + MARGIN * 2;
const CONSTRAINT_COLORS = ["#FF8A3D", "#607D8B", "#0F3D2E"];

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
function createSvgText(content, x, y, anchor) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", anchor);
    text.setAttribute("font-size", 12);
    text.setAttribute("fill", "#607D8B");
    text.textContent = content;
    return text;
}

function renderGraph() {
    graphContainer.innerHTML = "";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}`);

    const left = MARGIN;
    const right = MARGIN + CANVAS_SIZE;
    const top = MARGIN;
    const bottom = MARGIN + CANVAS_SIZE;

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", left);
    xAxis.setAttribute("y1", bottom);
    xAxis.setAttribute("x2", right);
    xAxis.setAttribute("y2", bottom);
    xAxis.setAttribute("stroke", "#0F3D2E");
    xAxis.setAttribute("stroke-width", 2);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", left);
    yAxis.setAttribute("y1", top);
    yAxis.setAttribute("x2", left);
    yAxis.setAttribute("y2", bottom);
    yAxis.setAttribute("stroke", "#0F3D2E");
    yAxis.setAttribute("stroke-width", 2);

    svg.appendChild(xAxis);
    svg.appendChild(yAxis);

    // numbers along the axes (only when a problem is selected)
    if (currentBounds) {
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
            const xValue = (currentBounds.maxX * i) / ticks;
            const yValue = (currentBounds.maxY * i) / ticks;
            svg.appendChild(createSvgText(xValue.toFixed(1), toSvgX(xValue), bottom + 20, "middle"));
            svg.appendChild(createSvgText(yValue.toFixed(1), left - 8, toSvgY(yValue) + 4, "end"));
        }
    }

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
            line.setAttribute("stroke", CONSTRAINT_COLORS[index % CONSTRAINT_COLORS.length]);
            line.setAttribute("stroke-width", 2);

            svg.appendChild(line);
        }
    });
}

function render() {
    renderSummary();
    const svg = renderGraph();
    renderConstraints(svg);
    renderRegion(svg);
    renderOptimal(svg);
    renderResults();
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
    return MARGIN + (mathX / currentBounds.maxX) * CANVAS_SIZE;
}

function toSvgY(mathY) {
    return MARGIN + CANVAS_SIZE - (mathY / currentBounds.maxY) * CANVAS_SIZE;
}

function satisfies(point, constraint) {
    const total = constraint.a * point.x + constraint.b * point.y;

    if (constraint.operator === ">=") {
        return total >= constraint.value - 1e-9;
    }
    if (constraint.operator === "<=") {
        return total <= constraint.value + 1e-9;
    }
    return false;
}

function getCornerPoints(problem) {
    const constraints = problem.constraints;
    const candidates = [];

    // 1. where each line crosses the axes
    constraints.forEach(function(c) {
        candidates.push({ x: c.value / c.a, y: 0 });
        candidates.push({ x: 0, y: c.value / c.b });
    });

    // 2. where each pair of lines crosses each other
    for (let i = 0; i < constraints.length; i++) {
        for (let j = i + 1; j < constraints.length; j++) {
            const c1 = constraints[i];
            const c2 = constraints[j];

            const det = c1.a * c2.b - c2.a * c1.b;
            if (det === 0) {
                continue; // parallel lines never cross
            }

            candidates.push({
                x: (c1.value * c2.b - c2.value * c1.b) / det,
                y: (c1.a * c2.value - c2.a * c1.value) / det
            });
        }
    }

    // 3. keep only the feasible ones
    return candidates.filter(function(p) {
        if (p.x < -1e-9 || p.y < -1e-9) {
            return false;
        }
        return constraints.every(function(c) {
            return satisfies(p, c);
        });
    });
}

// Event listeners
dietSelector.addEventListener("change", function() {
    currentProblem = dietProblems[dietSelector.value];
    currentStep = 0;

    if (!currentProblem) {
        currentBounds = null;
        currentCorners = null;
        currentOptimal = null;
        render();
        return;
    }

    currentBounds = getAxisBounds(currentProblem);
    currentCorners = getCornerPoints(currentProblem);
    currentOptimal = getOptimalPoint(currentProblem, currentCorners);
    render();
});

function getCost(problem, point) {
    return problem.objective.x * point.x + problem.objective.y * point.y;
}

function getOptimalPoint(problem, corners) {
    let best = null;
    let bestCost = Infinity;

    corners.forEach(function(point) {
        const cost = getCost(problem, point);
        if (cost < bestCost) {
            bestCost = cost;
            best = point;
        }
    });

    if (!best) {
        return null; // no feasible corners at all
    }

    return { x: best.x, y: best.y, cost: bestCost };
}

function renderOptimal(svg) {
    if (!currentProblem || !currentOptimal) {
        return;
    }
    if (currentStep < currentProblem.constraints.length + 2) {
        return; // not the final step yet
    }

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", toSvgX(currentOptimal.x));
    dot.setAttribute("cy", toSvgY(currentOptimal.y));
    dot.setAttribute("r", 7);
    dot.setAttribute("fill", "#FF8A3D");

    svg.appendChild(dot);
}

function renderResults() {
    if (!currentProblem || !currentOptimal || currentStep < getMaxStep()) {
        results.textContent = "";
        return;
    }

    results.innerHTML = `<strong>Solución óptima:</strong><br>
        x = ${currentOptimal.x.toFixed(2)}, y = ${currentOptimal.y.toFixed(2)}<br>
        <strong>Costo mínimo:</strong> $${currentOptimal.cost.toFixed(2)}`;
}

function getRegionPolygon() {
    const boxCorners = [
        { x: 0, y: 0 },
        { x: currentBounds.maxX, y: 0 },
        { x: currentBounds.maxX, y: currentBounds.maxY },
        { x: 0, y: currentBounds.maxY }
    ];

    // only the box corners that satisfy every constraint
    const feasibleBoxCorners = boxCorners.filter(function(p) {
        return currentProblem.constraints.every(function(c) {
            return satisfies(p, c);
        });
    });

    const points = currentCorners.concat(feasibleBoxCorners);

    // center of the shape, used to sort the points around it
    let cx = 0;
    let cy = 0;
    points.forEach(function(p) {
        cx += p.x / points.length;
        cy += p.y / points.length;
    });

    points.sort(function(p, q) {
        return Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx);
    });

    return points;
}

function renderRegion(svg) {
    if (!currentProblem || !currentCorners || currentCorners.length === 0) {
        return;
    }
    if (currentStep < currentProblem.constraints.length + 1) {
        return; // not this step yet
    }

    const pointsAttr = getRegionPolygon().map(function(p) {
        return toSvgX(p.x) + "," + toSvgY(p.y);
    }).join(" ");

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", pointsAttr);
    polygon.setAttribute("fill", "#4CAF50");
    polygon.setAttribute("fill-opacity", 0.25);

    svg.insertBefore(polygon, svg.firstChild); // draw it behind the axes and lines
}

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

render();
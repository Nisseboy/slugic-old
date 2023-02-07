//Global variables
let currentGate;
let currentGateName;
let unit;
let sizeDivisions = 30;
let step = 4;

//Defining DOM Elements
const mainElem = document.getElementsByClassName("main")[0];
const footerElem = document.getElementsByClassName("footer")[0];
const themeSwitcherElem = document.getElementsByClassName("theme-switcher")[0];


//The settings menu
themeSwitcherElem.onclick = e => {
  document.body.classList.toggle("light-theme");
  themeSwitcherElem.classList.toggle("fa-sun");
  themeSwitcherElem.classList.toggle("fa-moon");
}

//Sizing
function resize() {
  unit = mainElem.getBoundingClientRect().height / sizeDivisions;
  document.body.style.setProperty("--unit", unit + "px");
}
resize();
window.onresize = resize;



//Loading gates
//TODO: load gates
if (Object.keys(gates.custom).length == 0) {
  currentGate = new Gate("computer", ["a", "b", "c", "c"], ["a", "b", "c"]);
  currentGateName = "computer";

  for (let i = 0; i < 5; i++) {
    let x = Math.floor(Math.random() * sizeDivisions);
    let y = Math.floor(Math.random() * sizeDivisions);
    let types = Object.keys(gates.all);
    let type = types[Math.floor(Math.random() * types.length)];

    let gate = {
      x,
      y,
      type,
      id: generateID()
    }

    currentGate.gates[gate.id] = gate;
  }

  gates.custom[currentGateName] = currentGate;
  gates.all[currentGateName] = currentGate;
}


//Drawing the gates
let drawnGates = {};

function draw() {
  for (let i in currentGate.gates) {
    let gate = currentGate.gates[i];
    let gateType = gates.all[gate.type];
    if (drawnGates[i]) {
      drawnGates[i].style.left = `calc(var(--unit) * ${gate.x})`;
      drawnGates[i].style.top = `calc(var(--unit) * ${gate.y})`;
      break;
    }
    let gateElem = document.createElement("div");

    let inputLen = gateType.inputs.length;
    let outputLen = gateType.outputs.length;
    let gateHeight = Math.max(inputLen, outputLen) * 0.75;

    gateElem.className = "gate";
    gateElem.style.left = `calc(var(--unit) * ${gate.x})`;
    gateElem.style.top = `calc(var(--unit) * ${gate.y})`;
    gateElem.innerText = gate.type;
    gateElem.style.setProperty("--name-length", Math.ceil(gate.type.length / 2) * 2);
    gateElem.style.setProperty("--num-inputs", inputLen);
    gateElem.style.setProperty("--num-outputs", outputLen);
    gateElem.style.backgroundColor = gateType.color;

    let plugHolderLeft = document.createElement("div");
    plugHolderLeft.className = "plug-holder left";
    for (let j in gateType.inputs) {
      let plug = document.createElement("div");
      plug.className = "plug";

      let baseY = gateHeight / inputLen * (j * 1 + 0.5);
      let finalY;
      if (baseY > gateHeight / 2) {
        finalY = Math.ceil(baseY * step) / step;
      } else {
        finalY = Math.floor(baseY * step) / step;
      }
      plug.style.top = `calc(${finalY - 0.25} * var(--unit))`;

      plugHolderLeft.appendChild(plug);
    }

    let plugHolderRight = document.createElement("div");
    plugHolderRight.className = "plug-holder right";
    for (let j in gateType.outputs) {
      let plug = document.createElement("div");
      plug.className = "plug";
      
      let baseY = gateHeight / outputLen * (j * 1 + 0.5);
      let finalY;
      if (baseY > gateHeight / 2) {
        finalY = Math.ceil(baseY * step) / step;
      } else {
        finalY = Math.floor(baseY * step) / step;
      }
      plug.style.top = `calc(${finalY - 0.25} * var(--unit))`;

      plugHolderRight.appendChild(plug);
    }

    gateElem.prepend(plugHolderLeft);
    gateElem.appendChild(plugHolderRight);
    mainElem.appendChild(gateElem);

    gateElem.dataset.id = gate.id;

    gateElem.addEventListener("mousedown", e => {startDrag(e, gate)});

    drawnGates[i] = gateElem;
    gate.elem = gateElem;
  }
  for (let i in drawnGates) {
    if (!currentGate.gates[i]) {
      drawnGates[i].remove();
      delete drawnGates[i];
    }
  }
}

draw();


//Dragging objects (They must have x, y, elem properties)
let dragged = [];
function startDrag(e, object) {
  let coords = getCoords(e);
  if (!e.ctrlKey) {
    clearSelected();
  }
  object.elem.classList.add("selected");

  dragged = [];
  getSelected().forEach((elem, i) => {
    //TODO: make this compatible with all object tpyes
    let ob = currentGate.gates[elem.dataset.id];
    dragged.push({
      offset: {
        x: ob.x - coords.x / unit,
        y: ob.y - coords.y / unit,
      },
      object: ob
    });
  });

  document.addEventListener("mousemove", whileDrag);
  document.addEventListener("mouseup", stopDrag);
  whileDrag(e);

  e.stopPropagation();
}
function whileDrag(e) {
  let coords = getCoords(e);
  dragged.forEach((object, i) => {
    object.object.x = Math.floor((coords.x / unit + object.offset.x) * 4) / 4;
    object.object.y = Math.floor((coords.y / unit + object.offset.y) * 4) / 4;
  });

  draw();
}
function stopDrag(e) {
  document.removeEventListener("mousemove", whileDrag);
  document.removeEventListener("mouseup", stopDrag);
}



mainElem.addEventListener("mousemove", e => {
  let coords = getCoords(e);
  let {x, y} = toGrid(coords);
  document.getElementsByClassName("marker")[0].style.left = x + "px";
  document.getElementsByClassName("marker")[0].style.top = y + "px";
});

//Snaps a coordinate to nearest grid point
function toGrid(pos) {
  let uds = unit/step;
  let x = Math.floor(pos.x / uds) * uds;
  let y = Math.floor(pos.y / uds) * uds;

  return {x, y};
}

//From a mouse event, returns the coordinates on the main element
function getCoords(e) {
  let box = mainElem.getBoundingClientRect();
  return {
    x: e.clientX - box.x,
    y: e.clientY - box.y,
  };
}

//Returns array of all selected elements
function getSelected() {
  return Array.from(document.getElementsByClassName("selected"));
}
//Removes selected class from all elements
function clearSelected() {
  getSelected().forEach(element => {
    element.classList.remove("selected");
  });
}
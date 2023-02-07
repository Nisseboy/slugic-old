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

  let gate = {
    x: 10,
    y: 5,
    type: "and",
    id: generateID()
  };
  currentGate.gates[gate.id] = gate;

  gates.custom[currentGateName] = currentGate;
  gates.all[currentGateName] = currentGate;
}


//Drawing the gates
let drawnGates = {};

setInterval(draw, 1000 / 60);
function draw() {
  for (let i in currentGate.gates) {
    let gate = currentGate.gates[i];
    let gateType = gates.all[gate.type];
    if (!drawnGates[i]) {
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

      drawnGates[i] = gateElem;
    }
  }
}


mainElem.addEventListener("mousemove", e => {
  let uds = unit/step;
  let x = Math.floor(e.offsetX / uds) * uds;
  let y = Math.floor(e.offsetY / uds) * uds;
  document.getElementsByClassName("marker")[0].style.left = x + "px";
  document.getElementsByClassName("marker")[0].style.top = y + "px";
});
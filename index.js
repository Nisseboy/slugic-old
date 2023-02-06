//Global variables
let currentGate;
let currentGateName;
let unit;
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
  unit = mainElem.getBoundingClientRect().height / 40;
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
    if (!drawnGates[i]) {
      let gateElem = document.createElement("div");
      gateElem.className = "gate";
      gateElem.style.left = `calc(var(--unit) * ${gate.x})`;
      gateElem.style.top = `calc(var(--unit) * ${gate.y})`;
      mainElem.appendChild(gateElem);
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
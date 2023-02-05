
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




mainElem.addEventListener("mousemove", e => {
  let uds = unit/step;
  let x = Math.floor(e.offsetX / uds) * uds;
  let y = Math.floor(e.offsetY / uds) * uds;
  document.getElementsByClassName("marker")[0].style.left = x + "px";
  document.getElementsByClassName("marker")[0].style.top = y + "px";
});
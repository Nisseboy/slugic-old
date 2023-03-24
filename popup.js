//Global variables for elements
const popupsElem = document.getElementsByClassName("popups")[0];
const popupGateElem = document.getElementsByClassName("popup-gate")[0];


//Make color pickers work
let colorPickers = document.getElementsByClassName("color-picker");
for (let i in Array.from(colorPickers)) {
  let picker = colorPickers[i];
  let sliders = picker.getElementsByClassName("color-slider");
  

  updateSliders(picker);

  const updateColor = () => {
    let h = sliders[0].children[1].value * 3.6;
    let s = sliders[1].children[1].value;
    let l = sliders[2].children[1].value;

    let color = HSLToHEX(h, s, l);
    picker.style.setProperty("--color", color);
  }

  
  for (let i in Array.from(sliders)) {
    let slider = sliders[i].children[1];
    slider.addEventListener("mousemove", e => {
      updateColor();
    });
  }
}
function updateSliders(picker) {
  let sliders = picker.getElementsByClassName("color-slider");

  let color = picker.style.getPropertyValue("--color");
  let [h, s, l] = HEXToHSL(color);

  sliders[0].children[1].value = h / 3.6;
  sliders[1].children[1].value = s;
  sliders[2].children[1].value = l;
}



async function popupGate(gate) {
  popupsElem.style.display = "flex";
  popupGateElem.style.display = "flex";

  let gateName = popupGateElem.getElementsByClassName("input-holder")[0].children[0];
  gateName.value = gate.name;
  gateName.select();

  let gateColor = popupGateElem.getElementsByClassName("color-picker")[0];
  gateColor.style.setProperty("--color", gate.color);
  updateSliders(gateColor);
  
  let cancelButton = popupGateElem.getElementsByClassName("action-button")[0];
  let confirmButton = popupGateElem.getElementsByClassName("action-button")[1];

  return createPromise(cancelButton, confirmButton, ()=>{return {name: gateName.value, color: gateColor.style.getPropertyValue("--color")}});
}


function createPromise(cancelButton, confirmButton, getResponse) {
  let decided = false;
  let verdict = true;

  function cancelHandler() {
    decided = true;
    verdict = false;
  }
  function confirmHandler() {
    decided = true;
    verdict = true;
  }
  function keyHandler(e) {
    if (e.key == "Enter") {
      confirmHandler();
    }
    if (e.key == "Escape") {
      cancelHandler();
    }
  }

  cancelButton.addEventListener("click", cancelHandler);
  confirmButton.addEventListener("click", confirmHandler);
  document.addEventListener("keydown", keyHandler);

  return new Promise((resolve, reject) => {
    let interval = setInterval(()=>{
      if (decided) {
        cancelButton.removeEventListener("click", cancelHandler);
        confirmButton.removeEventListener("click", confirmHandler);
        document.removeEventListener("keydown", keyHandler);
        
        if (verdict == true) 
          resolve(getResponse());
        else 
          reject();
        
        popupsElem.style.display = "none";
        popupGateElem.style.display = "none";
        clearInterval(interval);
      }
    }, 1000 / 60);
  });
}


//From https://css-tricks.com/converting-color-spaces-in-javascript/
function HEXToHSL(hex) {

  // Convert to rgb
  let r, g, b;
  if (hex.length == 4) {
    r = hex[1] + hex[1];
    g = hex[2] + hex[2];
    b = hex[3] + hex[3];
  } else {
    r = hex[1] + hex[2];
    g = hex[3] + hex[4];
    b = hex[5] + hex[6];
  }
  r = eval("0x" + r);
  g = eval("0x" + g);
  b = eval("0x" + b);

  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;
  // Calculate hue
  // No difference
  if (delta == 0)
    h = 0;
  // Red is max
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g)
    h = (b - r) / delta + 2;
  // Blue is max
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
    
  // Make negative hues positive behind 360°
  if (h < 0)
      h += 360;
  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
}

//From https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
function HSLToHEX(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
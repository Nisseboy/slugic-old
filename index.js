//Global variables
let currentGate;
let currentGateName;
let unit;
let sizeDivisions = 30;
let step = 4;

let previewWire = {active: false};

//Defining DOM Elements
const headerElem = document.getElementsByClassName("header")[0];
const mainElem = document.getElementsByClassName("main")[0];
const footerElem = document.getElementsByClassName("footer")[0];
const previewWireElem = document.getElementsByClassName("wire preview")[0];

const selectionElem = document.getElementsByClassName("selection")[0];

const themeSwitcherElem = document.getElementsByClassName("theme-switcher")[0];

let mainbox;
let mainborderwidth;

let width;
let height;

let mouseEvent;

//The theme switcher
themeSwitcherElem.onclick = e => {
  document.body.classList.toggle("light-theme");
  themeSwitcherElem.classList.toggle("fa-sun");
  themeSwitcherElem.classList.toggle("fa-moon");
}

//Sizing
function resize() {
  mainbox = mainElem.getBoundingClientRect();
  unit = mainbox.height / sizeDivisions;
  document.body.style.setProperty("--unit", unit + "px");

  height = sizeDivisions;
  width = sizeDivisions / 9 * 16;

  draw();
}
window.onresize = resize;

mainbox = mainElem.getBoundingClientRect();
unit = mainbox.height / sizeDivisions;
document.body.style.setProperty("--unit", unit + "px");


//Drawing the gates
let drawnGates = {};
let drawnGatesInFooter = {};
let drawnWires = {};
let drawnWirePoints = {};

function draw() {
  mainbox = mainElem.getBoundingClientRect();
  mainborderwidth = parseInt(getComputedStyle(mainElem).getPropertyValue('border-left-width'));
  
  //Adding and moving placed gates
  for (let i in currentGate.gates) {
    let gate = currentGate.gates[i];
    let gateType = gates.all[gate.type];
    if (drawnGates[i]) {
      drawnGates[i].style.left = `calc(var(--unit) * ${gate.x})`;
      drawnGates[i].style.top = `calc(var(--unit) * ${gate.y})`;
      continue;
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

    let left = createPlugHolder(gate, true, gateHeight);
    let right = createPlugHolder(gate, false, gateHeight);

    gateElem.prepend(left);
    gateElem.appendChild(right);
    mainElem.appendChild(gateElem);

    gateElem.dataset.id = gate.id;

    gateElem.addEventListener("mousedown", e => {
      if (e.button == 0) {
        startDrag(e, gate)
      }
      else if (e.button == 2) {
        delete currentGate.gates[i];
        draw();
      }
    });

    drawnGates[i] = gateElem;
    gate.elem = gateElem;
  }

  //Removing deleted gates
  for (let i in drawnGates) {
    let gate = currentGate.gates[i];
    if (gate) {
      let gatebox = gate.elem.getBoundingClientRect();
      if (
       (gate.x < 0 || 
        gate.y < 0 ||
        gate.x + gatebox.width / unit >= mainbox.width / unit ||
        gate.y + gatebox.height / unit >= mainbox.height / unit) &&
        !gate.isDragged
      ) {
        delete currentGate.gates[i];
      }
    }
    if (!currentGate.gates[i]) {
      drawnGates[i].remove();
      delete drawnGates[i];
    }
  }

  //Placing gates in footer
  for (let i in gates.all) {
    let gateType = gates.all[i];

    let gateElem = drawnGatesInFooter[i];
    if (gateElem) {
      gateElem.style.backgroundColor = gateType.color;
      gateElem.innerText = i;
      gateElem.style.setProperty("--name-length", Math.ceil(gateType.name.length / 2) * 2);
      continue;
    }

    gateElem = createShellGate(gateType);

    gateElem.addEventListener("mousedown", e => {footerGateDown(e, gateType)});


    footerElem.appendChild(gateElem);
    drawnGatesInFooter[i] = gateElem;
  }

  //Adding and moving placed wires
  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];
    
    let start = wire.start;
    let stops = wire.stops;
    let end = wire.end;

    let nStops = stops.map((elem, i) => {return {x: elem.x * unit, y: elem.y * unit}});
    let desc = getWireCoords({start, stops: nStops, end});
    let path = generatePath(desc, (wire.hovering?0:10));

    let dragging = false;

    stops.forEach(elem => {
      if (elem.isDragged) dragging = true;
    });

    if (wire.hovering || dragging) {
      generateAngles(wire);
      
      for (let i in wire.stops) {
        wire.stops[i].elem?.classList.add("hovering");
      }
    } else {
      for (let i in wire.stops) {
        wire.stops[i].elem?.classList.remove("hovering");
      }
      wire.elem?.children[1].replaceChildren();
    }

    let wireElem = drawnWires[i];
    if (!wireElem) {
      wireElem = createWireElem(wire);
      mainElem.appendChild(wireElem);
      drawnWires[i] = wireElem;
      wire.elem = wireElem;
    }

    wireElem.children[0].children[0].setAttribute("d", path);
  }
  
  //Removing deleted wires
  for (let i in drawnWires) {
    let wireElem = drawnWires[i];
    let wire = currentGate.wires[i];

    if (
      wire &&
      (!currentGate.gates[wire.start.gate] ||
      !currentGate.gates[wire.end.gate])
    ) {
      delete currentGate.wires[i];
    }

    if (!currentGate.wires[i]) {
      wireElem.remove();
      delete drawnWires[i];
    }
  }

  //Moving preview wire
  if (previewWire.active) {
    let start = previewWire.start;
    let stops = previewWire.stops;
    let end = previewWire.end;

    let plugHolder = currentGate.gates[start.gate].elem.children[(start.port.input)?0:1];
    let plug = plugHolder.children[start.port.i];
    let box = plug.getBoundingClientRect();
    
    start = {
      x: box.x + box.width / 2 - mainbox.x - mainborderwidth, 
      y: box.y + box.height / 2 - mainbox.y - mainborderwidth
    };

    let path = generatePath({start, stops, end}, 0);
    previewWireElem.children[0].children[0].setAttribute("d", path);
    previewWireElem.style.display = "block";

    generateAngles(previewWire);
  } else {
    previewWireElem.style.display = "none";
  }

  //Removing removed wirepoints
  for (let i in drawnWirePoints) {
    let elem = drawnWirePoints[i];

    let exists = false;

    for (let j in currentGate.wires) {
      let wire = currentGate.wires[j];
      for (let k in wire.stops) {
        if (i == wire.stops[k].id) {
          exists = true;
        }
      }
    }

    if (!exists) {
      elem.remove();
      delete drawnWirePoints[i];
    }
  }
}

//Call to invalidate all drawn shit
function redraw() {
  for (let i in drawnGates) {
    drawnGates[i].remove();
  }
  drawnGates = {};

  for (let i in drawnGatesInFooter) {
    drawnGatesInFooter[i].remove();
  }
  drawnGatesInFooter = {};

  for (let i in drawnWires) {
    drawnWires[i].remove();
  }
  drawnWires = {};

  for (let i in drawnWirePoints) {
    drawnWirePoints[i].remove();
  }
  drawnWirePoints = {};

  changeGate(currentGateName);
  draw();
}

//Helper function for draw to create the plughodler + plugs for a gate on one side
function createPlugHolder(gate, input, gateHeight) {
  let gateType = gates.all[gate.type];
  let i = gate.id;

  let plugHolder = document.createElement("div");
  plugHolder.className = `plug-holder ${input?"left":"right"}`;

  for (let j in (input?gateType.inputs:gateType.outputs)) {
    let plug = document.createElement("div");
    plug.className = "plug";
    
    let baseY = gateHeight / (input?gateType.inputs:gateType.outputs).length * (j * 1 + 0.5);
    
    let finalY;
    if (baseY > gateHeight / 2) {
      finalY = Math.ceil(baseY * step) / step;
    } else {
      finalY = Math.floor(baseY * step) / step;
    }
    plug.style.top = `calc(${finalY - 0.25} * var(--unit))`;

    plug.addEventListener("mousedown", e => {
      startWire(e, gate, {
        input: input,
        i: j,
      });
    });

    plugHolder.appendChild(plug);
    
    plug.dataset.i = j;
    plug.dataset.input = input;
    plug.dataset.gate = i;
  }

  return plugHolder;
}

//Helper function for draw to create a wire element
function createWireElem(wire) {
  let wireElem = document.createElement("div");
  wireElem.className = "wire";

  let svgElem = document.createElement("svg");
  svgElem.classList.add("wire-svg");
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svgElem.appendChild(svg);
  wireElem.appendChild(svgElem);

  let anglesElem = document.createElement("div");
  anglesElem.classList.add("angles");
  wireElem.appendChild(anglesElem);

  let wirePoints = document.createElement("div");
  wirePoints.classList.add("wire-points");
  wireElem.appendChild(wirePoints);

  svg.addEventListener("mouseenter", e=>{
    wire.hovering = true;
    draw();
  });
  svg.addEventListener("mouseleave", e=>{
    wire.hovering = false;
    draw();
  });

  stops = wire.stops;

  svg.addEventListener("mousedown", e => {
    let nStops = stops.map((elem, i) => {return {x: elem.x * unit, y: elem.y * unit}});
    let desc = getWireCoords({start, stops: nStops, end});

    let coords = getCoords(e);
    if (e.button == 0) {
      let nearestStop = getNearestStop(desc, svgElem, coords);

      if (nearestStop == 0 || nearestStop == wire.stops.length + 1) return;

      startDrag(e, wire.stops[nearestStop-1]);

      //TODO: handle dragging of start and end point
    }
    if (e.button == 1) {
      let nearestStop = getNearestStop(desc, svgElem, coords, true);
      let mouseDist = getNearestPointOnPath(svgElem, coords);
      let point = svgElem.getPointAtLength(mouseDist);

      let stop = {
        x: point.x / unit, 
        y: point.y / unit, 
        id: generateID()
      };

      wire.stops.splice(nearestStop - 1, 0, stop);

      draw();
      draw();
      
      startDrag(e, stop);
    }
    if (e.button == 2) {
      delete currentGate.wires[i];
      draw();
    }
  });



  //Creating wire points
  for (let j in wire.stops) {
    let stop = wire.stops[j];

    let elem = document.createElement("div");
    elem.className = "wire-point";
    elem.style.top = stop.y * unit + "px";
    elem.style.left = stop.x * unit + "px";
    elem.dataset.wire = wire.id;
    elem.dataset.id = stop.id;
    wireElem.children[2].appendChild(elem);

    drawnWirePoints[stop.id] = elem;
    stop.elem = elem;
  }



  
  return wireElem;
}

//Creates a gate element without any plugs or shit
function createShellGate(gateType) {
  let gateElem = document.createElement("div");
  gateElem.className = "gate in-footer";
  gateElem.style.backgroundColor = gateType.color;
  gateElem.style.setProperty("--name-length", Math.ceil(gateType.name.length / 2) * 2);
  gateElem.innerText = gateType.name;

  return gateElem;
}

//Called when user presses on a gate in the footer
function footerGateDown(e, gateType) {
  let i = gateType.name;
  if (e.button == 0) {
    let coords = getCoords(e);
    let gate = {
      x: coords.x / unit,
      y: coords.y / unit,
      type: i,
      inputs: [],
      outputs: [],
      id: generateID(),
      isDragged: true,
    }
    currentGate.gates[gate.id] = gate;

    draw();
    let box = gate.elem.getBoundingClientRect();
    gate.x -= box.width / 2 / unit;
    gate.y -= box.height / 2 / unit;
    draw();
    
    startDrag(e, gate);
  } else if (e.button == 2) {
    
  }
}

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
      inputs: [],
      outputs: [],
      id: generateID()
    }

    currentGate.gates[gate.id] = gate;
  }

  gates.custom[currentGateName] = currentGate;
  gates.all[currentGateName] = currentGate;

  changeGate(currentGateName);
}


//Changes current gate
function changeGate(type) {
  let gateType = gates.custom[type];
  if (!gateType) return;

  currentGate = gateType;
  currentGateName = type;
  
  headerElem.style.setProperty("--color", gateType.color);
  headerElem.children[0].style.setProperty("--name-length", Math.ceil(gateType.name.length / 2) * 2);
  headerElem.children[0].innerText = gateType.name;

  draw();
}

//Shows the gate creation menu and allows the user to edit the current gate (is called when the edit button in the header is clicked)
async function editGate() {
  let res = await popupGate(currentGate).then((res)=>{return res}, ()=>{});
  
  if (!res) return;
  currentGate.color = res.color;

  for (let i in gates.all) {
    let gateType = gates.all[i];
    for (let j in gateType.gates) {
      let gate = gateType.gates[j];
      if (gate.type == currentGate.name)
        gate.type = res.name;
    }
  }

  delete gates.custom[currentGateName];
  delete gates.all[currentGateName];
  gates.custom[res.name] = currentGate;
  gates.all[res.name] = currentGate;

  currentGate.name = res.name;
  currentGateName = res.name;

  redraw();
}

//Dragging objects (They must have x, y, elem properties)
let dragged = [];
function startDrag(e, object) {
  let coords = getCoords(e);
  if (!e.ctrlKey && !object.elem.classList.contains("selected")) {
    clearSelected();
  }
  object.elem.classList.add("selected");

  dragged = [];
  getSelected().forEach((elem, i) => {
    let id = elem.dataset.id;
    let ob;
    if (elem.classList.contains("gate")) {
      ob = currentGate.gates[id];
    } else if (elem.classList.contains("wire-point")) {
      ob = currentGate.wires[elem.dataset.wire].stops.find(item=>{return item.id == id});
    }


    dragged.push({
      offset: {
        x: ob.x - coords.x / unit,
        y: ob.y - coords.y / unit,
      },
      object: ob
    });
    ob.isDragged = true;
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
  let underMouse = document.elementsFromPoint(e.clientX, e.clientY);
  if (!underMouse.includes(mainElem)) {
    dragged.forEach((object, i) => {
      delete currentGate.gates[object.object.id];
    });
  }

  dragged.forEach((object, i) => {
    object.object.isDragged = false;
  });
  draw();
  document.removeEventListener("mousemove", whileDrag);
  document.removeEventListener("mouseup", stopDrag);
}

let wireStart;
let wireStops;
function startWire(e, gate, port) {;
  if (e.button != 0) return;
  document.addEventListener("mousemove", whileWire);
  document.addEventListener("mouseup", stopWire);

  wireStart = {gate: gate.id, port};
  wireStops = [];
  
  whileWire(e);

  e.stopPropagation();
}
function whileWire(e) {
  let coords = toGrid(getCoords(e));

  let underMouse = document.elementsFromPoint(e.clientX, e.clientY);
  let plugs = underMouse.filter(elem=>elem.classList.contains("plug"));

  if (plugs.length != 0 && plugs[0].dataset.input != wireStart.port.input.toString() && plugs[0].dataset.gate != wireStart.gate) {
    let plug = plugs[0];
    let box = plug.getBoundingClientRect();

    coords = {
      x: box.x + box.width / 2 - mainbox.x - mainborderwidth,
      y: box.y + box.height / 2 - mainbox.y - mainborderwidth
    };
  }


  previewWire = {
    start: wireStart,
    stops: wireStops,
    end: coords,

    active: true,

    elem: previewWireElem
  }

  draw();
}
function stopWire(e) {
  let coords = toGrid(getCoords(e));
  if (e.button == 0) {
    previewWire.active = false;

    let underMouse = document.elementsFromPoint(e.clientX, e.clientY);
    let plugs = underMouse.filter(elem=>elem.classList.contains("plug"));
  
    if (plugs.length != 0 && plugs[0].dataset.input != wireStart.port.input.toString() && plugs[0].dataset.gate != wireStart.gate) {
      let plug = plugs[0];
      let gate = plug.dataset.gate;

      let end = {gate: gate, port: {input: false, i: plug.dataset.i}};
      let start = wireStart;
      
      if (start.port.input) {
        start = end;
        end = wireStart;

        wireStops = wireStops.reverse();
      }

      end.port.input = true;
      start.port.input = false;

      let wire = {
        start: start,
        stops: wireStops.map((elem, i) => {return {x: elem.x / unit, y: elem.y / unit, id: generateID()}}),
        end: end,
        id: generateID()
      };

      currentGate.wires[wire.id] = wire;
    }
    document.removeEventListener("mousemove", whileWire);
    document.removeEventListener("mouseup", stopWire);

    draw();
  } else if (e.button == 1) {
    wireStops.push(coords);
  }
}


//Selection field
mainElem.addEventListener("mousedown", startSelect);
document.addEventListener("keydown", e=>{
  if (e.ctrlKey && e.key == "a") {
    getElements().forEach(elem=>{elem.classList.add("selected")});
  }
});
let reselect = [];
let selectStart = {};
function startSelect(e) {
  if (e.button != 0)
    return;
  let coords = getCoords(e);
  selectStart = coords;

  reselect = [];
  if (e.ctrlKey) {
    reselect = getSelected();
  }

  document.addEventListener("mousemove", whileSelect);
  document.addEventListener("mouseup", stopSelect);
  selectionElem.style.display = "block";
  
  whileSelect(e);

  e.stopPropagation();
}
function whileSelect(e) {
  let coords = getCoords(e);

  let x1 = Math.min(selectStart.x, coords.x);
  let x2 = Math.max(selectStart.x, coords.x);
  let y1 = Math.min(selectStart.y, coords.y);
  let y2 = Math.max(selectStart.y, coords.y);

  selectionElem.style.left = x1 + "px";
  selectionElem.style.top = y1 + "px";
  selectionElem.style.width = x2 - x1 + "px";
  selectionElem.style.height = y2 - y1 + "px";

  clearSelected();
  let mainbox = mainElem.getBoundingClientRect();
  getElements().forEach((elem, i) => {
    let box = elem.getBoundingClientRect();
    if (
      x1 < box.x + box.width - mainbox.x &&
      x2 > box.x - mainbox.x &&
      y1 < box.y + box.height - mainbox.y &&
      y2 > box.y - mainbox.y
    ) {
      elem.classList.add("selected");
    }
  });

  reselect.forEach(elem=>{
    elem.classList.add("selected");
  });
}
function stopSelect(e) {
  selectionElem.style.display = "none";
  document.removeEventListener("mousemove", whileSelect);
  document.removeEventListener("mouseup", stopSelect);
}


//Removes all selected gates on Delete or Backspace
document.addEventListener("keydown", e => {
  if (e.key == "Delete" || e.key == "Backspace") {
    getSelected().forEach(elem => {
      removeFromID(elem.dataset.id);
    });
  }
});


//Copy and pasting
let copied;
function copySelection() {
  //TODO: add a samll popup signifying that a copy has occured
  let selection = getSelected().filter(elem=>{
    return elem.classList.contains("gate");
  });

  copied = {
    gates: [],
    wires: []
  };

  let min = {x: Infinity, y: Infinity};
  copied.gates = selection.map(elem=>{
    let gate = currentGate.gates[elem.dataset.id];

    min.x = Math.min(min.x, gate.x);
    min.y = Math.min(min.y, gate.y);
    
    return {
      type: gate.type,
      x: gate.x,
      y: gate.y,
      id: gate.id
    };
  });

  copied.gates.map(elem=>{
    elem.x -= min.x;
    elem.y -= min.y;
  });


  for (let i in currentGate.wires) {
    let wire = currentGate.wires[i];

    let start = copied.gates.findIndex(elem=>{return elem.id == wire.start.gate});
    let end = copied.gates.findIndex(elem=>{return elem.id == wire.end.gate});
    
    if (
      start != -1 &&
      end != -1
    ) {
      let newWire = deepCopy(wire);

      delete newWire.id;
      newWire.stops.map(elem=>{
        elem.x -= min.x;
        elem.y -= min.y;
      });

      newWire.start.gate = start;
      newWire.end.gate = end;

      copied.wires.push(newWire);
    }
  }
}
function pasteSelection() {
  let coords = toGrid(getCoords(mouseEvent));
  clearSelected();

  let placed = [];

  copied.gates.forEach(elem=>{
    let gate = {
      type: elem.type,
      x: elem.x + coords.x / unit,
      y: elem.y + coords.y / unit,
      id: generateID()
    };

    currentGate.gates[gate.id] = gate;

    placed.push(gate);
  });

  copied.wires.forEach(elem=>{
    let wire = deepCopy(elem);
    wire.id = generateID();

    wire.start.gate = placed[wire.start.gate].id;
    wire.end.gate = placed[wire.end.gate].id;

    wire.stops.forEach(elem=>{
      elem.x += coords.x / unit;
      elem.y += coords.y / unit;

      placed.push(elem);
    });
    
    currentGate.wires[wire.id] = wire;
  });

  draw();

  placed.forEach(elem=>{
    elem.elem.classList.add("selected");
  });
}
document.addEventListener("keydown", e=>{
  if (!e.ctrlKey) return;
  if (e.key == "c") {
    copySelection();
  }
  if (e.key == "v") {
    pasteSelection();
  }
});

//Prevents context menu
document.oncontextmenu = e => {
  return false;
}

//Shows where the mouse is in relation to the grid
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

//Returns array of all elements
function getElements() {
  return [
    ...Array.from(mainElem.getElementsByClassName("gate")),
    ...Array.from(mainElem.getElementsByClassName("wire-point")),
  ];
}

//Returns object from id
function fromID(id) {
  return currentGate.gates[id];
}

//Removes object from id
function removeFromID(id) {
  if (currentGate.gates[id]) {
    delete currentGate.gates[id];
    draw();
  }
}

//Takes an object with a start, stops, and end point and generates a smooth svg path
function generatePath(desc, rounding=10) {
  let path = `M ${Math.round(desc.start.x)} ${Math.round(desc.start.y)} `; //Move to start of wire
  let stops = [desc.start, ...desc.stops, desc.end]

  for (let i = 1; i < stops.length - 1; i++) {
    let last = stops[i - 1];
    let stop = stops[i];  
    let next = stops[i + 1];

    let lastAngle = Math.atan2(stop.y - last.y, stop.x - last.x);
    let nextAngle = Math.atan2(next.y - stop.y, next.x - stop.x);
    
    path += `L ${Math.round(stop.x - Math.cos(lastAngle) * rounding)} ${Math.round(stop.y - Math.sin(lastAngle) * rounding)} `; //Line to start of curve
    path += `Q ${Math.round(stop.x)} ${Math.round(stop.y)} ${Math.round(stop.x + Math.cos(nextAngle) * rounding)} ${Math.round(stop.y + Math.sin(nextAngle) * rounding)} `; //Curve
  }
  path += `L ${Math.round(desc.end.x)} ${Math.round(desc.end.y)} `; //Line to end of wire

  return path;
}

//Takes a wire description as well as a position and returns the nearest stop
function getNearestStop(desc, elem, pos, onlyAfter = false) {
  let stops = [desc.start, ...desc.stops, desc.end];
  
  let mouseDist = getNearestPointOnPath(elem, pos);
  
  let lengths = [];
  let totalLength = 0;

  for (let i = 0; i < stops.length; i++) {
    let stop = stops[i];
    
    lengths[i] = totalLength;

    if (i != stops.length - 1) {
      let next = stops[i + 1];
      totalLength += Math.sqrt((next.x - stop.x) * (next.x - stop.x) + (next.y - stop.y) * (next.y - stop.y));
    }
  }

  bestD = Infinity;
  let bestStop;

  for (let i = 0; i < lengths.length; i++) {
    let dist = Math.abs(lengths[i] - mouseDist);
    if (dist < bestD && (lengths[i] > mouseDist || !onlyAfter)) {
      bestD = dist;
      bestStop = i;
    }
  }

  return bestStop;
}

//Takes a wire element as well as a position and returns the nearest length
function getNearestPointOnPath(elem, pos) {
  let length = elem.getTotalLength();

  let bestD = Infinity;
  let bestPoint;

  for (let i = 0; i < length; i++) {
    let point = elem.getPointAtLength(i);

    let distSq = (point.x - pos.x) * (point.x - pos.x) + (point.y - pos.y) * (point.y - pos.y);

    if (distSq < bestD) {
      bestD = distSq;
      bestPoint = i;
    }
  }

  return bestPoint;
}

//Takes a description with the start or/and end replaced with a port object and returns a coordinate based
function getWireCoords(desc) {
  let start = desc.start;
  let stops = desc.stops;
  let end = desc.end;

  if (!start.x) {
    let plugHolder = currentGate.gates[start.gate].elem.children[1];
    let plug = plugHolder.children[start.port.i];
    let box = plug.getBoundingClientRect();
    start = {
      x: box.x + box.width / 2 - mainbox.x - mainborderwidth, 
      y: box.y + box.height / 2 - mainbox.y - mainborderwidth
    }
  }

  if (!end.x) {
    plugHolder = currentGate.gates[end.gate].elem.children[0];
    plug = plugHolder.children[end.port.i];
    box = plug.getBoundingClientRect();
    end = {
      x: box.x + box.width / 2 - mainbox.x - mainborderwidth, 
      y: box.y + box.height / 2 - mainbox.y - mainborderwidth
    }
  }

  return {start, stops, end};
}

//Takes an object with a start, stops, and end point and generates a few angle elements to show the angles in it
function generateAngles(wire) {
  wire.elem.children[1].replaceChildren();

  let desc = getWireCoords(wire);
  let stops = [{x: desc.start.x-1, y: desc.start.y}, desc.start, ...desc.stops, desc.end];

  for (let i = 1; i < stops.length - 1; i++) {
    let last = stops[i - 1];
    let stop = stops[i];  
    let next = stops[i + 1];

    let thisAngle = Math.atan2(next.y - stop.y, next.x - stop.x);
    let lastAngle = Math.atan2(stop.y - last.y, stop.x - last.x);

    let a = (thisAngle - lastAngle) / Math.PI * 180;
    let positive = Math.abs(a);
    a = 180 - Math.min(positive, 360 - positive);

    let elem = document.createElement("div");
    elem.className = "angle";
    elem.innerText = `${Math.round(a*10)/10}°`;

    elem.style.top = stop.y + "px";
    elem.style.left = stop.x + "px";
    elem.style.translate = "-50% -130%";
    wire.elem.children[1].appendChild(elem);
  }

  return 
}

//Deep copies an object recursively
function deepCopy(ob) {
  let newOb;
  if (Array.isArray(ob))
    newOb = [];
  else if (typeof ob == "object")
    newOb = {};
  else
    return ob;

  for (let i in ob) {
    newOb[i] = deepCopy(ob[i]);
  }

  return newOb;
}

//Preventing the user from leaving with unsaved progress
window.addEventListener("beforeunload", function (e) {
  //TODO: save
  
});

//Constantly updates mouseEvent which makes the mouse position available to all functions
document.addEventListener("mousemove", e=>{mouseEvent = e});
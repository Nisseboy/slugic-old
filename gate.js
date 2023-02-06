class Gate {
  constructor (name, inputs, outputs) {
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;

    this.baseGate = false;
    this.gates = {};

    //Color
    this.color = generateColor();
  }
}

let gates = {
  base: {
    and: {
      name: "and", 
      color: "#277bb5",
      baseGate: true, 
      inputs: ["a", "b"],
      outputs: ["out"],
    },
    or: {
      name: "or", 
      color: "#ac56ce",
      baseGate: true, 
      inputs: ["a", "b"],
      outputs: ["out"],
    },
    xor: {
      name: "xor", 
      color: "#cd4c8c",
      baseGate: true, 
      inputs: ["a", "b"],
      outputs: ["out"],
    },
    nand: {
      name: "nand", 
      color: "#7c3fcf",
      baseGate: true, 
      inputs: ["a", "b"],
      outputs: ["out"],
    },
    nor: {
      name: "nor", 
      color: "#a32a4c",
      baseGate: true, 
      inputs: ["a", "b"],
      outputs: ["out"],
    },
    not: {
      name: "not", 
      color: "#8d201d",
      baseGate: true, 
      inputs: ["a"],
      outputs: ["not a"],
    },
  },
  custom: {},
  all: {}
};
//TODO: transfer custom gates between sessions

for (let i in gates.base) {
  let gate = gates.base[i];
  gates.all[gate.name] = gate;
}

function fromName(arr, name) {
  return arr.find(elem=>{
    return (elem.name == name);
  });
}

function generateColor() {
  let hex = "0123456789abcdef";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += (hex[Math.floor(Math.random() * 16)]);
  }

  return color; 
}

function generateID() {
  return crypto.randomUUID();
}
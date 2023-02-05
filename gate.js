class Gate {
  constructor (name) {
    this.name = name;
    this.baseGate = false;
  }
}

let gates = {
  base: [
    {
      name: "and", 
      color: "#277bb5",
      baseGate: true, 
    },
    {
      name: "or", 
      color: "#ac56ce",
      baseGate: true, 
    },
    {
      name: "xor", 
      color: "#cd4c8c",
      baseGate: true, 
    },
    {
      name: "nand", 
      color: "#7c3fcf",
      baseGate: true, 
    },
    {
      name: "nor", 
      color: "#a32a4c",
      baseGate: true, 
    },
    {
      name: "not", 
      color: "#8d201d",
      baseGate: true, 
    },
  ],
  custom: [],
  all: []
};
//TODO: transfer custom gates between sessions

for (let i of gates.base) {
  gates.all.push(i);
}
for (let i of gates.custom) {
  gates.all.push(i);
}
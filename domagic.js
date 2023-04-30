/*
domTypes is an object containing the instructions for different types of elements:
domTypes["example"] = {
  init: function(element) {
    let elem = document.createElement("div");
    elem.style.top = element.y + "px";
    elem.style.left = element.x + "px";
  },
  update: function(element, domElement) {
    domElement.style.top = element.y + "px";
    domElement.style.left = element.x + "px";

    if (age > 5) {
      return true; //Returning true will remove the element.
    }
    return false;
  },
  destroy: function(element, domElement) {
    //Called before removal of the element.
  }
}


elements is an array containing all the elements to be drawn:
elements[0] = {
  domType: "example",
  element: {x: 50, y: 50, age: 0}
}
Domagic will also add a property to this: domElement.


draw is the main function, call this function each time you want the elements to be rerendered. It's not called automatically.

*/

class Domagic {
  constructor(name) {
    this.domTypes = {};
    this.elements = [];

    this.drawnElements = [];

    this.name = name;
  }

  draw() {

  }
}

//An instance of Domagic
const domagic = new Domagic("main");
/*
domTypes is an object containing the instructions for different types of objects:
domTypes["example"] = {
  init: function(object) {
    let elem = document.createElement("div");
    return elem;
  },
  update: function(object) {
    object.domElement.style.top = object.y + "px";
    object.domElement.style.left = object.x + "px";

    if (age > 5) {
      return true; //Returning true will remove the object from objects and remove the element.
    }
    return false;
  },
  destroy: function(object) {
    //Called before removal of the object.
  }
}


objects is an array containing all the objects to be drawn:
objects["object-id"] = {
  domType: "example",
  element: {x: 50, y: 50, age: 0}
}
Domagic will also add a property to element: domElement.


draw is the main function, call this function each time you want the objects to be rerendered. It's not called automatically.

*/

class Domagic {
  constructor(name) {
    this.domTypes = {};
    this.objects = {};

    this.drawnElements = [];

    this.name = name;
  }

  draw() {
    for (let i in this.drawnElements) {
      let elem = this.drawnElements[i];
      let ob = findInObject(this.objects, (e) => {return e.element.domElement == elem});

    }

    for (let i in this.objects) {
      let ob = this.objects[i];
      let domType = this.domTypes[ob.domType];

      if (!ob.element.domElement) {
        ob.element.domElement = domType.init(ob.element);
        this.drawnElements.push(ob.element.domElement);
      }

      let keep = !domType.update(ob.element);

      if (!keep) {
        domType.destroy(ob.element);

        this.drawnElements.splice(this.drawnElements.indexOf(ob.element.domElement), 1);
        ob.element.domElement.remove();
        delete ob.element.domElement;
        delete this.objects[i];
      }
    }
  }

  redraw() {
    for (let i in this.objects) {
      let ob = this.objects[i];
      delete ob.element.domElement;
    }

    for (let i in this.drawnElements) {
      let elem = this.drawnElements[i];
      elem.remove();
      delete this.drawnElements[i];
    }

    this.draw();
  }
}

function findInObject(ob, fn) {
  for (let i in ob) {
    if (fn(ob[i], i))
      return ob[i];
  }
  return false;
}
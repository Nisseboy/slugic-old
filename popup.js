//Make color pickers work
let colorPickers = document.getElementsByClassName("color-picker");
for (let i in Array.from(colorPickers)) {
  let picker = colorPickers[i];
  let preview = picker.children[0];
  preview.style.backgroundColor = "blue";
}
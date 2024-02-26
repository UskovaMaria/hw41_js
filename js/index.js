const doc = document;

const saveBtn = doc.querySelector('.save-btn');
const undoBtn = doc.querySelector('.undo');

const canvas = doc.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const cw = canvas.width;
const ch = canvas.height;

let dBg = 'white';
let dColor = 'black';
let dPenW = '2';
let isDrawing = false;
let history = [];
let index = -1;

main();

async function main() {
  clearCanvas();

  canvas.addEventListener('mousedown', start, false);
  canvas.addEventListener('mousemove', draw, false);
  canvas.addEventListener('mouseup', stop, false);
  canvas.addEventListener('mouseout', stop, false);

  undoBtn.onclick = undo;

  const clearBtn = doc.querySelector('.clear');
  clearBtn.addEventListener('click', clearCanvas);

  const colorDivs = doc.querySelectorAll('.color');
  colorDivs.forEach((colorDiv) => {
    colorDiv.addEventListener('click', () => {
      setDrawingColor(colorDiv.style.backgroundColor);
    });
  });

  const colorPicker = doc.querySelector('.color-picker');
  colorPicker.addEventListener('input', (e) => {
    setDrawingColorPicker(e.target.value);
  });

  const penRange = doc.querySelector('.pen-range');
  penRange.addEventListener('input', (e) => {
    setDrawingPenWidth(e.target.value);
  });

  const loadButton = doc.querySelector('.button-load');
  loadButton.addEventListener('click', loadImageFromFile);
}

// FUNCTIONS
function undo() {
  if (index <= 0) {
    clearCanvas();
    return;
  }

  index -= 1;
  history.pop();
  ctx.putImageData(history[index], 0, 0);
}

function start(e) {
  isDrawing = true;
  const dx = e.clientX - canvas.offsetLeft;
  const dy = e.clientY - canvas.offsetTop;

  ctx.beginPath();
  ctx.moveTo(dx, dy);
}

function draw(e) {
  if (!isDrawing) {
    return;
  }

  const dx = e.clientX - canvas.offsetLeft;
  const dy = e.clientY - canvas.offsetTop;

  ctx.lineTo(dx, dy);
  ctx.strokeStyle = dColor;
  ctx.lineWidth = dPenW;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function stop(e) {
  if (!isDrawing) {
    return;
  }

  ctx.stroke();
  ctx.closePath();
  isDrawing = false;

  const imgDate = ctx.getImageData(0, 0, cw, ch);
  history.push(imgDate);
  index ++;

  prepareSaveToFile();
}

function clearCanvas() {
  ctx.fillStyle = dBg;
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillRect(0, 0, cw, ch);

  history = [];
  index = -1;
}

function prepareSaveToFile() {
  const dataUrl = canvas.toDataURL('image/jpg');
  saveBtn.href = dataUrl;
  saveBtn.download = 'myImage.jpg';
}

function setDrawingColor(color) {
  switch (color) {
    case 'red':
      dColor = 'red';
      break;
    case 'green':
      dColor = 'green';
      break;
    case 'blue':
      dColor = 'blue';
      break;
    case 'yellow':
      dColor = 'yellow';
      break;
    default:
      dColor = 'black'; 
  }
  ctx.strokeStyle = dColor;
}

function setDrawingColorPicker(color) {
  dColor = color;
  ctx.strokeStyle = dColor;
}

function setDrawingPenWidth(width) {
  dPenW = width;
  ctx.lineWidth = dPenW;
}

async function loadImageFromFile() {
  const input = doc.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', handleFileSelect);
  input.click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = src;

    image.onload = () => resolve(image)
  });
}
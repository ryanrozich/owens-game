const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Forest green
ctx.fillStyle = '#228B22';
ctx.fillRect(0, 0, width, height);

// Red Territory overlay
ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
ctx.fillRect(0, 0, 600, height);

// Blue Territory overlay
ctx.fillStyle = 'rgba(0, 0, 255, 0.15)';
ctx.fillRect(600, 0, 600, height);

// Center Line
ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctx.fillRect(597, 0, 6, height);

// Helper function for rounded rectangles
function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

// Red Base
ctx.fillStyle = '#8B0000';
roundRect(40, 265, 100, 100, 8);
ctx.fillStyle = 'white';
ctx.font = 'bold 16px Arial';
ctx.textAlign = 'center';
ctx.fillText('BASE', 90, 325);

// Blue Base
ctx.fillStyle = '#00008B';
roundRect(1060, 265, 100, 100, 8);
ctx.fillStyle = 'white';
ctx.fillText('BASE', 1110, 325);

// Red Flags
ctx.fillStyle = '#FF0000';
roundRect(120, 140, 30, 45, 4);
roundRect(100, 295, 30, 45, 4);
roundRect(80, 450, 30, 45, 4);

// Blue Flags
ctx.fillStyle = '#0000FF';
roundRect(1050, 140, 30, 45, 4);
roundRect(1070, 295, 30, 45, 4);
roundRect(1090, 450, 30, 45, 4);

// Red Player
ctx.fillStyle = '#FF0000';
roundRect(280, 280, 60, 60, 8);

// Blue Player
ctx.fillStyle = '#0000FF';
roundRect(860, 280, 60, 60, 8);

// Enemies (gray)
ctx.fillStyle = '#666666';
roundRect(200, 180, 50, 50, 6);
roundRect(180, 400, 50, 50, 6);
roundRect(950, 180, 50, 50, 6);
roundRect(970, 400, 50, 50, 6);

// Title Background
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
roundRect(300, 40, 600, 120, 16);

// Title Text
ctx.fillStyle = 'white';
ctx.font = 'bold 64px Arial';
ctx.textAlign = 'center';
ctx.fillText("Owen's CTF", 600, 105);

ctx.fillStyle = '#CCCCCC';
ctx.font = '24px Arial';
ctx.fillText('Capture The Flag', 600, 145);

// Bottom tagline
ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
roundRect(250, 540, 700, 60, 12);

ctx.fillStyle = 'white';
ctx.font = '24px Arial';
ctx.fillText('Choose your team. Capture flags. Win the game!', 600, 580);

// Save to file
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(__dirname, '..', 'public', 'social-preview.png');
fs.writeFileSync(outputPath, buffer);

console.log('Social preview image generated:', outputPath);

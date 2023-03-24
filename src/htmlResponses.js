// Reused from my first http api assignment
const fs = require('fs'); // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const rockImage = fs.readFileSync(`${__dirname}/../client/images/rock.png`);
const paperImage = fs.readFileSync(`${__dirname}/../client/images/paper.png`);
const scissorsImage = fs.readFileSync(`${__dirname}/../client/images/scissors.png`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getImageRock = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(rockImage);
  response.end();
};

const getImagePaper = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(paperImage);
  response.end();
};

const getImageScissors = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(scissorsImage);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getImageRock,
  getImagePaper,
  getImageScissors,
};

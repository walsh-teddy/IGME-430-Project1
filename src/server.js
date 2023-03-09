// Basic framework coppied from my first HTTP API Assignment
// Set up directories
// Adding this line here so that I can commit a change and circleCl will actually give me my link
const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const gameHandler = require('./gameManager.js');

// Urls with each method it should use
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/game/availableGames': gameHandler.GameAvailableGames,
    notFound: gameHandler.NotFound,
  },
  HEAD: {

  },
  POST: {
    '/users/join': gameHandler.UsersJoin,
    '/users/stats': gameHandler.UserStats,
    '/game/create': gameHandler.GameCreate,
    '/game/join': gameHandler.GameJoin,
    '/game/state': gameHandler.GameState,
    '/game/leave': gameHandler.GameLeave,
    '/game/throw': gameHandler.GameThrow,
    '/game/ready': gameHandler.GameReadyNewRound,
  },
};

const parseBody = (request, response, callback) => {
  // Create an empty body
  const body = [];

  // Set up error handling
  request.on('error', () => {
    // Note the error and send back the response
    response.statusCode = 400;
    response.end();
  });

  // Set up the data handling
  request.on('data', (chunk) => {
    // Push it to the array
    body.push(chunk);
  });

  // Set up the end handling
  request.on('end', () => {
    // put all the data together into 1 object and turn it into a string
    const bodyString = Buffer.concat(body).toString();
    // Turn that string into an object
    const bodyObj = query.parse(bodyString);

    // Do the callback function with the new body object
    callback(request, response, bodyObj);
  });
};

// Called every time the server recieves a request from the client
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url).pathname;
  const { method } = request;

  console.log(method, parsedUrl);

  // Check if the user entered either POST, GET, or HEAD
  if (method === 'POST') {
    // First parse the body, then call the callback
    parseBody(request, response, urlStruct[method][parsedUrl]);
  } else if (urlStruct[method]) { // It is using GET or HEAD
    // Check if its URL is found
    if (urlStruct[method][parsedUrl]) { // It is found
      urlStruct[method][parsedUrl](request, response);
    } else { // It is not found
      urlStruct[method].notFound(request, response);
    }
  } else { // It is not using GET or HEAD or the right url with POST
    // Default to GET.notFound
    urlStruct.GET.notFound(request, response);
  }
};

// Tests if there is any port other than 3000 it should be using
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Create the server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
  // Clear out the example data
  gameHandler.ClearData();
});

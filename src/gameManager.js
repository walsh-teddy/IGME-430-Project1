/* eslint-disable no-case-declarations */
/* eslint-disable eqeqeq */
// List of users (starts empty)
let users = [
  // Example user
  {
    id: 0, // 0 because its at index 0
    name: 'Goober',
    possesiveName: "Goober's", // If name was something like "goobers" as the name then posessiveName would be "goobers'"
    gameId: null,
    winCount: 0,
    gameCount: 0,
    rockThrows: 0,
    paperThrows: 0,
    scissorsThrows: 0,
    created_at: 0, // Call Date.now()
    updated_at: 0, // Call Date.now()
    deleted_at: null, // If its null then its deleted
  },
];

// List of games (starts empty)
let games = [
  // Example game
  {
    id: 0, // 0 because its at index 0
    players: [ // Will only have 2
      // Example player
      {
        user: {}, // Stores the player object from users
        throw: ' ', // Stores either 'R', 'P', 'S', or ' '
        score: 0, // Goes up by 1 when they win a round
        wantNewRound: false, // Marks if they're ready to move to a new round
      },
    ],
    state: 'Waiting for game to start',
    resultText: 'Waiting',
    player1Throw: '???',
    player2Throw: '???',
    round: 1,
    roundEnd: false,
    roundResults: [], // Stores 0 if its a tie, 1 if player 1 won, 2 if player 2 won
    created_at: 0, // Call Date.now()
    updated_at: 0, // Call Date.now()
    deleted_at: null, // If its null then its deleted
  },
];

// Acts as a dictionary of what symbol beats what. The first index is player 1, the 2nd is player 2.
// 0 is player 1 won, 1 is player 2 won, 2 is a tie
const matchupMatrix = {
  R: { // Player 1 throws rock
    R: 2, // Tie
    P: 1, // Player 2 wins
    S: 0, // Player 1 wins
  },
  P: { // Player 1 throws paper
    R: 0, // Player 1 wins
    P: 2, // Tie
    S: 1, // Player 2 wins
  },
  S: { // Player 1 thros scissors
    R: 1, // Player 2 wins
    P: 0, // Player 1 wins
    S: 2, // Tie
  },
};

// Is only called when the server first starts up to get rid of the example data
const ClearData = () => {
  users = [];
  games = [];
};

const objectUpdated = (object) => {
  // eslint-disable-next-line no-param-reassign
  object.updated_at = Date.now();
};

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const jsonResponse = JSON.stringify(object);

  response.writeHead(status, headers);
  response.write(jsonResponse);
  response.end();
};

const UsersCreate = (request, response, name) => {
  // Record the id
  const id = users.length;
  const rightNow = Date.now();

  // Create the possesive name
  let possesiveName = '';
  const trimmedName = name.trim();
  if (trimmedName.toLowerCase()[trimmedName.length - 1] !== 's') { // The last character isn't an S
    possesiveName = `${trimmedName}'s`;
  } else { // The last character is an s
    possesiveName = `${trimmedName}'`;
  }

  // Create the users
  users.push({
    id, // Automatically fills in "id: [value]"
    name: trimmedName, // Same deal as id above
    possesiveName,
    gameId: null,
    winCount: 0,
    gameCount: 0,
    rockThrows: 0,
    paperThrows: 0,
    scissorsThrows: 0,
    created_at: rightNow,
    updated_at: rightNow,
    deleted_at: null,
  });

  // Return the id as JSON
  console.log(users);
  return respondJSON(request, response, 201, users[id]);
};

const UsersJoin = (request, response, data) => {
  // Extract the name from the data
  const { name } = data;
  // Make sure there is a name in it
  if (name === '') { // It is empty
    const responseJSON = { message: 'Name cannot be empty', id: 'UsersJoinMissingParams' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Loop through each user and see if someone exists with that name
  for (let index = 0; index < users.length; index++) {
    if (users[index].name === name) { // A user with the same name was found
      // Send the client back the id for it to remember
      objectUpdated(users[index]);
      console.log(users);
      return respondJSON(request, response, 200, users[index]);
    }
  }

  // If we've gotten here, then the user doesn't yet exist so it should be created
  return UsersCreate(request, response, name);
};

const GameUpdate = (gameId) => {
  // If this function is called, its assumed that the gameId
  // was already checked for it to exist and the game is not deleted

  objectUpdated(games[gameId]);

  // Make sure both players are up to date
  for (let i = 0; i < games[gameId].players[i].length; i++) {
    // Get the most recent version from the users array
    games[gameId].players.user = users[games[gameId].players.user.id];
  }

  // Check if the game has both players
  if (games[gameId].players.length !== 2) { // It does not yet have both players
    games[gameId].state = 'Waiting for another player';
    return;
  }

  // Check if its between rounds
  if (!games[gameId].roundEnd) { // It is in a round right now
    // Count how many of the players are ready
    let readyPlayers = 0;
    let notReadyPlayerIndex = 0;
    for (let i = 0; i < games[gameId].players.length; i++) {
      if (games[gameId].players[i].throw !== ' ') { // This player is ready
        // Count them as ready
        readyPlayers += 1;
      } else { // This player isn't ready
        // Save their index (either 0 or 1) to pull up their name later
        notReadyPlayerIndex = i;
      }
    }

    // Display the state depending on how many players are ready
    switch (readyPlayers) {
      case 0: // Nobody is ready yet
        games[gameId].state = 'Waiting for both players to throw';
        break;

      case 1: // 1 player is ready and 1 isn't
        games[gameId].state = `Waiting for ${games[gameId].players[notReadyPlayerIndex].user.name} to throw`;
        break;

      case 2: // Both players are ready
        // Record the new result
        const player1Throw = games[gameId].players[0].throw;
        const player2Throw = games[gameId].players[1].throw;
        const result = matchupMatrix[player1Throw][player2Throw];
        games[gameId].roundResults.push(result);

        // Update the player throw display text
        switch (player1Throw) { // Player 1
          case 'R':
            games[gameId].player1Throw = 'Rock';
            break;
          case 'P':
            games[gameId].player1Throw = 'Paper';
            break;
          case 'S':
            games[gameId].player1Throw = 'Scissors';
            break;
          default:
            // Something went wrong
            break;
        }
        switch (player2Throw) { // Player 1
          case 'R':
            games[gameId].player2Throw = 'Rock';
            break;
          case 'P':
            games[gameId].player2Throw = 'Paper';
            break;
          case 'S':
            games[gameId].player2Throw = 'Scissors';
            break;
          default:
            // Something went wrong
            break;
        }

        // Display the result text
        switch (result) {
          case 0: // Player 1 won
          case 1: // Player 2 won
            // Increase the player's score and mark them having a win
            games[gameId].players[result].score += 1;
            games[gameId].players[result].user.winCount += 1;

            // Update both players
            for (let i = 0; i < games[gameId].players.length; i++) {
              // Mark them as having another game
              games[gameId].players[i].user.gameCount += 1;
            }

            // Display the text
            // (Round X) Goober won!
            games[gameId].resultText = `(Round ${games[gameId].round}) ${games[gameId].players[result].user.name} won!`;

            break;
          case 2: // It was a tie
            games[gameId].resultText = 'Tie';
            break;
          default:
            // Something went wrong
            break;
        }

        // Reset both players' throws
        for (let i = 0; i < games[gameId].players.length; i++) {
          games[gameId].players[i].throw = ' ';
        }

        // Mark that the round has just ended
        games[gameId].roundEnd = true;
        // Reset the ready buttons so they have to press it once a game actually finished
        for (let i = 0; i < games[gameId].players.length; i++) {
          games[gameId].players[i].wantNewRound = false;
        }
        // Update again so it displays the new text
        GameUpdate(gameId);
        break;
      default:
        // Something went wrong
        break;
    }
  } else { // A round has just finished and its displaying its results
    // Test if the players are ready to move to a new round
    let newRoundPlayers = 0;
    let noNewRoundPlayerIndex = 0;
    for (let i = 0; i < games[gameId].players.length; i++) {
      if (games[gameId].players[i].wantNewRound) { // This player wants a new round
        // Count them as ready
        newRoundPlayers += 1;
      } else { // This player isn't ready
        // Save their index (either 0 or 1) to pull up their name later
        noNewRoundPlayerIndex = i;
      }
    }

    switch (newRoundPlayers) {
      case 0: // Neither player is ready for a new round
        games[gameId].state = 'Waiting for both players to be ready for the next round';
        break;
      case 1: // 1 player is ready for a new round and 1 isn't
        games[gameId].state = `Waiting for ${games[gameId].players[noNewRoundPlayerIndex].user.name} to be ready for the next round`;
        break;
      case 2: // Both players are ready for a new round
        // Start the new round
        games[gameId].state = 'Waiting for both players';
        games[gameId].player1Throw = '???';
        games[gameId].player2Throw = '???';
        games[gameId].resultText = 'Waiting';
        // Update both players
        for (let i = 0; i < games[gameId].players.length; i++) {
          // Mark them as having another game
          games[gameId].players[i].wantNewRound = false;
        }
        games[gameId].roundEnd = false;

        // Update again so it displays the new text
        GameUpdate(gameId);
        break;
      default:
        // Something has gone wrong
        break;
    }
  }
};

const GameCreate = (request, response, data) => {
  // Extract the id
  const { userId } = data;

  // Make sure the user exists
  if (!users[userId]) { // The user doesn't exist
    const responseJSON = { message: 'You must be logged in to create a game', id: 'CreateGameBadUser' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Make sure the user isn't in another game
  if (users[userId].gameId != null) { // They are already in another game
    const responseJSON = { message: 'User is already in another game', id: 'CreateGameUserBusy' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Record the game's id
  const id = games.length;
  const rightNow = Date.now();

  // Make the new game
  games.push({
    id, // Automatically populates with the value of id from before
    players: [
      {
        user: users[userId],
        throw: ' ', // Stores either 'R', 'P', 'S', or ' '
        score: 0,
        wantNewRound: false,
      },
    ],
    state: 'Waiting for another player',
    resultText: 'Waiting',
    player1Throw: '???',
    player2Throw: '???',
    round: 1,
    roundEnd: false,
    roundResults: [], // Will hold 0 for player 1, 1 for player 2, and 2 for a tie
    created_at: rightNow,
    updated_at: rightNow,
    deleted_at: null,
  });

  // Have the game creator join the game
  users[userId].gameId = id;
  objectUpdated(users[userId]);

  // Update the game
  GameUpdate(id);

  // Return the game
  console.log(games);
  return respondJSON(request, response, 201, games[id]);
};

const GameAvailableGames = (request, response) => {
  // Create an empty array
  const availableGames = [];

  // Loop through each game and add it if its not full
  for (let i = 0; i < games.length; i++) {
    if (games[i].players.length === 1 && games[i].deleted_at == null) {
    // The game only has 1 player and isn't deleted
      // Add the game
      availableGames.push(games[i]);
    }
  }

  // Return the list of games
  return respondJSON(request, response, 200, availableGames);
};

const GameJoin = (request, response, data) => {
  const { gameId, userId } = data;

  // Check if the game exists
  if (!games[gameId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'Game does not exist', id: 'GameJoinGameNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (games[gameId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'Game deleted', id: 'GameJoinGameDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user exists
  if (!users[userId]) { // They don't exist
    // Send an error message
    const responseJSON = { message: 'User does not exist', id: 'GameJoinUserNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user was deleted
  if (users[userId].deleted_at !== null) { // The user existed but was deleted
    // Send an error message
    const responseJSON = { message: 'User was deleted', id: 'GameJoinUserDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user is in another game
  if (users[userId].gameId !== null) { // They're already in a game
    // Send an error message
    const responseJSON = { message: 'User in another game', id: 'GameJoinUserBusy' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game is full
  if (games[gameId].players.length === 2) { // Its full
    // Send an error message
    const responseJSON = { message: 'Game full', id: 'GameJoinFull' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user is already in the game
  for (let i = 0; i < games[gameId].players.length; i++) {
    if (games[gameId].players[i].user.id == userId) { // This player is the same as the user
      // Send an error message
      const responseJSON = { message: 'User already in the game', id: 'GameJoinUserIn' };
      return respondJSON(request, response, 404, responseJSON);
    }
  }

  // Add the player to the game
  games[gameId].players.push({
    user: users[userId],
    throw: ' ',
    score: 0,
    wantNewRound: false,
  });
  objectUpdated(games[gameId]);

  // Record for the player that they're in this game
  users[userId].gameId = gameId;
  objectUpdated(users[userId]);

  // Update the game
  GameUpdate(gameId);

  // Send a success message
  return respondJSON(request, response, 200, games[gameId]);
};

const GameState = (request, response, data) => {
  const { gameId } = data;

  // Check if the game exists
  if (!games[gameId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'Game does not exist', id: 'GameStateNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (games[gameId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'Game deleted', id: 'GameStateDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Return the game
  return respondJSON(request, response, 200, games[gameId]);
};

const UserStats = (request, response, data) => {
  const { userId } = data;

  // Check if the game exists
  if (!users[userId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'User does not exist', id: 'UserStatsNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (users[userId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'User deleted', id: 'UserStatsDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // send back the user
  return respondJSON(request, response, 200, users[userId]);
};

const GameThrow = (request, response, data) => {
  // Extract variables
  const { userId, gameId } = data;
  const userThrow = data.throw;
  let playerIndex; // Either 0 or 1

  // Make sure theres no error
  // Check if the game exists
  if (!games[gameId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'Game does not exist', id: 'GameThrowGameNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (games[gameId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'Game deleted', id: 'GameThrowGameDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user exists
  if (!users[userId]) { // They don't exist
    // Send an error message
    const responseJSON = { message: 'User does not exist', id: 'GameThrowUserNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user was deleted
  if (users[userId].deleted_at !== null) { // The user existed but was deleted
    // Send an error message
    const responseJSON = { message: 'User was deleted', id: 'GameThrowUserDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user is in another game
  if (users[userId].gameId != gameId) { // They're already in a game
    // Send an error message
    const responseJSON = { message: 'User in another game', id: 'GameThrowUserBusy' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user didn't throw one of the 3 possible throws
  if (!(userThrow === 'R' || userThrow === 'P' || userThrow === 'S')) { // They didn't throw one of the 3 possible symbols
    // Send an error message
    const responseJSON = { message: 'Invalid throw', id: 'GameThrowBadThrow' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user already threw this round
  // Also record now which player in the players object this user is
  for (let i = 0; i < games[gameId].players.length; i++) {
    if (games[gameId].players[i].user.id == userId) { // This player is the same as the user
      // Record the player index
      playerIndex = i;

      // Check if the user already threw something
      if (games[gameId].players[i].throw !== ' ') { // The user already threw something
        // Send an error message
        const responseJSON = { message: 'User already threw', id: 'GameThrowUserDone' };
        return respondJSON(request, response, 404, responseJSON);
      }
    }
  }

  // Record the throw in the game
  games[gameId].players[playerIndex].throw = userThrow;

  // Record the throw in the user
  switch (userThrow) {
    case 'R':
      users[userId].rockThrows += 1;
      break;
    case 'P':
      users[userId].paperThrows += 1;
      break;
    case 'S':
      users[userId].scissorsThrows += 1;
      break;
    default:
      // Something has gone wrong
      break;
  }
  objectUpdated(users[userId]);

  // Update the game
  GameUpdate(gameId);
  objectUpdated(users[userId]);

  // Send back the game
  return respondJSON(request, response, 201, games[gameId]);
};

const GameReset = (gameId) => {
  // Reset all the variables back
  games[gameId].state = 'Waiting for another player';
  games[gameId].resultText = 'Waiting';
  games[gameId].round = 1;
  games[gameId].roundResults = [];
  games[gameId].player1Throw = '???';
  games[gameId].player2Throw = '???';

  // Reset scores
  for (let i = 0; i < games[gameId].players.length; i++) {
    games[gameId].players[i].score = 0;
    games[gameId].players[i].wantNewRound = false;
  }
};

const GameLeave = (request, response, data) => {
  // Extract variables from data
  const { userId, gameId } = data;

  // Make sure theres no error
  // Check if the game exists
  if (!games[gameId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'Game does not exist', id: 'GameLeaveGameNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (games[gameId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'Game deleted', id: 'GameLeaveGameDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user exists
  if (!users[userId]) { // They don't exist
    // Send an error message
    const responseJSON = { message: 'User does not exist', id: 'GameLeaveUserNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user was deleted
  if (users[userId].deleted_at !== null) { // The user existed but was deleted
    // Send an error message
    const responseJSON = { message: 'User was deleted', id: 'GameLeaveUserDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user is in another game
  if (users[userId].gameId != gameId) { // They're already in a game
    // Send an error message
    const responseJSON = { message: 'User in another game', id: 'GameLeaveUserBusy' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Find the player in the array
  let playerIndex; // Either going to be 0 or 1
  for (let i = 0; i < games[gameId].players.length; i++) {
    if (games[gameId].players[i].user.id == userId) { // This player is the user
      playerIndex = i;
    }
  }

  // Remove the player from the list
  // Found this from https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
  games[gameId].players.splice(playerIndex, 1);

  // Clear the gameId from the user object
  users[userId].gameId = null;

  // Delete the game if nobody is in it
  if (games[gameId].players.length === 0) { // Its empty
    // Delete the game
    games[gameId].deleted_at = Date.now();
  } else { // The game still exists
    GameReset(gameId);
  }

  objectUpdated(games[gameId]);
  objectUpdated(users[userId]);

  // Return the user
  return respondJSON(request, response, 200, users[userId]);
};

const GameReadyNewRound = (request, response, data) => {
  // Extract variables from data
  const { userId, gameId } = data;
  let playerIndex; // Either going to be 0 or 1

  // Make sure theres no error
  // Check if the game exists
  if (!games[gameId]) { // It doesn't exist
    // Send an error message
    const responseJSON = { message: 'Game does not exist', id: 'GameReadyGameNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the game was deleted
  if (games[gameId].deleted_at !== null) { // The game existed but was deleted
    // Send an error message
    const responseJSON = { message: 'Game deleted', id: 'GameReadyGameDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user exists
  if (!users[userId]) { // They don't exist
    // Send an error message
    const responseJSON = { message: 'User does not exist', id: 'GameReadyUserNoExist' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user was deleted
  if (users[userId].deleted_at !== null) { // The user existed but was deleted
    // Send an error message
    const responseJSON = { message: 'User was deleted', id: 'GameReadyUserDeleted' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Check if the user is in another game
  if (users[userId].gameId != gameId) { // They're already in a game
    // Send an error message
    const responseJSON = { message: 'User in another game', id: 'GameReadyUserBusy' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Find the player in the array
  for (let i = 0; i < games[gameId].players.length; i++) {
    if (games[gameId].players[i].user.id == userId) { // This player is the user
      playerIndex = i;
    }
  }

  // Check if the user still has a throw waiting to be processed
  if (!games[gameId].roundEnd) { // They currently have a throw
    // Send an error message
    const responseJSON = { message: 'Round still active', id: 'GameReadyRoundActive' };
    return respondJSON(request, response, 404, responseJSON);
  }

  // Mark the player as ready to move to a new round
  games[gameId].players[playerIndex].wantNewRound = true;
  GameUpdate(gameId);
  return respondJSON(request, response, 200, games[gameId]);
};

const NotFound = (request, response) => {
  const responseJSON = { message: 'Url not found', id: 'badRequest' };
  return respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  ClearData,
  UsersJoin,
  GameCreate,
  GameAvailableGames,
  GameJoin,
  GameState,
  UserStats,
  GameThrow,
  GameLeave,
  GameReadyNewRound,
  NotFound,
};

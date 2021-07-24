// create a game, expect a playlist youtube. can be overwritten.
// will use the vocal channel and the text channel the user is currently in
const createGame = {
  trigger: "!newGame",
  action: () => {
    return "ok";
  }
};

// connect the bot to the vocal chan, and starts waiting for answers
const launchGame = {
  trigger: "!newGame",
  action: () => {
    return "ok";
  }
};

// end a game, only works if it was already launched

const endGame = {
  trigger: "!endgame",
  action: () => {
    return "ok";
  }
};

export default [];

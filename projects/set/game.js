var setGame = (function () {
  var deck = [];
  var cards = [];
  var selectedIndices = [];
  var setsFound = 0;
  var statusMessage = "";

  function Card(id, fill, shape, color, number) {
    this.id = id;
    this.color = color;
    this.number = number;
    this.shape = shape;
    this.fill = fill;
    return;
  }

  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function checkSet(potentialSet) {
    const features = ["color", "number", "shape", "fill"];

    let result = features.every((feature) => {
      // 1 and 2 are the same, and 3 is different
      if (
        potentialSet[0][feature] === potentialSet[1][feature] &&
        potentialSet[1][feature] !== potentialSet[2][feature]
      )
        return false;
      // 1 and 3 are the same, and 2 is different
      if (
        potentialSet[0][feature] === potentialSet[2][feature] &&
        potentialSet[1][feature] !== potentialSet[2][feature]
      )
        return false;
      // 2 and 3 are the same, and 1 is different
      if (
        potentialSet[1][feature] === potentialSet[2][feature] &&
        potentialSet[2][feature] !== potentialSet[0][feature]
      )
        return false;
      return true;
    });

    return result;
  }

  function createDeck() {
    var id = 1;
    var deck = [];
    const colors = ["red", "purple", "green"];

    const numbers = ["1", "2", "3"];

    const shapes = ["worm", "diamond", "pill"];

    const fills = ["solid", "stripe", "empty"];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          for (let l = 0; l < 3; l++) {
            deck.push(new Card(id, fills[i], shapes[j], colors[k], numbers[l]));
            id += 1;
          }
        }
      }
    }
    return deck;
  }

  function drawNewGame() {
    selectedIndices = [];
    statusMessage = "";
    setsFound = 0;
    do {
      cards = [];
      deck = shuffle(createDeck());
      for (i = 0; i < 12; i++) {
        let c = deck.pop();
        c.selected = false;
        cards.push(c);
      }
    } while (checkForNoSet());
  }

  function checkForSet() {
    let selected = cards.filter((card) => {
      return card.selected === true;
    });

    if (selected.length >= 3) {
      return checkSet(selected);
    }
  }

  function addCardToSelection(index) {
    statusMessage = "";
    selectedIndices.push(index);
    cards[index].selected = true;
    if (selectedIndices.length >= 3) {
      if (checkForSet()) {
        // we found a set!
        console.log(
          `user found a set: ${selectedIndices[0]}, ${selectedIndices[1]}, ${selectedIndices[2]}`
        );
        setsFound += 1;
        statusMessage = "Set!";

        // sort selected indices in decending order to take care of the
        // bug where removal removes the wrong stuff because the indices of
        // the cards in cards changes after each removal.
        // https://stackoverflow.com/questions/9425009/remove-multiple-elements-from-array-in-javascript-jquery
        selectedIndices.sort((a, b) => {
          return b - a;
        });

        // first check if were in the case where we had extra cards
        if (cards.length <= 12) {
          selectedIndices.forEach((i) => {
            let c = deck.pop();
            if (c !== undefined) {
              // there are cards left, replace
              // the set with the next 3 cards from the deck.
              c.selected = false;
              cards[i] = c;
            } else {
              // there are no cards in the deck. simply remove the cards.
              cards.splice(i, 1);
            }
          });
        } else {
          // we had to add extra cards, so just delete the set with splice.
          // since selectedIndices is sorted greatest -> least
          // we are removing from the end of the array
          // so we dont have to worry about cardStates order shifting mid
          // delete loop.
          selectedIndices.forEach((i) => {
            cards.splice(i, 1);
          });
        }

        // check for no set
        if (checkForNoSet(cards)) {
          statusMessage = "No set possible, adding cards!";
          // if theres no set we gotta add three more cards!
          for (let i = 0; i < 3; i++) {
            let c = deck.pop();
            if (c !== undefined) {
              c.selected = false;
              cards.push(c);
            } else {
              // no set possible, no cards left in the deck, game over.
              statusMessage = "Game Over!";
              break;
            }
          }
        }
      } else {
        statusMessage = "Not a set!";
        selectedIndices.forEach((i) => {
          cards[i].selected = false;
        });
      }
      selectedIndices = [];
    }
  }

  function removeCardFromSelection(index) {
    let i = selectedIndices.indexOf(index);
    if (i > -1) {
      selectedIndices.splice(i, 1);
    }
    cards[index].selected = false;
  }

  function checkForNoSet() {
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (checkSet([cards[i], cards[j], cards[k]])) {
            console.log(`computer found set: ${i} ${j} ${k}`);
            return false;
          }
        }
      }
    }
    return true;
  }

  return {
    cards: () => {
      return cards;
    },
    deck: () => {
      return deck;
    },
    statusMessage: () => {
      return statusMessage;
    },
    setsFound: () => {
      return setsFound;
    },
    init: drawNewGame,
    addCardToSelection: addCardToSelection,
    removeCardFromSelection: removeCardFromSelection,
  };
})();

function flashMsg(msg) {
  var msgEl = document.querySelectorAll("#message")[0];
  msgEl.textContent = msg;
  // Add the "show" class to DIV
  msgEl.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(() => {
    msgEl.className = msgEl.className.replace = ("show", "");
  }, 3000);
}

function gameOver(setGame) {
  let cardsContainer = document.getElementById("cards-container");
  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }
  let n = document.createElement("div");
  n.className = "gameover";
  n.innerHTML = "<h2>Game Over!</h2><p>You found all the sets!</p>";
  let newGameBtn = document.createElement("button");
  newGameBtn.innerText = "New Game";
  newGameBtn.addEventListener("click", function () {
    setGame.init();
    renderGame(setGame);
    document.body.removeChild(document.getElementsByClassName("gameover")[0]);
  });

  n.appendChild(newGameBtn);

  document.body.appendChild(n);
}

function renderGame(setGame) {
  if (setGame.statusMessage() === "Game Over!") {
    gameOver(setGame);
    return;
  }

  var scoreBoardEl = document.getElementById("scoreboard");
  scoreBoardEl.innerHTML = `Found ${setGame.setsFound()} sets. ${
    setGame.deck().length
  } cards left in the deck.`;

  let parent = document.getElementById("cards-container");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  setGame.cards().forEach((card, i) => {
    if (card !== undefined && card.id > 0) {
      let n = document.createElement("div");
      n.className = "card-cell";
      if (card.selected) {
        n.classList.add("selected");
      }
      n.innerHTML = `<img src='img/${card.id}.png'>`;
      n.addEventListener("click", function () {
        if (n.classList.contains("selected")) {
          setGame.removeCardFromSelection(i);
          renderGame(setGame);
        } else {
          setGame.addCardToSelection(i);
          renderGame(setGame);
        }
      });
      parent.appendChild(n);
    }
  });

  flashMsg(setGame.statusMessage());
}

setGame.init();
renderGame(setGame);

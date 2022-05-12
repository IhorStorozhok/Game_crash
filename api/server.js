const ws = new require("ws");

const wsServer = new ws.Server({ port: 5000 });
const users = [];

const getRandomArbitrary = function (min, max) {
  return Math.random() * (max - min) + min;
};
const game = (newConnection) => {
  let round_countdown = 5;
  let multiplier_update = 1;

  let roundTimer = setInterval(() => {
    newConnection &&
      newConnection.send(
        JSON.stringify({
          name: "round_countdown",
          value: round_countdown,
          isInprocess: false,
        })
      );
    round_countdown -= 1;
  }, 1000);

  setTimeout(() => {
    clearInterval(roundTimer);
    let result = "skip";
    let index = users.findIndex((el) => {
      return el.user === newConnection;
    });
    let divisor =
      (400 / users[index].balance).toFixed() > 10
        ? 10
        : (400 / users[index].balance).toFixed();
    multiplier_update = getRandomArbitrary(1, divisor).toFixed(2);

    let multiplier_countdownValue = 1;
    let multiplier_countdown = setInterval(() => {
      if (users[index].isTaken) {
        let multiplier = multiplier_countdownValue.toFixed(2);
        users[index].take = multiplier;

        users[index].isTaken = false;
      }
      multiplier_countdownValue = multiplier_countdownValue + 0.01;

      newConnection &&
        newConnection.send(
          JSON.stringify({
            name: "multiplier_countdownValue",
            value: multiplier_countdownValue.toFixed(2),
            isInprocess: true,
          })
        );

      if (multiplier_update < multiplier_countdownValue) {
        if (users[index].take === 0 && users[index].bet !== 0) {
          users[index].balance = users[index].balance - users[index].bet;
          users[index].bet = 0;
          result = "lost";
        } else if (
          users[index].take < multiplier_update &&
          users[index].bet &&
          users[index].take
        ) {
          users[index].balance =
            users[index].balance + users[index].take * users[index].bet;
          users[index].bet = 0;
          result = "won";
        } else if (users[index].take === 0 && users[index].bet === 0) {
          result = "skip";
        } else {
          users[index].balance = users[index].balance - users[index].bet;
          users[index].bet = 0;
          result = "lost";
        }

        newConnection.send(
          JSON.stringify({
            name: "updated_balance",
            updated_balance: users[index].balance,
            result: result,
            multiplier: users[index].take,
          })
        );

        users[index].take = 0;
        users[index].bet = 0;
        users[index].isTaken = false;

        clearInterval(multiplier_countdown);
        newConnection.send(
          JSON.stringify({
            name: "multiplier_countdownValue",
            value: multiplier_countdownValue.toFixed(2),
            isInprocess: true,
            betMakedReset: true,
            isFinish: true,
          })
        );

        setTimeout(() => {
          newConnection.send(
            JSON.stringify({
              name: "finish",
            })
          );
          game(newConnection);
        }, 3000);
      }
    }, 50);
  }, 6000);
};

function findIndex(user) {
  const index = users.findIndex((el) => {
    return el.user === user;
  });

  return index;
}

wsServer.on("connection", (newUser) => {
  users.push({
    user: newUser,
    balance: 100,
    take: 0,
    bet: 0,
  });
  newUser.on("message", (data) => {
    const message = JSON.parse(data);

    if (Object.keys(message).includes("make_bet")) {
      let index = findIndex(newUser);

      if (users[index].balance >= message.make_bet) {
        users[index].bet = +message.make_bet;
      }
    }
    if (message.name === "take") {
      let index = findIndex(newUser);
      users[index].isTaken = true;
    }
  });
  game(newUser);
});

<template>
  <div class="container">
    <div class="containerInfoDisplay">
      <div v-if="!this.isInprocess">
        <p class="message">BE READY FOR A ROUND</p>
        <p class="countDownText">{{ round_countdown }}</p>
      </div>
      <div v-else>
        <p class="multiplierText">x{{ multiplier_countdownValue }}</p>
        <p class="multiplierMessage" v-bind:class="classObject">
          {{ messageObject.message }}
        </p>
      </div>
    </div>

    <div class="containerControlDisplay">
      <div class="balanceThumb">
        <p class="balanceText">BALANCE</p>
        <p class="balance">{{ balance }}</p>
      </div>
      <input
        placeholder="BET VALUE"
        type="text"
        class="inputBet"
        :class="{ freezeInput: isInprocess }"
        v-model="bet.betValue"
        v-bind="{ disabled: isInprocess }"
      />
      <buttonBet
        class="button"
        :class="{ activeButton: isInprocess }"
        v-on:click="
          createBet();
          makeBet();
        "
        v-bind="{ disabled: (isBetMaked && !isInprocess) || isTaken }"
        :buttonText="buttonText"
      />
    </div>
  </div>
</template>

<script>
import buttonBet from "./components/buttonBet.vue";
export default {
  components: { buttonBet },
  data: function () {
    return {
      connection: null,
      round_countdown: 5,
      multiplier_countdownValue: 1,
      isInprocess: false,
      isBetMaked: false,
      buttonText: "PLACE A BET",
      isTaken: false,
      bet: { betValue: "" },
      betForSend: "",
      balance: 100,
      result: "skip",
      multiplier: 1,
    };
  },
  computed: {
    classObject: function () {
      return {
        won: this.result === "won",
        lost: this.result === "lost",
        skip: this.result === "skip",
      };
    },
    messageObject: function () {
      let message = "";
      if (this.result === "won") {
        message = `WON ${this.betForSend.make_bet} x ${this.multiplier}`;
      }
      if (this.result === "lost") {
        message = "CRASHED! YOU LOOSE";
      }

      return { message };
    },
  },
  methods: {
    sendMessage: function (message) {
      this.connection.send(message);
    },
    changeRoundCountdown(value) {
      this.round_countdown = value;
    },
    changeMultiplierCountdown(value) {
      this.multiplier_countdownValue = value;
    },
    changeisInprocessStatus(val) {
      this.isInprocess = val;
    },
    changeIsBetMaked(val) {
      this.isBetMaked = val;
    },
    createBet: function () {
      const betForSend = { make_bet: this.bet.betValue };
      this.bet.betValue = "";
      this.betForSend = betForSend;
    },
    makeBet() {
      if (!this.isInprocess) {
        this.isBetMaked = true;
        let validatedBet = Number(this.betForSend.make_bet);
        if (validatedBet <= this.balance) {
          const message = JSON.stringify(this.betForSend);
          this.sendMessage(message);
        } else {
          alert("Incorrect bet value");
        }
      } else {
        const message = JSON.stringify({ name: "take" });
        this.sendMessage(message);
        this.isTaken = true;
      }
    },
  },
  created: function () {
    console.log("Starting  Connection to WebSocet");
    this.connection = new WebSocket("ws://localhost:5000");

    this.connection.onopen = function () {
      console.log("Successfully connected to wss://localhost:5000");
    };
    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.name === "round_countdown") {
        this.changeRoundCountdown(data.value);
        !data.isInprocess && this.changeisInprocessStatus(false);
      }
      if (data.name === "multiplier_countdownValue") {
        this.changeMultiplierCountdown(data.value);
        data.isInprocess && this.changeisInprocessStatus(true);
        if (data.betMakedReset) {
          this.changeIsBetMaked(false);
          this.isTaken = false;
        }
        if (data.isInprocess) {
          this.buttonText = "TAKE";
        }
        if (data.betMakedReset) {
          this.buttonText = "PLACE A BET";
        }
      }
      if (data.name === "updated_balance") {
        const validatedBalance = data.updated_balance.toFixed();
        this.balance = validatedBalance;
        this.result = data.result;
        this.multiplier = data.multiplier;
      }
      if (data.name === "finish") {
        this.result = "";
      }
    };
  },
};
</script>

<style lang="scss">
@mixin text {
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;

  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.countDownText {
  @include text;
  font-size: 40px;
  line-height: 47px;
  padding-top: 20px;
}
.message {
  @include text;
  padding-top: 32px;
}
.balanceText {
  @include text;
}
.balance {
  @include text;
  font-size: 32px;
  line-height: 38px;
  margin-top: 4px;
}

.balanceThumb {
  display: block;
}
.inputBet {
  width: 132px;
  height: 54px;
  background: #282b30;
  box-shadow: inset 4px 4px 6px rgba(0, 0, 0, 0.2),
    inset -4px -4px 6px rgba(255, 255, 255, 0.12);
  border-radius: 15px;
  font-family: "Roboto";
  font-weight: 400;
  font-size: 18px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  border: 0px;

  color: rgba(255, 255, 255, 0.4);

  margin: 0px 35px 0px 35px;
}
.freezeInput {
  opacity: 0.1;
}

.multiplierText {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  font-size: 55px;
  line-height: 64px;
  align-items: center;
  text-align: center;
  color: #c27500;
  padding-top: 29px;
  margin: 0;

  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
}
.multiplierMessage {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  font-size: 30px;
  line-height: 35px;
  align-items: center;
  text-align: center;

  padding-top: 2px;
  margin: 0px;
  text-shadow: 2px 4px 6px rgba(0, 0, 0, 0.25);
}
.won {
  color: #00c208;
}
.lost {
  color: #c20000;
}
.skip {
  opacity: 0;
}
body {
  background-color: #16171b;
  margin: 0;
  margin-left: 460px; //я би позиціонував по центу, але згідно макету - 460px від лівого краю
  display: flex;
  align-items: center;
  height: 100vh;

  .container {
    width: 449px;
    height: 340px;
    background: #34393d;
    border: 3px solid #3d4249;
    box-shadow: inset 20px 30px 60px 1px #25282d;
    border-radius: 20px;
  }
}
.containerInfoDisplay {
  height: 164px;
  border-bottom: 3px solid #1d1e24;
}

.containerControlDisplay {
  height: 175px;
  display: flex;

  justify-content: center;
  align-items: center;
  .activeButton {
    background: #882424;
    div {
      background: #882424;
      color: rgba(255, 255, 255, 0.4);
    }
  }
}
.button {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}
</style>

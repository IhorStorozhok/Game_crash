import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      isPreparing: true,
      roundCountdown: 5,
      balance: 100,
      multiplier: 1.1,
      resultWin: true,
    };
  },
  getters: {},
  mutations: {},
  actions: {},
});

import { defineStore } from "pinia";

export const worldState = defineStore({
  id: "worldState",
  //сюда пишется текущее состояние
  state: () => ({
    // lineVelocity: 0,
    // activityR: 0,
    // bearingMaxVelocity: 0,
    // driveMaxVelocity: 0,
    // manipulatorCount: 0,
    // items: [],
  }),

  // геттеры это компьютед-свойства. автоматически пересчитываются каждый раз, когда какой-то из операндов внутри меняется
  // getters: {
  //   //doubleCount: (state) => state.counter * 2,
  // },

  // экшены нужны для изменения state
  // actions: {
  //   // increment() {
  //   //   this.counter++;
  //   // },
  // },
});

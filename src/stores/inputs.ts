import { defineStore } from "pinia";

export const useCounterStore = defineStore({
  id: "inputs",
  state: () => ({
    lineVelocity: 0,
    activityR: 0,

    bearingVelocity: 0,
    driveMaxVelocity: 0,
    manipulatorCount: 0,
    items: [],
  }),
  // getters: {
  //   //doubleCount: (state) => state.counter * 2,
  // },
  // actions: {
  //   // increment() {
  //   //   this.counter++;
  //   // },
  // },
});

import { defineStore } from "pinia";
export const useInputsState = defineStore({
  id: "inputs",
  state: () => ({
    lineVelocity: 0,
    activityR: 0,

    bearingMaxVelocity: 0,
    driveMaxVelocity: 0,
    manipulatorCount: 0,
    items: <string[]>[],
  }),
});
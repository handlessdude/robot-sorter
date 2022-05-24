import type { IBin } from "@/types/bin";
import { defineStore } from "pinia";
export const useInputsStore = defineStore({
  id: "inputs",
  state: () => ({
    lineVelocity: 0,
    activityR: 0,

    bearingMaxVelocity: 0,
    driveMaxVelocity: 0,
    manipulatorCount: 0,
    items: <string[]>[],
    bins: <IBin[]>[],
  }),
});

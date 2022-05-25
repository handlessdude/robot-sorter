import type { IBin } from "@/types/bin";
import type { ItemType } from "@/types/itemTypes";
import { isNotEmpty, isPositive } from "@/utils/utils";
import { defineStore } from "pinia";
export const useInputsState = defineStore({
  id: "inputs",
  state: () => ({
    data: {
      lineVelocity: 0,
      activityR: 0,

      bearingMaxVelocity: 0,
      driveMaxVelocity: 0,
      manipulatorCount: 0,
      items: <string[]>[],
      bins: <IBin[]>[
        {
          coordinates: { x: 0, y: 0 },
          itemType: "banana" as ItemType,
          numberOfCorrect: 0,
        },
      ],
    },

    submitted: false,
    error: "",
  }),

  getters: {
    isValid: (state) =>
      Object.values(state.data).reduce(
        (validity, value) =>
          (Array.isArray(value) ? isNotEmpty(value) : isPositive(value)) &&
          validity,
        true
      ),
  },

  actions: {
    startSimulation() {
      if (this.isValid) {
        this.submitted = true;
        this.error = "";
      } else {
        this.error = "Incorrect data input. Please check your inputs.";
      }
    },
    endSimulation() {
      this.error = "";
      this.submitted = false;
    },
  },
});

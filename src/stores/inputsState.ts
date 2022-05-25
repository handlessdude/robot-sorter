import { Manipulator } from "@/logic/manipulator";

import type { ItemType } from "@/types/itemTypes";
import { isNotEmpty, isPositive } from "@/utils/utils";
import { defineStore } from "pinia";
import { hri } from "human-readable-ids";
import { Bin } from "@/logic/bin";

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
      bins: <Bin[]>[],
      manipulators: <Manipulator[]>[],
    },

    submitted: false,
    error: "",
  }),

  getters: {
    isValid: (state) =>
      Object.values(state.data).reduce(
        (validity, value) =>
          (Array.isArray(value)
            ? isNotEmpty(value)
            : /*isPositive(value)*/ true) && validity,
        true
      ),
    errorEmpty: (state) => state.error === "",
    nextTypeToPlaceBin: (state) => {
      const res = state.data.items.find(
        // вернем первый item из массива
        (item) =>
          !state.data.bins.some((bin) => bin.itemType === (item as ItemType)) //для котороого нет корзины
      );
      console.log(res);
      return res;
    },
    itemsLen: (state) => state.data.items.length,
  },

  actions: {
    placeNewManip(x: number, y: number) {
      this.data.manipulators.push(
        new Manipulator(hri.random(), this.data.activityR, { x, y })
      );
    },
    placeNewBin(x: number, y: number) {
      const nextType = this.nextTypeToPlaceBin;
      if (!nextType) {
        return;
      }
      this.data.bins.push(new Bin({ x, y }, nextType as ItemType, 0));
    },
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

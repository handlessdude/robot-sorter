import { Manipulator } from "@/logic/manipulator";

import type { IItem, ItemType } from "@/types/itemTypes";
import { isNotEmpty, isPositive } from "@/utils/utils";
import { defineStore } from "pinia";
import { Bin } from "@/logic/bin";

export const useInputsState = defineStore({
  id: "inputs",
  state: () => ({
    data: {
      lineVelocity: 2,
      activityR: 600,
      bearingMaxVelocity: 0.02,
      driveMaxVelocity: 0.02,
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
          (Array.isArray(value) ? isNotEmpty(value) : isPositive(value)) &&
          validity,
        true
      ),
    errorEmpty: (state) => state.error === "",
    nextTypeToPlaceBin: (state) => {
      const res = state.data.items.find(
        // вернем первый item из массива
        (item) =>
          !state.data.bins.some((bin) => bin.itemType === (item as ItemType)) //для котороого нет корзины
      );
      //console.log(res);
      return res;
    },
    binsCount: (state) => state.data.bins.length,
  },

  actions: {
    pushNewManip(x: number, y: number) {
      this.data.manipulators.push(
        new Manipulator(this.data.activityR, { x, y })
      );
    },
    removeManip(manip_id: string) {
      this.data.manipulators = this.data.manipulators.filter(
        (m) => m.id != manip_id
      );
    },
    async pushNewBin(x: number, y: number) {
      const nextType = this.nextTypeToPlaceBin;
      if (!nextType) {
        return;
      }
      const newBin = await Bin.initialize({ x, y }, nextType as ItemType, 0);
      this.data.bins.push(newBin);
    },
    removeBin(bin_id: string) {
      this.data.bins = this.data.bins.filter((bin) => bin.id != bin_id);
    },

    startSimulation() {
      if (this.isValid) {
        this.submitted = true;
        this.error = "";
        this.data.manipulators.forEach((manip) =>
          manip.findBins(this.data.bins)
        );
      } else {
        this.error = "Incorrect data input. Please check your inputs.";
      }
    },
    endSimulation() {
      this.error = "";
      this.submitted = false;
    },

    drawBins(ctx: CanvasRenderingContext2D) {
      this.data.bins.forEach((bin) => bin.draw(ctx));
    },

    updateManips(traffic: Array<IItem>) {
      this.data.manipulators.forEach((manip) =>
        manip.update(
          traffic,
          this.data.lineVelocity,
          this.data.driveMaxVelocity,
          this.data.bearingMaxVelocity
        )
      );
    },

    drawManips(ctx: CanvasRenderingContext2D) {
      this.data.manipulators.forEach((manip) => manip.draw(ctx));
    },
    drawManipsAreas(ctx: CanvasRenderingContext2D) {
      this.data.manipulators.forEach((manip) => manip.drawActivityArea(ctx));
    },
  },
});

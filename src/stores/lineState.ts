import { worldConstants } from "@/stupidConstants/worldConstants";
import Line from "@/world/Line";
import { defineStore } from "pinia";
export const useLineState = defineStore({
  id: "line",
  state: () => ({
    line: new Line(
      worldConstants.WORLD_CANVAS_WIDTH * 0.5,
      worldConstants.WORLD_CANVAS_WIDTH * 0.7
    ),
  }),

  getters: {},

  actions: {},
});

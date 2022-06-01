import { drawConstants } from "@/stupidConstants/drawConstants";
import Line from "@/world/Line";
import { defineStore } from "pinia";
export const useLineState = defineStore({
  id: "line",
  state: () => ({
    line: new Line(
      drawConstants.CANVAS_SETTINGS.WORLD_CANVAS_WIDTH * 0.5,
      drawConstants.CANVAS_SETTINGS.WORLD_CANVAS_WIDTH * 0.7
    ),
  }),

  getters: {},

  actions: {},
});

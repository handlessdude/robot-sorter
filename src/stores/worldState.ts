import { defineStore } from "pinia";
import { useInputsState } from "./inputsState";
import { useLineState } from "@/stores/lineState";
import { useTrafficState } from "@/stores/trafficState";

export const useWorldState = defineStore({
  id: "worldState",
  actions: {
    drawWorld(ctx: CanvasRenderingContext2D) {
      const inputsState = useInputsState();
      const lineState = useLineState();
      const trafficState = useTrafficState();

      ctx.save();
      lineState.line.draw(ctx);
      inputsState.drawManipsAreas(ctx);
      inputsState.drawBins(ctx);
      trafficState.drawTraffic(ctx);
      inputsState.drawManips(ctx);
      ctx.restore();
    },
  },
});

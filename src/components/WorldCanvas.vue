<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { useTrafficState } from "@/stores/trafficState";
import { useInputsState } from "@/stores/inputsState";
import { useLineState } from "@/stores/lineState";
import { useWorldState } from "@/stores/worldState";

/*TODO REFACTOR INTO STORE*/
const inputsState = useInputsState();
const lineState = useLineState();
const trafficState = useTrafficState();
const worldState = useWorldState();

let worldCanvas: HTMLCanvasElement;
let genImgReqID: number;
let animFrameReqID: number;

onMounted(() => {
  window.onload = () => {
    worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
    worldCanvas.height = window.innerHeight - worldConstants.HEADER_OFFSET;
    worldCanvas.width = worldConstants.WORLD_CANVAS_WIDTH;

    //line = new Line(worldCanvas.width * 0.5, worldCanvas.width * 0.7);
    const ctx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.save();
    lineState.line.draw(ctx);
    ctx.restore();

    console.log("Canvas is ready!");
  };
});
watch(
  () => inputsState.submitted /*&& modelLoaded.value*/,
  (condition) => {
    if (condition) {
      /*if no model request model and so on if we actually will use model*/
      animate();
      genImgReqID = setInterval(
        trafficState.genNewImg,
        worldConstants.ITEM_GEN_TIMESPAN
      );
    } else {
      clear();
    }
  }
);

function clear() {
  window.cancelAnimationFrame(animFrameReqID);
  window.clearInterval(genImgReqID);
}

function animate() {
  /*ALL THE UPDATINGS GO HERE*/
  trafficState.updateTraffic(
    (item) =>
      item.coordinates.y < window.innerHeight - worldConstants.HEADER_OFFSET,
    (item) => ({
      ...item,
      coordinates: {
        x: item.coordinates.x,
        y: item.coordinates.y + inputsState.data.lineVelocity,
      },
    })
  );
  inputsState.data.manipulators.forEach((manip) =>
    manip.update(
      trafficState.traffic,
      inputsState.data.lineVelocity,
      inputsState.data.driveMaxVelocity,
      inputsState.data.bearingMaxVelocity
    )
  );
  //console.log("current worldState.traffic.length", worldState.traffic.length);

  inputsState.updateManips(trafficState.traffic);
  //console.log(inputsState.data.manipulators);

  //lol do not touch these LINES
  worldCanvas.height = window.innerHeight - worldConstants.HEADER_OFFSET;
  worldCanvas.width = worldConstants.WORLD_CANVAS_WIDTH;
  //

  const ctx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
  worldState.drawWorld(ctx);
  animFrameReqID = window.requestAnimationFrame(animate);
}
</script>

<template>
  <div class="board">
    <canvas id="worldCanvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.board {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#worldCanvas {
  background: var(--white);
  width: 800px;
  height: calc(100vh - var(--header-height));
}
</style>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { useTrafficState } from "@/stores/trafficState";
import { useInputsState } from "@/stores/inputsState";
import { useLineState } from "@/stores/lineState";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

/*TODO REFACTOR INTO STORE*/
const inputsState = useInputsState();
const lineState = useLineState();
const trafficState = useTrafficState();

let worldCanvas: HTMLCanvasElement;
let genImgReqID: number;
let animFrameReqID: number;

let model: cocoSsd.ObjectDetection;
const modelLoaded = ref(false);

onMounted(() => {
  cocoSsd.load({ base: "lite_mobilenet_v2" }).then(function (loadedModel) {
    model = loadedModel;
    modelLoaded.value = true;
    worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;

    worldCanvas.height = window.innerHeight - worldConstants.HEADER_OFFSET;
    worldCanvas.width = worldConstants.WORLD_CANVAS_WIDTH;

    //line = new Line(worldCanvas.width * 0.5, worldCanvas.width * 0.7);
    const ctx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.save();
    lineState.line.draw(ctx);
    ctx.restore();

    console.log("Model and canvas are ready!");
  });
});
watch(
  () => inputsState.submitted && modelLoaded.value,
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
  if (!model) {
    console.log("Wait for model to load before starting simulation!");
    return;
  }
  /*DO NOT FORGET TO CLEAN UP FAR-GONE ITEMS*/
  /*ALL THE UPDATINGS GO HERE*/
  trafficState.updateTraffic(
    (item) =>
      item.coordinates.y < window.innerHeight - worldConstants.HEADER_OFFSET,
    (item) => ({
      ...item,
      coordinates: {
        x: item.coordinates.x,
        y: item.coordinates.y + worldConstants.ITEM_VELOCITY,
      },
    })
  );
  //console.log("current worldState.traffic.length", worldState.traffic.length);

  /*here we detect the items on canvas*/
  model.detect(worldCanvas).then(function (predictions) {
    if (predictions.length > 0) {
      console.log(predictions);
    }
  });
  //lol do not touch these LINES
  worldCanvas.height = window.innerHeight - worldConstants.HEADER_OFFSET;
  worldCanvas.width = worldConstants.WORLD_CANVAS_WIDTH;
  //

  const ctx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.save();
  /*all the drawings go here*/
  lineState.line.draw(ctx);
  trafficState.drawTraffic(ctx);
  inputsState.drawBins(ctx);
  inputsState.drawManips(ctx);
  ctx.restore();

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

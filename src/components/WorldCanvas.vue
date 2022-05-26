<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { useTrafficState } from "@/stores/trafficState";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
/*TODO REFACTOR INTO STORE*/
const trafficState = useTrafficState();
let worldCanvas: HTMLCanvasElement;
let genNewImgInterval: number;
let model: cocoSsd.ObjectDetection;

onMounted(() => {
  cocoSsd.load({ base: "lite_mobilenet_v2" }).then(function (loadedModel) {
    model = loadedModel;
    console.log(model);

    worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
    console.log(worldCanvas);

    animate();
    genNewImgInterval = setInterval(
      trafficState.genNewImg,
      worldConstants.ITEM_GEN_TIMESPAN
    );
  });
});
onUnmounted(() => {
  clearInterval(genNewImgInterval);
});

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
      y: item.coordinates.y + worldConstants.ITEM_VELOCITY_DELTA,
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
  trafficState.drawTraffic(ctx);

  ctx.restore();

  window.requestAnimationFrame(animate);
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

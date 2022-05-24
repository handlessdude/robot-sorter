<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { useTrafficState } from "@/stores/trafficState";
/*TODO REFACTOR INTO STORE*/
const trafficState = useTrafficState();
let worldCanvas: HTMLCanvasElement;
let genNewImgInterval: number;
//let worldCanvasCtx: CanvasRenderingContext2D;

onMounted(() => {
  worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;

  window.onload = () => {
    console.log(worldCanvas);
    animate();
    genNewImgInterval = setInterval(
      trafficState.genNewImg,
      worldConstants.ITEM_GEN_TIMESPAN
    );
  };
});
onUnmounted(() => {
  clearInterval(genNewImgInterval);
});

function animate() {
  /*DO NOT FORGET TO CLEAN UP FAR-GONE ITEMS*/
  /*ALL THE UPDATINGS GO HERE*/
  trafficState.updateTraffic(
    (item) => item.y < window.innerHeight - worldConstants.HEADER_OFFSET,
    (item) => ({ ...item, y: item.y + worldConstants.ITEM_VELOCITY_DELTA })
  );
  //console.log("current worldState.traffic.length", worldState.traffic.length);

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

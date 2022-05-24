<script setup lang="ts">
import { onMounted } from "vue";

const delta = 5 * 16;
const inner_width = 800;
let worldCanvas: HTMLCanvasElement;
let worldCanvasCtx: CanvasRenderingContext2D;

const sources = ["https://www.w3schools.com/tags/img_the_scream.jpg"];
//let traffic = sources.map((pic) => genNewImg());
let traffic = [genNewImg()];
function genNewImg() {
  const img = new Image();
  img.src = sources[0];
  return {
    img,
    x: Math.random() * (inner_width - 227),
    y: 0,
  };
}
function pushNewImg() {
  traffic.push(genNewImg());
  console.log(traffic);
}
onMounted(() => {
  worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
  worldCanvasCtx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
  //animate();
  setInterval(pushNewImg, 500);
  animate();
});

function drawTraffic() {
  //lol do not touch these LINES
  worldCanvas.height = window.innerHeight - delta;
  worldCanvas.width = inner_width;
  //
  worldCanvasCtx.save();
  traffic.forEach((item) => {
    worldCanvasCtx.drawImage(item.img, item.x, item.y);
  });
  worldCanvasCtx.restore();
}
function animate() {
  traffic = traffic
    .filter((item) => item.y < window.innerHeight - delta + 227)
    .map((item) => ({ ...item, y: item.y + 5 }));
  drawTraffic();

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

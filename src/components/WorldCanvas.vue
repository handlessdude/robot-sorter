<script setup lang="ts">
import { onMounted } from "vue";

import apple from "@/assets/img/apple.png";
import banana from "@/assets/img/banana.png";
import bottle from "@/assets/img/bottle.png";
import cake from "@/assets/img/cake.png";
import clock from "@/assets/img/clock.png";
import cup from "@/assets/img/cup.png";
import pizza from "@/assets/img/pizza.png";

/*TODO REFACTOR INTO STORE*/
const TIMESPAN = 2000;
const SCALE_QUOTIENT = 0.2;
const delta = 5 * 16;
const inner_width = 800;
let worldCanvas: HTMLCanvasElement;
let worldCanvasCtx: CanvasRenderingContext2D;

const sources = [apple, banana, bottle, cake, clock, cup, pizza];
let traffic = [genNewImg()];
function genNewImg() {
  const img = new Image();
  img.src = sources[Math.floor(Math.random() * sources.length)];
  return {
    img,
    x: Math.random() * (inner_width - img.width * SCALE_QUOTIENT),
    y: -img.height * SCALE_QUOTIENT,
  };
}
function pushNewImg() {
  traffic.push(genNewImg());
  console.log(traffic);
}
onMounted(() => {
  worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
  worldCanvasCtx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;
  setInterval(pushNewImg, TIMESPAN);
  animate();
});

function drawTraffic() {
  //lol do not touch these LINES
  worldCanvas.height = window.innerHeight - delta;
  worldCanvas.width = inner_width;
  //
  worldCanvasCtx.save();
  traffic.forEach((item) => {
    //worldCanvasCtx.drawImage(item.img, item.x, item.y);
    worldCanvasCtx.drawImage(
      item.img,
      0,
      0,
      item.img.width,
      item.img.height,
      item.x,
      item.y,
      Math.floor(item.img.width * SCALE_QUOTIENT),
      Math.floor(item.img.height * SCALE_QUOTIENT)
    );
    /*... ctx.drawImage(   // Image    mario,   
    // ---- Selection ----    
    0, // sx    
    MARIO_HEIGHT * 2, // sy    
    MARIO_WIDTH, // sWidth    
    MARIO_HEIGHT, // sHeight    
    // ---- Drawing ----    
    0, // dx    
    0, // dy    
    MARIO_WIDTH * 2, // dWidth    
    MARIO_HEIGHT * 1.5 // dHeight  ); ...
     */
  });
  worldCanvasCtx.restore();
}
function animate() {
  traffic = traffic
    .filter((item) => item.y < window.innerHeight - delta)
    .map((item) => ({ ...item, y: item.y + 2 }));
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

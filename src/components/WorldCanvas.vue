<script setup lang="ts">
import { useInputsStore } from "@/stores/inputs";
import { onMounted, ref } from "vue";
import { useWorldCanvas } from "@/world/useWorldCanvas";
import Line from "@/world/Line";
let worldCanvas: HTMLCanvasElement;
let worldCanvasCtx: CanvasRenderingContext2D;

const sources = ["https://mdn.mozillademos.org/files/5397/rhino.jpg"];
let traffic = sources.map((pic) => {
  const img = new Image(100, 100);
  img.src = pic;
  return img;
});

onMounted(() => {
  animate();
});

function animate() {
  worldCanvas = document.getElementById("worldCanvas") as HTMLCanvasElement;
  worldCanvasCtx = worldCanvas.getContext("2d") as CanvasRenderingContext2D;

  worldCanvasCtx.save();
  worldCanvasCtx.translate(0, -100 + worldCanvas.height * 0.7);
  let line = new Line(worldCanvas.width / 2, worldCanvas.width * 0.9);
  line.draw(worldCanvasCtx);

  // for (let i = 0; i < traffic.length; i++) {
  //   traffic[i].draw(carCtx, "red");
  // }
  // car.draw(carCtx, "blue");
  traffic.forEach((img) => {
    worldCanvasCtx.drawImage(img, 0, 0);
  });
  worldCanvasCtx.restore();

  requestAnimationFrame(animate);
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
  width: 600px;
  height: calc(100vh - var(--header-height));
}
</style>

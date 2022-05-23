import { ref } from "vue";
import Line from "@/world/Line";

export function useWorldCanvas() {
  const worldCanvas = ref<HTMLCanvasElement>();
  const worldCanvasCtx = worldCanvas.value?.getContext("2d");

  //   if (!worldCanvas.value) {
  //     console.error("No canvas here!");
  //     return null;
  //   }
  let line: Line;
  if (worldCanvas.value) {
    line = new Line(worldCanvas.value.width / 2, worldCanvas.value.width * 0.9);
  }

  const sources = ["https://mdn.mozillademos.org/files/5397/rhino.jpg"];
  const traffic = sources.map((pic) => {
    const img = new Image(60, 45);
    img.src = pic;
    return img;
  });

  function animate() {
    if (!worldCanvas.value || !worldCanvasCtx) {
      console.error("No canvas here!");
      return null;
    }
    // for (let i = 0; i < traffic.length; i++) {
    //   traffic[i].update(road.borders, []);
    // }

    worldCanvasCtx.save();
    //worldCanvasCtx.translate(0, -car.y + worldCanvas.value.height * 0.7);

    if (line) {
      line.draw(worldCanvasCtx);
    }

    // for (let i = 0; i < traffic.length; i++) {
    //   traffic[i].draw(carCtx, "red");
    // }
    // car.draw(carCtx, "blue");
    traffic.forEach((img) => {
      worldCanvasCtx.drawImage(img, 0, 0);
    });
    worldCanvasCtx.restore();

    window.requestAnimationFrame(animate);
  }

  return {
    worldCanvas,
    animate,
  };
}

import { useInputsStore } from "./inputs";
import { defineStore } from "pinia";
import type { ItemType, IItem } from "@/types/itemTypes";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { genImgPath, getImgItem } from "@/utils/utils";
export const useTrafficState = defineStore({
  id: "worldState",
  //сюда пишется текущее состояние
  state: () => ({
    traffic: <IItem[]>[],
  }),

  // экшены нужны для изменения state
  actions: {
    genNewImg() {
      const inputsStore = useInputsStore();
      if (inputsStore.items.length === 0) {
        return;
      }
      const img = new Image();
      img.src = genImgPath(
        inputsStore.items[Math.floor(Math.random() * inputsStore.items.length)]
      );
      console.log(`Generating new image: ${getImgItem(img.src)}`);
      this.traffic.push({
        img,
        item_type: getImgItem(img.src) as ItemType,
        x:
          Math.random() *
          (worldConstants.WORLD_CANVAS_WIDTH -
            img.width * worldConstants.IMG_SCALE_QUOTIENT),
        y: -img.height * worldConstants.IMG_SCALE_QUOTIENT,
      });
    },
    updateTraffic(
      filterPred: (item: IItem) => boolean,
      updateItem: (item: IItem) => IItem
    ) {
      this.traffic = this.traffic.filter(filterPred).map(updateItem);
      //console.log("updated traffic = ", this.traffic);
    },
    drawTraffic(ctx: CanvasRenderingContext2D) {
      this.traffic.forEach((item) => {
        ctx.drawImage(
          item.img,
          0, // sx
          0, // sy
          item.img.width, // sWidth
          item.img.height, // sHeight
          item.x, // dx
          item.y, // dy
          Math.floor(item.img.width * worldConstants.IMG_SCALE_QUOTIENT), // dWidth
          Math.floor(item.img.height * worldConstants.IMG_SCALE_QUOTIENT) // dHeight
        );
      });
    },
  },
});

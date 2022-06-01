import { useInputsState } from "./inputsState";
import { defineStore } from "pinia";
import type { ItemType, IItem } from "@/types/itemTypes";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { genImgPath, getImgItem } from "@/utils/utils";
import { useLineState } from "./lineState";
export const useTrafficState = defineStore({
  id: "trafficState",
  //сюда пишется текущее состояние
  state: () => ({
    //traffic: <IItem[]>[], //equivalents
    traffic: Array<IItem>(),
  }),

  // экшены нужны для изменения state
  actions: {
    genNewImg() {
      const inputsState = useInputsState();
      if (inputsState.data.items.length === 0) {
        return;
      }
      const img = new Image();
      img.src = genImgPath(
        inputsState.data.items[
          Math.floor(Math.random() * inputsState.data.items.length)
        ]
      );
      console.log(`Generating new item: ${getImgItem(img.src)}`);
      const lineState = useLineState();
      const x_left = lineState.line.left;
      const width = lineState.line.width;
      img.onload = () =>
        this.traffic.push({
          img,
          item_type: getImgItem(img.src) as ItemType,
          coordinates: {
            x: Math.floor(
              x_left +
                Math.random() *
                  (width - img.width * worldConstants.IMG_SCALE_QUOTIENT)
            ),
            y: -Math.floor(img.height * worldConstants.IMG_SCALE_QUOTIENT),
          },
          holdedBy: undefined,
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
      this.traffic.forEach((item) =>
        ctx.drawImage(
          item.img,
          0, // sx
          0, // sy
          item.img.width, // sWidth
          item.img.height, // sHeight
          item.coordinates.x, // dx
          item.coordinates.y, // dy
          Math.floor(item.img.width * worldConstants.IMG_SCALE_QUOTIENT), // dWidth
          Math.floor(item.img.height * worldConstants.IMG_SCALE_QUOTIENT) // dHeight
        )
      );
    },
  },
});

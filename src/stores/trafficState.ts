import { useInputsState } from "./inputsState";
import { defineStore } from "pinia";
import type { ItemType, IItem } from "@/types/itemTypes";
import { genImgPath, getImgItem } from "@/utils/utils";
import { useLineState } from "./lineState";
import { drawConstants } from "@/stupidConstants/drawConstants";
import { hri } from "human-readable-ids";
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
      const id = hri.random();
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
          id,
          img,
          item_type: getImgItem(img.src) as ItemType,
          coordinates: {
            x: Math.floor(
              x_left +
                Math.random() *
                  (width -
                    img.width * drawConstants.ITEM_SETTINGS.IMG_SCALE_QUOTIENT)
            ),
            y: -Math.floor(
              img.height * drawConstants.ITEM_SETTINGS.IMG_SCALE_QUOTIENT
            ),
          },
          holdedBy: "", //undefined,
        });
    },
    // removeSingleItem(itemId: string) {
    //   this.traffic = this.traffic.filter((item) => !(item.id === itemId));
    // },
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

          !!item.holdedBy
            ? item.coordinates.x - item.img.width * 0.5
            : item.coordinates.x,
          !!item.holdedBy
            ? item.coordinates.y - item.img.height * 0.5
            : item.coordinates.y,
          Math.floor(
            item.img.width * drawConstants.ITEM_SETTINGS.IMG_SCALE_QUOTIENT
          ), // dWidth
          Math.floor(
            item.img.height * drawConstants.ITEM_SETTINGS.IMG_SCALE_QUOTIENT
          ) // dHeight
        )
      );
    },
  },
});

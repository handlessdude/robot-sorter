import { worldConstants } from "@/stupidConstants/worldConstants";
import type { ItemType } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import { hri } from "human-readable-ids";
import { genImgPath, getImgItem } from "@/utils/utils";

export class Bin {
  readonly id: string;
  coordinates: IPoint;
  itemsPlaced: number;
  readonly itemType: ItemType;
  readonly img: HTMLImageElement;
  readonly width: number;
  readonly height: number;
  color: string;
  strokeColor: string;
  private constructor(
    coordinates: IPoint,
    itemType: ItemType,
    img: HTMLImageElement,
    itemsPlaced = 0,
    width = 50,
    height = 100,
    color = worldConstants.BIN_COLORS.FILL_COLOR,
    strokeColor = worldConstants.BIN_COLORS.STROKE_COLOR
  ) {
    this.id = hri.random();
    this.coordinates = coordinates;
    this.itemType = itemType;
    this.img = img;
    this.itemsPlaced = itemsPlaced;
    this.width = width;
    this.height = height;
    this.color = color;
    this.strokeColor = strokeColor;
  }
  /*на какие же жертвы приходится идти*/
  static async initialize(
    coordinates: IPoint,
    itemType: ItemType,
    itemsPlaced = 0,
    width = 50,
    height = 100,
    color = worldConstants.BIN_COLORS.FILL_COLOR,
    strokeColor = worldConstants.BIN_COLORS.STROKE_COLOR
  ): Promise<Bin> {
    const binPromise = new Promise<Bin>((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve(
          new Bin(
            coordinates,
            itemType,
            img,
            itemsPlaced,
            width,
            height,
            color,
            strokeColor
          )
        );
      img.onerror = reject;
      img.src = genImgPath(itemType);
    });

    return binPromise;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.strokeColor;
    ctx.setLineDash([]);

    const binRect = new Path2D();
    binRect.rect(
      this.coordinates.x,
      this.coordinates.y,
      this.width,
      this.height
    );

    ctx.fill(binRect);
    ctx.stroke(binRect);

    ctx.drawImage(
      this.img,
      0, // sx
      0, // sy
      this.img.width, // sWidth
      this.img.height, // sHeight
      Math.floor(
        this.coordinates.x +
          this.width / 2 -
          (this.img.width * worldConstants.BIN_IMG_SCALE) / 2
      ), //dx
      Math.floor(
        this.coordinates.y +
          this.height / 2 -
          (this.img.height * worldConstants.BIN_IMG_SCALE) / 2
      ), // dy
      Math.floor(this.img.width * worldConstants.BIN_IMG_SCALE), // dWidth
      Math.floor(this.img.height * worldConstants.BIN_IMG_SCALE) // dHeight
    );

    //}
  }
}

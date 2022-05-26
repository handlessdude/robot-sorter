import { worldConstants } from "@/stupidConstants/worldConstants";
import type { ItemType } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
export class Bin {
  coordinates: IPoint;
  itemsPlaced: number;
  readonly itemType: ItemType;
  readonly width: number;
  readonly height: number;
  color: string;
  strokeColor: string;
  constructor(
    coordinates: IPoint,
    itemType: ItemType,
    itemsPlaced = 0,
    width = 50,
    height = 100,
    color = worldConstants.BIN_COLORS.FILL_COLOR,
    strokeColor = worldConstants.BIN_COLORS.STROKE_COLOR
  ) {
    this.coordinates = coordinates;
    this.itemType = itemType;
    this.itemsPlaced = itemsPlaced;
    this.width = width;
    this.height = height;
    this.color = color;
    this.strokeColor = strokeColor;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.strokeColor;

    const binRect = new Path2D();
    binRect.rect(
      this.coordinates.x,
      this.coordinates.y,
      this.width,
      this.height
    );

    ctx.fill(binRect);
    ctx.stroke(binRect);
  }
}

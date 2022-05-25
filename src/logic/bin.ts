import type { ItemType } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
export class Bin {
  coordinates: IPoint;
  itemsPlaced: number;
  readonly itemType: ItemType;
  readonly width: number;
  readonly height: number;
  color: string;

  constructor(
    coordinates: IPoint,
    itemType: ItemType,
    itemsPlaced = 0,
    width = 50,
    height = 100,
    color = "#5AAA66"
  ) {
    this.coordinates = coordinates;
    this.itemType = itemType;
    this.itemsPlaced = itemsPlaced;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.coordinates.x,
      this.coordinates.y,
      this.width,
      this.height
    );
  }
}

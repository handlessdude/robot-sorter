import type { ItemType } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
export class Bin {
  coordinates: IPoint;
  readonly itemType: ItemType;
  itemsPlaced: number;

  constructor(coordinates: IPoint, itemType: ItemType, itemsPlaced = 0) {
    this.coordinates = coordinates;
    this.itemType = itemType;
    this.itemsPlaced = itemsPlaced;
  }
}

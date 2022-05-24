import type { IPoint } from "./point";
import type { ItemType } from "./itemTypes";

export interface IBin {
  coordinates: IPoint;
  itemType: ItemType;
}

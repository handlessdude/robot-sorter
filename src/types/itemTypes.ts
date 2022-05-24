import type { IPoint } from "./point";

export enum ItemTypes {
  APPLE = "apple",
  BANANA = "banana",
  BOTTLE = "bottle",
  CAKE = "cake",

  CLOCK = "clock",
  CUP = "cup",
  DONUT = "donut",
  PIZZA = "pizza",
}
export type ItemType = keyof typeof ItemTypes;

export interface IItem {
  img: HTMLImageElement;
  item_type: ItemType;
  coordinates: IPoint;
  holded: boolean;
}

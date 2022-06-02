import type { IPoint } from "./point";
import type { Manipulator } from "@/logic/manipulator";

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
  id: string;
  img: HTMLImageElement;
  item_type: ItemType;
  coordinates: IPoint;
  holdedBy: string; //Manipulator | undefined; // используется ли манипулятором
}

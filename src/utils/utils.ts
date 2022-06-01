import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import { worldConstants } from "@/stupidConstants/worldConstants";

export function lerp(A: number, B: number, t: number) {
  return A + (B - A) * t;
}
export function getImgItem(imgPath: string) {
  return imgPath.split("/").slice(-1)[0].split(".")[0];
}

export function genImgPath(imgItem: string) {
  return `src/assets/img/${imgItem}.png`;
}

export function distance(a: IPoint, b: IPoint): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function isNotEmpty(arr: Array<any>) {
  return arr.length > 0;
}

export function isGreaterThan(num: number, threshold: number) {
  return num > threshold;
}

export function isPositive(num: number) {
  return isGreaterThan(num, 0);
}

export function isOnTraffic(coordinates: IPoint): boolean {
  return (
    coordinates.x >= worldConstants.ITEM_WIDTH &&
    coordinates.x <= worldConstants.LINE_WIDTH - worldConstants.ITEM_WIDTH
  );
}

export function getMovedPoint(
  point: IPoint,
  radius: number,
  angle: number
): IPoint {
  return {
    x: radius * Math.cos(angle) + point.x,
    y: radius * Math.sin(angle) + point.y,
  };
}

export function toStandartRadianForm(angle: number): number {
  angle = angle % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

export function getItemCenter(item: IItem): IPoint {
  return {
    x: Math.floor(item.coordinates.x + item.img.width * 0.5),
    y: Math.floor(item.coordinates.y + item.img.height * 0.5),
  };
}

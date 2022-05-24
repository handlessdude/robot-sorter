import type { IPoint } from "@/types/point";

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

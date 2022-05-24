export function lerp(A: number, B: number, t: number) {
  return A + (B - A) * t;
}
export function getImgItem(imgPath: string) {
  return imgPath.split("/").slice(-1)[0].split(".")[0];
}

export function genImgPath(imgItem: string) {
  return `src/assets/img/${imgItem}.png`;
}

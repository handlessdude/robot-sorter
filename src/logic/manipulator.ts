import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import type { Bin } from "@/logic/bin";
import { distance } from "@/utils/utils";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { hri } from "human-readable-ids";
export class Manipulator {
  readonly id: string;
  readonly radius: number;
  readonly coordinates: IPoint;
  readonly size_radius: number;
  color: string;
  strokeColor: string;
  bins: Array<Bin>;
  _currentBearingAngle: number;
  _currentDrivePlace: number;
  holdedItem?: IItem;

  set currentBearingAngle(value: number) {
    if (value >= 0 && value <= 2 * Math.PI) this._currentBearingAngle = value;
    else console.warn("The angle is in [0; 2PI]");
  }

  set currentDrivePlace(value: number) {
    if (value >= 0 && value <= 1) this._currentDrivePlace = value;
    else console.warn("The angle is in [0; 1]");
  }

  constructor(
    radius: number,
    coordinates: IPoint,
    size_radius = 25,
    color = worldConstants.MANIP_COLORS.FILL_COLOR,
    strokeColor = worldConstants.MANIP_COLORS.STROKE_COLOR
  ) {
    this.id = hri.random();
    this.radius = radius;
    this.coordinates = coordinates;
    this.bins = <Bin[]>[];
    this._currentBearingAngle = 0;
    this._currentDrivePlace = 0;
    this.holdedItem = undefined;
    this.size_radius = size_radius;
    this.color = color;
    this.strokeColor = strokeColor;
  }

  findBins(bins: Array<Bin>): void {
    //манипуляторам придётся самим найти свои урны
    // for (const bin of inputState.$state.data.bins) {
    //   if (distance(bin.coordinates, this.coordinates) <= this.radius) {
    //     this.bins.push(bin);
    //   }
    // }
    for (const bin of bins) {
      if (distance(bin.coordinates, this.coordinates) <= this.radius) {
        this.bins.push(bin);
      }
    }
  }

  tryTakeItem(item: IItem): void | boolean {
    if (
      distance(item.coordinates, this.coordinates) <=
        worldConstants.GRAB_DISTANCE &&
      this.holdedItem == undefined &&
      item.holdedBy == undefined
    ) {
      this.holdedItem = item;
      item.holdedBy = this;
      return true;
    } else {
      return false;
    }
  }

  throwItem(): void {
    if (this.holdedItem == undefined) return;

    this.holdedItem.holdedBy = undefined;
    // BINS MUST BE SPLITTED
    for (const bin of this.bins) {
      if (
        distance(bin.coordinates, this.holdedItem!.coordinates) <=
        worldConstants.GRAB_DISTANCE
      ) {
        if (bin.itemType == this.holdedItem!.item_type) {
          bin.itemsPlaced++;
          // TODO ! delete this.holdedItem
          this.holdedItem = undefined;
        }
      }
    }
  }

  rotateBearing(radians: number): void {
    // Повернуть подшипник таким образом, чтобы радианы совпадали с указанными
  }

  bearingRotating(radians: number): number {
    // Возвращает время, необходимое для выполнения
    return 0;
  }

  moveDrive(place: number): void {
    // Передвинуть привод таким образом, чтобы местно совпадало с указанным
  }

  driveMoving(place: number): number {
    // Возвращает время, необходимое для выполнения
    return 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.strokeColor;

    const circle = new Path2D();
    circle.arc(
      this.coordinates.x,
      this.coordinates.y,
      this.size_radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

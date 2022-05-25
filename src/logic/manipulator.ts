import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import type { Bin } from "@/logic/bin";
import { distance } from "@/utils/utils";
import { worldConstants } from "@/stupidConstants/worldConstants";

export class Manipulator {
  readonly id: number;
  readonly radius: number;
  readonly coordinates: IPoint;
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

  constructor(id: number, radius: number, coordinates: IPoint) {
    this.id = id;
    this.radius = radius;
    this.coordinates = coordinates;
    this.bins = <Bin[]>[];
    this._currentBearingAngle = 0;
    this._currentDrivePlace = 0;
    this.holdedItem = undefined;
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
}

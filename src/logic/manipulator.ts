import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import type { Bin } from "@/logic/bin";
import {
  distance,
  isOnTraffic,
  getMovedPoint,
  toStandartRadianForm,
} from "@/utils/utils";
import { worldConstants } from "@/stupidConstants/worldConstants";
import { hri } from "human-readable-ids";

const WPI = 2 * Math.PI;

export class Manipulator {
  readonly id: string;
  readonly radius: number;
  readonly coordinates: IPoint;
  bins: Array<Bin>;
  _currentBearingAngle: number;
  _currentDrivePlaceScale: number;
  holdedItem?: IItem;

  bearingTarget?: number;
  driveTarget?: number;

  // shiza
  readonly size_radius: number;
  color: string;
  strokeColor: string;

  set currentBearingAngle(value: number) {
    if (value >= 0 && value <= 2 * Math.PI) this._currentBearingAngle = value;
    else console.warn("The angle is in [0; 2PI]");
  }

  set currentDrivePlaceScale(value: number) {
    if (value >= 0 && value <= 1) this._currentDrivePlaceScale = value;
    else console.warn("The drive scale is in [0; 1]");
  }

  constructor(
    radius: number,
    coordinates: IPoint,

    // shiza
    size_radius = 25,
    color = worldConstants.MANIP_COLORS.FILL_COLOR,
    strokeColor = worldConstants.MANIP_COLORS.STROKE_COLOR
  ) {
    this.id = hri.random();
    this.radius = radius;
    this.coordinates = coordinates;
    this.bins = <Bin[]>[];
    this._currentBearingAngle = Math.PI;
    this._currentDrivePlaceScale = 0.5;
    this.holdedItem = undefined;

    this.bearingTarget = undefined;
    this.driveTarget = undefined;

    // shiza
    this.size_radius = size_radius;
    this.color = color;
    this.strokeColor = strokeColor;
  }

  getDriveCoordinates(): IPoint {
    return getMovedPoint(
      this.coordinates,
      this.radius * this.currentDrivePlaceScale,
      this.currentBearingAngle
    );
  }

  findBins(bins: Array<Bin>): void {
    //манипуляторам придётся самим найти свои урны
    this.bins = <Bin[]>[];
    // bins: inputState.$state.data.bins
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

  tryThrowItem(): void | boolean {
    if (this.holdedItem == undefined) return false;

    this.holdedItem.holdedBy = undefined;
    // BINS MUST BE SPLITTED
    for (const bin of this.bins) {
      if (
        distance(bin.coordinates, this.holdedItem.coordinates) <=
        worldConstants.THROWING_DISTANCE
      ) {
        if (bin.itemType == this.holdedItem.item_type) {
          bin.itemsPlaced++;
          // TODO ! delete this.holdedItem
          this.holdedItem = undefined;
          return true;
        }
      }
    }

    if (isOnTraffic(this.getDriveCoordinates())) {
      this.holdedItem.holdedBy = undefined;
      this.holdedItem = undefined;
    }

    return false;
  }

  // Поставить задачу поворота подшипника таким образом, чтобы радианы совпадали с указанными
  ST_rotateBearing(radians: number): void {
    this.bearingTarget = toStandartRadianForm(radians);
  }

  // Возвращает время, необходимое для выполнения
  bearingRotatingTime(radians: number, bearingVelocity: number): number {
    return (
      Math.abs(this.currentBearingAngle - toStandartRadianForm(radians)) /
      bearingVelocity
    );
  }

  // повернуть подшипник
  rotateBearing(bearingVelocity: number): void {
    if (this.bearingTarget == undefined) return;

    let a = this.currentBearingAngle;
    let b = this.bearingTarget;
    let toUp = true;
    if (a > b) {
      [a, b] = [b, a];
      toUp = false;
    }
    if (Math.abs(b - a) < Math.abs(a + WPI - b)) {
      if (toUp) {
        if (bearingVelocity > this.bearingTarget - this.currentBearingAngle)
          this.currentBearingAngle += bearingVelocity;
        else {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        }
      } else {
        if (bearingVelocity > this.currentBearingAngle - this.bearingTarget)
          this.currentBearingAngle -= bearingVelocity;
        else {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        }
      }
    }
  }

  // Поставить задачу передвижения привода таким образом, чтобы местно совпадало с указанным
  ST_moveDrive(placeScale: number): void {
    if (placeScale < 0 || placeScale > 1) return;
    this.driveTarget = placeScale;
  }

  // Возвращает время, необходимое для выполнения
  driveMovingTime(placeScale: number, driveVelocity: number): number {
    if (placeScale < 0 || placeScale > 1) return -1;
    return (
      (this.radius * Math.abs(this.currentDrivePlaceScale - placeScale)) /
      driveVelocity
    );
  }

  // передвинуть привод
  moveDrive(driveVelocity: number): void {
    if (this.driveTarget == undefined) return;

    if (this.currentDrivePlaceScale < this.driveTarget) {
      if (this.driveTarget - this.currentDrivePlaceScale < driveVelocity)
        this.currentDrivePlaceScale += driveVelocity;
      else {
        this.currentDrivePlaceScale = this.driveTarget;
        this.driveTarget = undefined;
      }
    } else {
      if (this.currentDrivePlaceScale - this.driveTarget < driveVelocity)
        this.currentDrivePlaceScale -= driveVelocity;
      else {
        this.currentDrivePlaceScale = this.driveTarget;
        this.driveTarget = undefined;
      }
    }
  }

  // получить все предметы в радиусе
  getItemsInRadius(items: Array<IItem>): Array<IItem> {
    return items.filter(
      (item: IItem) =>
        distance(item.coordinates, this.coordinates) <= this.radius
    );
  }

  lastTime(item: IItem, lineVelocity: number): number {
    //сначала получим координаты пересечения окружности манипа и движения предмета
    // item должен быть в радиусе
    const y =
      Math.max(
        Math.sqrt(
          this.radius - Math.pow(item.coordinates.x - this.coordinates.x, 2)
        ),
        -Math.sqrt(
          this.radius - Math.pow(item.coordinates.x - this.coordinates.x, 2)
        )
      ) + this.coordinates.y;
    //непонятно как корень работает
    //+ система с (0, 0) в левом верхнем углу, поэтому max

    //Теперь высчитываем время
    return (y - item.coordinates.y) / lineVelocity;
  }

  ST_moveToPoint(coordinates: IPoint): void {
    this.ST_moveDrive(this.radius / distance(coordinates, this.coordinates));

    let angle = 0;
    // невозможное условие, однако
    // если манип с предметом на одной вертикали
    if (coordinates.x == this.coordinates.x) {
      // и предмет выше основания манипа
      if (coordinates.y < this.coordinates.y) angle = Math.PI / 2;
      // или ниже
      else if (coordinates.y > this.coordinates.y) angle = Math.PI * 1.5;
      // или ровно в основании манипа
      else {
        this.bearingTarget = undefined;
        return;
      }
      // на одной горизонтали
    } else if (coordinates.y == this.coordinates.y) {
      // и предмет правее манипа
      if (coordinates.x > this.coordinates.x) angle = 0;
      // или левее
      else if (coordinates.x < this.coordinates.x) angle = Math.PI;
    } else {
      const atanValue = Math.atan(
        (coordinates.y - this.coordinates.y) /
          (coordinates.x - this.coordinates.x)
      );
      if (coordinates.x < this.coordinates.x) {
        angle = Math.PI + atanValue;
      } else {
        angle = atanValue;
      }
    }

    this.ST_rotateBearing(angle);
  }

  //func(item: IItem): void | boolean {}

  // Запускать в каждом кадре для изменения параметров
  update(bearingVelocity: number, driveVelocity: number): void {
    // thinking
    //TODO:
    // choosing an action
    //TODO:
    // moving
    this.rotateBearing(bearingVelocity);
    this.moveDrive(driveVelocity);
    // acting
    //TODO:
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

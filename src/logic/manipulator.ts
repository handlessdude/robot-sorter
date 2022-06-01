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
import { drawConstants } from "@/stupidConstants/drawConstants";

const WPI = 2 * Math.PI;

export class Manipulator {
  readonly id: string;
  readonly radius: number;
  readonly coordinates: IPoint;
  bins: Array<Bin>;
  inBoundItems: Array<IItem>;
  _currentBearingAngle: number;
  _currentDrivePlaceScale: number;
  holdedItem?: IItem;

  bearingTarget?: number;
  driveTarget?: number;

  taskList: Array<Function>;
  isActiveTask: boolean;
  isNecessaryRecalc: boolean;

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
    this.radius = 350; //radius;
    this.coordinates = coordinates;
    this.bins = <Bin[]>[];
    this.inBoundItems = <IItem[]>[];
    this._currentBearingAngle = Math.PI;
    this._currentDrivePlaceScale = 0.5;
    this.holdedItem = undefined;

    this.bearingTarget = undefined;
    this.driveTarget = undefined;

    this.taskList = Array<Function>();
    this.isActiveTask = false;
    this.isNecessaryRecalc = false;

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
  bearingRotatingTime(
    radians: number,
    bearingVelocity: number,
    startAngle = this.currentBearingAngle
  ): number {
    return (
      Math.abs(startAngle - toStandartRadianForm(radians)) / bearingVelocity
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
  driveMovingTime(
    placeScale: number,
    driveVelocity: number,
    startPlaceScale = this.currentDrivePlaceScale
  ): number {
    if (placeScale < 0 || placeScale > 1) return -1;
    return (
      (this.radius * Math.abs(startPlaceScale - placeScale)) / driveVelocity
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

  // осталось времени до пересечения с кругом
  itemTimeCoordsLeft(
    item: IItem,
    lineVelocity: number
  ): { time: number; coordinates: IPoint } {
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
    return {
      time: (y - item.coordinates.y) / lineVelocity,
      coordinates: { x: item.coordinates.x, y },
    };
  }

  // поставить задачу движения до точки
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
    this.isActiveTask = true;
  }

  // возвращает время, необходимое манипулятору для достижения точки
  movingToPointTime(
    coordinates: IPoint,
    driveVelocity: number,
    bearingVelocity: number,
    startCoordinates = this.coordinates,
    startDrivePlaceScale = this.currentDrivePlaceScale,
    startAngle = this.currentBearingAngle
  ): number {
    const driveTime = this.driveMovingTime(
      this.radius / distance(coordinates, startCoordinates),
      driveVelocity,
      startDrivePlaceScale
    );

    let angle = 0;
    // невозможное условие, однако
    // если манип с предметом на одной вертикали
    if (coordinates.x == startCoordinates.x) {
      // и предмет выше основания манипа
      if (coordinates.y < startCoordinates.y) angle = Math.PI / 2;
      // или ниже
      else if (coordinates.y > startCoordinates.y) angle = Math.PI * 1.5;
      // или ровно в основании манипа
      else {
        angle = startAngle;
      }
      // на одной горизонтали
    } else if (coordinates.y == startCoordinates.y) {
      // и предмет правее манипа
      if (coordinates.x > startCoordinates.x) angle = 0;
      // или левее
      else if (coordinates.x < startCoordinates.x) angle = Math.PI;
    } else {
      const atanValue = Math.atan(
        (coordinates.y - startCoordinates.y) /
          (coordinates.x - startCoordinates.x)
      );
      if (coordinates.x < startCoordinates.x) {
        angle = Math.PI + atanValue;
      } else {
        angle = atanValue;
      }
    }

    const bearingTime = this.bearingRotatingTime(
      angle,
      bearingVelocity,
      startAngle
    );
    return Math.max(driveTime, bearingTime);
  }

  // Добавляет в свой массив новые предметы и возвращает true, если появились новые предметы
  updateItemsInBound(worldItems: Array<IItem>): boolean {
    let flag = false;
    for (const i of worldItems) {
      if (this.inBoundItems.find((e) => e != i)) flag = true;
      this.inBoundItems.push(i);
    }
    return flag;
  }

  itemBelongs(item: IItem): Bin | undefined {
    return this.bins.find((e) => e.itemType == item.item_type);
  }

  // Время до предмета [от заданной точки] + координаты
  timeCoordsToItem(
    item: IItem,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number,
    startCoordinates = this.coordinates,
    startDrivePlaceScale = this.currentDrivePlaceScale,
    startAngle = this.currentBearingAngle
  ): { time: number; coordinates: IPoint } {
    const step = 1;
    const tc = this.itemTimeCoordsLeft(item, lineVelocity);
    const lastTime = this.movingToPointTime(
      { x: item.coordinates.x, y: tc.coords.y },
      driveVelocity,
      bearingVelocity,
      startCoordinates,
      startDrivePlaceScale,
      startAngle
    );
    if (lastTime > tc.time) {
      return { time: -1, coordinates: { x: 0, y: 0 } };
    }
    for (let sy = item.coordinates.y; sy < tc.coordinates.y; sy += step) {
      const time = this.movingToPointTime(
        { x: item.coordinates.x, y: sy },
        driveVelocity,
        bearingVelocity,
        startCoordinates,
        startDrivePlaceScale,
        startAngle
      );
      if (time <= tc.time) {
        return { time: time, coordinates: { x: item.coordinates.x, y: sy } };
      }
    }
    return {
      time: lastTime,
      coordinates: { x: tc.coordinates.x, y: tc.coordinates.y },
    };
  }

  ST_deliverItem(
    item: IItem,
    venue: IPoint,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number
  ): void {
    //
    this.ST_moveToPoint(venue);
    this.taskList.push(
      () => {
        if (!this.driveTarget && !this.bearingTarget) this.isActiveTask = false;
      },
      () => this.tryTakeItem(item),
      () => {
        if (!this.holdedItem) {
          this.taskList = Array<Function>();
          this.isNecessaryRecalc = true;
        }
      },
      () =>
        this.ST_moveToPoint(
          this.bins.find((e) => e.itemType == item.item_type)!.coordinates
        ),
      () => {
        if (!this.driveTarget && !this.bearingTarget) this.isActiveTask = false;
      },
      () => {
        if (!this.tryThrowItem()) {
          //an impossible way
        }
      }
    );
  }

  think(
    worldItems: Array<IItem>,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number
  ): void {
    if (this.updateItemsInBound(worldItems) || this.isNecessaryRecalc) {
      //rethink
      this.isNecessaryRecalc = false;
      const temparr = this.inBoundItems
        .filter((e) => this.itemBelongs(e))
        .map((e) => ({
          ...this.timeCoordsToItem(
            e,
            lineVelocity,
            driveVelocity,
            bearingVelocity
          ),
          item: e,
        }));

      if (temparr.length == 0) {
        //SET A TASK
      } else {
        const choosedItem = temparr.reduce((_prev, _curr) => {
          if (_curr.time < _prev.time) return _curr;
          else return _prev;
        }, temparr[0]);

        this.ST_deliverItem(
          choosedItem.item,
          choosedItem.coordinates,
          lineVelocity,
          driveVelocity,
          bearingVelocity
        );
      }
    } else {
      // update states due to the task list
      if (this.taskList.length > 0) {
        if (!this.isActiveTask) this.taskList.shift()!();
        else this.taskList[0]();
      }
    }
  }

  // Запускать в каждом кадре для изменения параметров
  update(
    worldItems: Array<IItem>,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number
  ): void {
    // thinking
    this.think(worldItems, lineVelocity, driveVelocity, bearingVelocity);
    // choosing an action
    //TODO:
    // moving
    this.rotateBearing(bearingVelocity);
    this.moveDrive(driveVelocity);
    // acting
    //TODO:
  }

  draw(ctx: CanvasRenderingContext2D) {
    //draw manipulator base (BASED)
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

    //calculate and draw manipulator crane (CRANED)
    const x0_crane = this.radius;
    const y0_crane = 0;
    let x_crane =
      Math.cos(this._currentBearingAngle) * x0_crane -
      Math.sin(this._currentBearingAngle) * y0_crane;
    let y_crane =
      -Math.sin(this._currentBearingAngle) * x0_crane -
      Math.cos(this._currentBearingAngle) * y0_crane;
    x_crane += this.coordinates.x;
    y_crane += this.coordinates.y;
    ctx.beginPath();
    ctx.moveTo(this.coordinates.x, this.coordinates.y);
    ctx.lineTo(x_crane, y_crane);
    ctx.lineWidth = drawConstants.CRANE_PARAMS.LINE_WIDTH;
    ctx.strokeStyle = drawConstants.CRANE_PARAMS.STROKE_COLOR;
    ctx.stroke();

    //calculate and draw manipulator drive (RAYAN GOSLING)
    const x0_drive = x0_crane * this._currentDrivePlaceScale;
    const y0_drive = 0;
    let x_drive =
      Math.cos(this._currentBearingAngle) * x0_drive -
      Math.sin(this._currentBearingAngle) * y0_drive;
    let y_drive =
      -Math.sin(this._currentBearingAngle) * x0_drive -
      Math.cos(this._currentBearingAngle) * y0_drive;
    x_drive += this.coordinates.x;
    y_drive += this.coordinates.y;
    ctx.fillStyle = drawConstants.DRIVE_PARAMS.FILL_COLOR;
    ctx.lineWidth = drawConstants.DRIVE_PARAMS.LINE_WIDTH;
    ctx.strokeStyle = drawConstants.DRIVE_PARAMS.STROKE_COLOR;
    const drive = new Path2D();
    drive.arc(
      x_drive,
      y_drive,
      drawConstants.DRIVE_PARAMS.RADIUS,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill(drive);
    ctx.stroke(drive);
  }
}

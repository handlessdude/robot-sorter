import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import type { Bin } from "@/logic/bin";
import { useTrafficState } from "@/stores/trafficState";
import {
  distance,
  isOnTraffic,
  getMovedPoint,
  toStandartRadianForm,
  getItemCenter,
  xInRange,
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
  isAdditionalActions: boolean;
  // shiza
  readonly size_radius: number;
  color: string;
  strokeColor: string;

  set currentBearingAngle(value: number) {
    this._currentBearingAngle = toStandartRadianForm(value);
  }

  get currentBearingAngle() {
    return this._currentBearingAngle;
  }

  set currentDrivePlaceScale(value: number) {
    if (value >= 0 && value <= 1) this._currentDrivePlaceScale = value;
    else console.warn("The drive scale is in [0; 1]");
  }

  get currentDrivePlaceScale() {
    return this._currentDrivePlaceScale;
  }

  constructor(
    radius: number,
    coordinates: IPoint,

    // shiza
    size_radius = 25,
    color = drawConstants.MANIP_SETTINGS.MANIP_COLORS.FILL_COLOR,
    strokeColor = drawConstants.MANIP_SETTINGS.MANIP_COLORS.STROKE_COLOR
  ) {
    this.id = hri.random();
    this.radius = radius; //radius;
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
    this.isAdditionalActions = false;
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
      if (distance(bin.centerCoordinates, this.coordinates) <= this.radius) {
        this.bins.push(bin);
      }
    }
  }

  tryTakeItem(item: IItem): void | boolean {
    console.table({
      d:
        distance(getItemCenter(item), this.getDriveCoordinates()) <=
        worldConstants.GRAB_DISTANCE,
      thisholdeditem: this.holdedItem === undefined,
      itemholdedby: item.holdedBy === "",
    });
    if (
      distance(getItemCenter(item), this.getDriveCoordinates()) <=
        worldConstants.GRAB_DISTANCE &&
      this.holdedItem === undefined &&
      item.holdedBy === "" //undefined
    ) {
      const trafficState = useTrafficState();
      trafficState.traffic = trafficState.traffic.map((item1) =>
        item1.id === item.id ? { ...item, holdedBy: this.id } : item1
      );
      this.holdedItem = { ...item, holdedBy: this.id };
      //console.log(this.holdedItem);
      return true;
    } else {
      return false;
    }
  }

  tryThrowItem(): void | boolean {
    if (this.holdedItem == undefined) {
      return false;
      //console.log(1);
    }

    this.holdedItem.holdedBy = ""; //undefined;
    // BINS MUST BE SPLITTED
    for (const bin of this.bins) {
      if (
        distance(bin.centerCoordinates, this.getDriveCoordinates()) <=
        worldConstants.THROWING_DISTANCE
      ) {
        if (bin.itemType == this.holdedItem.item_type) {
          bin.itemsPlaced++;
          // TODO ! delete this.holdedItem
          //this.inBoundItems.splice(
          //  this.inBoundItems.findIndex((e) => e == this.holdedItem),
          //  1
          //);
          if (!(this.holdedItem === undefined)) {
            const trafficState = useTrafficState();
            trafficState.traffic = trafficState.traffic.filter(
              (item1) => !(item1.id === this.holdedItem?.id)
            );
          }

          this.holdedItem = undefined;

          //console.log(2);
          return true;
        }
      }
    }

    //if (isOnTraffic(this.getDriveCoordinates())) {
    this.holdedItem.holdedBy = ""; //undefined;
    this.holdedItem = undefined;
    //console.log(3);
    //}

    //console.log(4);
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
        if (bearingVelocity > this.bearingTarget - this.currentBearingAngle) {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        } else {
          this.currentBearingAngle += bearingVelocity;
        }
      } else {
        if (bearingVelocity > this.currentBearingAngle - this.bearingTarget) {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        } else {
          this.currentBearingAngle -= bearingVelocity;
        }
      }
    } else {
      if (toUp) {
        if (
          bearingVelocity >
          -this.bearingTarget + this.currentBearingAngle + WPI
        ) {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        } else {
          this.currentBearingAngle -= bearingVelocity;
        }
      } else {
        if (
          bearingVelocity >
          this.bearingTarget - this.currentBearingAngle + WPI
        ) {
          this.currentBearingAngle = this.bearingTarget;
          this.bearingTarget = undefined;
        } else {
          this.currentBearingAngle += bearingVelocity;
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
    return Math.abs(startPlaceScale - placeScale) / driveVelocity;
  }

  // передвинуть привод
  moveDrive(driveVelocity: number): void {
    if (this.driveTarget == undefined) return;

    if (this.currentDrivePlaceScale < this.driveTarget) {
      if (this.driveTarget - this.currentDrivePlaceScale < driveVelocity) {
        this.currentDrivePlaceScale = this.driveTarget;
        this.driveTarget = undefined;
      } else {
        this.currentDrivePlaceScale += driveVelocity;
      }
    } else {
      if (this.currentDrivePlaceScale - this.driveTarget < driveVelocity) {
        this.currentDrivePlaceScale = this.driveTarget;
        this.driveTarget = undefined;
      } else {
        this.currentDrivePlaceScale -= driveVelocity;
      }
    }
  }

  // получить все предметы в радиусе
  getItemsInRadius(items: Array<IItem>): Array<IItem> {
    return items.filter(
      (item: IItem) =>
        distance(getItemCenter(item), this.coordinates) <= this.radius //было
      //distance(getItemCenter(item), this.coordinates) <= this.radius
    );
  }

  // осталось времени до пересечения с кругом
  itemTimeCoordsLeft(
    item: IItem,
    lineVelocity: number
  ): { time: number; coordinates: IPoint } {
    //сначала получим координаты пересечения окружности манипа и движения предмета
    // item должен быть в радиусе
    const coordinates = getItemCenter(item);
    const y =
      Math.max(
        Math.sqrt(
          Math.pow(this.radius, 2) -
            Math.pow(coordinates.x - this.coordinates.x, 2)
        ),
        -Math.sqrt(
          Math.pow(this.radius, 2) -
            Math.pow(coordinates.x - this.coordinates.x, 2)
        )
      ) + this.coordinates.y;
    //непонятно как корень работает
    //+ система с (0, 0) в левом верхнем углу, поэтому max

    //Теперь высчитываем время
    return {
      time: (y - coordinates.y) / lineVelocity,
      coordinates: { x: coordinates.x, y: y },
    };
  }

  // поставить задачу движения до точки
  ST_moveToPoint(coordinates: IPoint): void {
    this.ST_moveDrive(distance(coordinates, this.coordinates) / this.radius);

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
      if (this.coordinates.x < coordinates.x) angle = 0;
      // или левее
      else if (coordinates.x < this.coordinates.x) angle = Math.PI;
    } else {
      const atanValue = Math.atan(
        (coordinates.y - this.coordinates.y) /
          (coordinates.x - this.coordinates.x)
      );
      // предмет левее манипа
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
      distance(coordinates, startCoordinates) / this.radius,
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
    /*
    //было
    const newInBoundItems = Array<IItem>();

    for (const item of worldItems) {
      if (
        //distance(item.coordinates, this.coordinates) <= this.radius
        distance(getItemCenter(item), this.coordinates) <= this.radius
      ) {
        newInBoundItems.push(item);
      }
    }
    //с вашего дозволения поменяю немного код. васхон
    */
    //getItemCenter(item)
    const newInBoundItems = worldItems.filter(
      (item) => distance(getItemCenter(item), this.coordinates) <= this.radius
    );

    let flag = false;
    //newInBoundItems.forEach(
    //  (_curr) =>
    //    (flag ||= this.inBoundItems.find((e) => e == _curr) == undefined)
    //);

    if (this.inBoundItems.length != newInBoundItems.length) flag = true;
    this.inBoundItems = newInBoundItems;

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
    const coordinates = getItemCenter(item);

    /*
    const lastTime = this.movingToPointTime(
      { x: tc.coordinates.x, y: tc.coordinates.y },
      driveVelocity,
      bearingVelocity,
      startCoordinates,
      startDrivePlaceScale,
      startAngle
    );

    console.log(lastTime, tc.time);
    if (lastTime < tc.time) {
      return { time: -1, coordinates: { x: 0, y: 0 } };
    }
    */
    for (let sy = coordinates.y; sy < tc.coordinates.y; sy += step) {
      const time = this.movingToPointTime(
        { x: coordinates.x, y: sy },
        driveVelocity,
        bearingVelocity,
        startCoordinates,
        startDrivePlaceScale,
        startAngle
      );

      const itemTime = (sy - coordinates.y) / lineVelocity;

      if (time <= itemTime) {
        return { time: time, coordinates: { x: coordinates.x, y: sy } };
      }
    }
    return {
      time: -1,
      coordinates: { x: tc.coordinates.x, y: tc.coordinates.y },
    };
  }

  ST_deliverItem(item: IItem, venue: IPoint): void {
    //
    this.taskList.push(
      () => this.ST_moveToPoint(venue),
      () => {
        if (this.driveTarget == undefined && this.bearingTarget == undefined) {
          this.isActiveTask = false;
        }
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
          this.bins.find((e) => e.itemType == item.item_type)!.centerCoordinates
        ),
      () => {
        if (this.driveTarget == undefined && this.bearingTarget == undefined)
          this.isActiveTask = false;
      },
      () => {
        if (!this.tryThrowItem()) {
          //an impossible way
          console.log("impossible");
        }
      }
    );
  }

  ST_deliverAnotherItem(item: IItem, venue: IPoint): void {
    //
    this.isAdditionalActions = true;
    this.taskList.push(
      () => this.ST_moveToPoint(venue),
      () => {
        console.log(1);
        if (this.driveTarget == undefined && this.bearingTarget == undefined) {
          this.isActiveTask = false;
        }
      },
      () => this.tryTakeItem(item),
      () => {
        console.log(2);
        if (!this.holdedItem) {
          this.taskList = Array<Function>();
          this.isNecessaryRecalc = true;
        }
      },
      () => {
        console.log(3);
        this.ST_moveToPoint(
          getMovedPoint(
            this.coordinates,
            this.radius,
            this.coordinates.x > 500 ? Math.PI + 0.3 : -0.3
          )
        );
      },
      () => {
        console.log(4);
        if (this.driveTarget == undefined && this.bearingTarget == undefined)
          this.isActiveTask = false;
      },
      () => {
        console.log(5);
        if (!this.tryThrowItem()) {
          //an impossible way
          console.log("impossible");
        }
      }
    );
  }

  hasLineManip(
    item: IItem,
    manips: Array<Manipulator>
  ): Manipulator | undefined {
    return manips
      .filter((m) => m.itemBelongs(item))
      .find((m) =>
        xInRange(item.coordinates.x, {
          x: m.radius + m.coordinates.x,
          y: -m.radius + m.coordinates.x,
        })
      );
  }

  isIntersectedWith(manip: Manipulator) {
    return (
      xInRange(this.coordinates.x + this.radius, {
        x: manip.coordinates.x + manip.radius,
        y: manip.coordinates.x - manip.radius,
      }) ||
      xInRange(this.coordinates.x - this.radius, {
        x: manip.coordinates.x + manip.radius,
        y: manip.coordinates.x - manip.radius,
      })
    );
  }

  isIntersectedWithLineItemManip(item: IItem, worldManips: Array<Manipulator>) {
    return (
      worldManips
        .filter((m) => m.itemBelongs(item))
        .filter((m) => isIntersectedWith(m)).length > 0
    );
  }

  think(
    worldItems: Array<IItem>,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number,
    worldManips: Array<Manipulator>
  ): void {
    if (this.updateItemsInBound(worldItems) || this.isNecessaryRecalc) {
      //rethink
      this.isNecessaryRecalc = false;
      const temparr = this.inBoundItems
        .filter((e) => !!this.itemBelongs(e))
        .map((e) => ({
          ...this.timeCoordsToItem(
            e,
            lineVelocity,
            driveVelocity,
            bearingVelocity
          ),
          item: e,
        }))
        .filter((e) => e.time >= 0);

      if (temparr.length == 0) {
        //SET A TASK
        const temparr2 = this.inBoundItems
          .filter((e) => this.itemBelongs(e) == undefined)
          .map((e) => ({
            ...this.timeCoordsToItem(
              e,
              lineVelocity,
              driveVelocity,
              bearingVelocity
            ),
            item: e,
          }))
          .filter((e) => e.time >= 0);
        if (temparr2.length != 0) {
          const temparr3 = temparr2.filter((e) => {
            const tempManip = this.hasLineManip(e.item, worldManips);
            return tempManip != undefined && this.isIntersectedWith(tempManip);
          });
          if (temparr3.length != 0) {
            //const tempManip = this.hasLineManip(temparr3[0].item, worldManips);

            if (this.holdedItem == undefined) {
              this.ST_deliverAnotherItem(
                temparr3[0].item,
                temparr3[0].coordinates
              );
            }
          }
        } else {
          this.ST_moveDrive(0.6);
          this.ST_rotateBearing(
            this.coordinates.x > 500 ? Math.PI + 0.3 : -0.3
          );
        }
      } else {
        const choosedItem = temparr.reduce((_prev, _curr) => {
          if (_curr.time < _prev.time) return _curr;
          else return _prev;
        }, temparr[0]);

        if (this.holdedItem == undefined || this.isAdditionalActions) {
          if (this.isAdditionalActions) {
            this.tryThrowItem();
            this.isAdditionalActions = false;
            this.isActiveTask = false;
          }
          this.ST_deliverItem(choosedItem.item, choosedItem.coordinates);
        }
      }
    } else {
      // update states due to the task list
      if (this.taskList.length > 0) {
        do {
          const preIsActive = this.isActiveTask;
          this.taskList[0]();
          if (!preIsActive) this.taskList.shift();
        } while (this.taskList.length > 0 && !this.isActiveTask);
      }
    }
  }

  // Запускать в каждом кадре для изменения параметров
  update(
    worldItems: Array<IItem>,
    lineVelocity: number,
    driveVelocity: number,
    bearingVelocity: number,
    worldManips: Array<Manipulator>
  ): void {
    // thinking
    this.think(
      worldItems,
      lineVelocity,
      driveVelocity,
      bearingVelocity,
      worldManips
    );
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
    ctx.setLineDash([]);
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
    ctx.beginPath();
    ctx.moveTo(this.coordinates.x, this.coordinates.y);
    let p = getMovedPoint(
      this.coordinates,
      this.radius,
      this.currentBearingAngle
    );
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = drawConstants.MANIP_SETTINGS.CRANE_PARAMS.LINE_WIDTH;
    ctx.strokeStyle = drawConstants.MANIP_SETTINGS.CRANE_PARAMS.STROKE_COLOR;
    ctx.stroke();

    //calculate and draw manipulator drive (RAYAN GOSLING)
    ctx.fillStyle = drawConstants.MANIP_SETTINGS.DRIVE_PARAMS.FILL_COLOR;
    ctx.lineWidth = drawConstants.MANIP_SETTINGS.DRIVE_PARAMS.LINE_WIDTH;
    ctx.strokeStyle = drawConstants.MANIP_SETTINGS.DRIVE_PARAMS.STROKE_COLOR;
    const drive = new Path2D();
    p = getMovedPoint(
      this.coordinates,
      this.radius * this._currentDrivePlaceScale,
      this.currentBearingAngle
    );
    drive.arc(
      p.x,
      p.y,
      drawConstants.MANIP_SETTINGS.DRIVE_PARAMS.RADIUS,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill(drive);
    ctx.stroke(drive);
  }

  drawActivityArea(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(46, 255, 156, 0.1)";
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.strokeColor;
    ctx.setLineDash([20, 10]);

    const circle2 = new Path2D();
    circle2.arc(
      this.coordinates.x,
      this.coordinates.y,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill(circle2);
    ctx.stroke(circle2);
  }
}

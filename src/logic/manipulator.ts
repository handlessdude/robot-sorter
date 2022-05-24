import type { IItem } from "@/types/itemTypes";
import type { IPoint } from "@/types/point";
import type { IBin } from "@/types/bin";
import { useTrafficState } from "@/stores/trafficState";
import { useInputsState } from "@/stores/inputsState";
const inputState = useInputsState();

class Manipulator {
  readonly id: number;
  readonly radius: number;
  readonly coordinates: IPoint;
  bins: Array<IBin>;
  _currentBearingAngle: number;
  _currentDrivePlace: number;
  readonly holdedItem?: IItem;

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
    this.bins = <IBin[]>[];
    this._currentBearingAngle = 0;
    this._currentDrivePlace = 0;
    this.holdedItem = undefined;
  }

  findBins(): void {
    // bins here
    // inputState.$state.bins
    //манипуляторам придётся самим найти свои урны
  }

  tryTakeItem(item: IItem): void | boolean {
    // Пытается взять предмет
    // пока хз
  }

  throwItem(): void {
    //
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

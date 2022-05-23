class Manipulator {
  readonly id: number;
  readonly radius: number;
  readonly coordinates: Point;
  bins: Array<Bin>;
  _currentBearingAngle: number;
  _currentDrivePlace: number;
  readonly holdedItem?: Item;

  set currentBearingAngle(value: number) {
    if (value >= 0 && value <= 2 * Math.PI) this._currentBearingAngle = value;
    else console.warn("The angle is in [0; 2PI]");
  }

  set currentDrivePlace(value: number) {
    if (value >= 0 && value <= 1) this._currentDrivePlace = value;
    else console.warn("The angle is in [0; 1]");
  }

  constructor(id: number, radius: number, coordinates: Point) {
    this.id = id;
    this.radius = radius;
    this.coordinates = coordinates;
    this.bins = Array<Bin>();
    this._currentBearingAngle = 0;
    this._currentDrivePlace = 0;
    this.holdedItem = undefined;
  }

  findBins(bins: Array<Bin>): void {
    //манипуляторам придётся самим найти свои урны
  }

  tryTakeItem(item: Item): void | boolean {
    // Пытается взять предмет
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

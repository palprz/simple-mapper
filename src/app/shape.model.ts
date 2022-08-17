export class Shape {
  uuid: string;
  type: string;
  points: number[];
  // TODO offset x, offset y

  constructor(uuid: string, type: string, points: number[]) {
    this.uuid = uuid;
    this.type = type;
    this.points = points;
  }

  public getUUID(): string {
    return this.uuid;
  }

  public getType(): string {
    return this.type;
  }

  public getPoints(): number[] {
    return this.points;
  }
}

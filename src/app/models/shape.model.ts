export class Shape {
  id: string;
  type: string;
  // TODO probably it will be good to store it all as just 'attrs' but without a couple default values
  points: number[];
  offsetX: number;
  offsetY: number;

  constructor(
    id: string,
    type: string,
    points: number[],
    offsetX: number,
    offsetY: number
  ) {
    this.id = id;
    this.type = type;
    this.points = points;
    this.offsetX = offsetX ? offsetX : 0;
    this.offsetY = offsetY ? offsetY : 0;
  }

  public getID(): string {
    return this.id;
  }

  public getType(): string {
    return this.type;
  }

  public getPoints(): number[] {
    return this.points;
  }

  public getOffsetX(): number {
    return this.offsetX;
  }

  public getOffsetY(): number {
    return this.offsetY;
  }
}

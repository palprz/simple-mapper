export class Shape {
  public id: string;
  public type: string;
  public points: number[];
  public fill: any;
  public offsetX: any;
  public offsetY: any;

  constructor(
    id: string,
    type: string,
    points: number[],
    fill: any,
    offsetX: number,
    offsetY: number
  ) {
    this.id = id;
    this.type = type;
    this.points = points;
    this.fill = fill ? fill : undefined;
    this.offsetX = offsetX ? offsetX : undefined;
    this.offsetY = offsetY ? offsetY : undefined;
  }
}

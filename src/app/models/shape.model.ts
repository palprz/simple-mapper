export class Shape {
  private _id: string;
  private _type: string;
  // TODO probably it will be good to store it all as just 'attrs' but without a couple default values
  private _points: number[];
  private _offsetX: number;
  private _offsetY: number;

  constructor(
    id: string,
    type: string,
    points: number[],
    offsetX: number,
    offsetY: number
  ) {
    this._id = id;
    this._type = type;
    this._points = points;
    this._offsetX = offsetX ? offsetX : 0;
    this._offsetY = offsetY ? offsetY : 0;
  }

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get points(): number[] {
    return this._points;
  }

  get offsetX(): number {
    return this._offsetX;
  }

  get offsetY(): number {
    return this._offsetY;
  }
}

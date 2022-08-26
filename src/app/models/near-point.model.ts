import { Point } from './point.model';
import { Shape } from './shape.model';

export class Near {
  private _shape: Shape;
  private _point: Point;

  constructor(shape: Shape, point: Point) {
    this._shape = shape;
    this._point = point;
  }

  get shape(): Shape {
    return this._shape;
  }

  get point(): Point {
    return this._point;
  }
}

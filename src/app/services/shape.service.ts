import { Injectable } from '@angular/core';
import { Point } from '../models/point.model';

@Injectable({ providedIn: 'root' })
export class ShapeService {

  /**
   * TODO example this in easier way: this is tricky: predict next point based on the actual mouse position, not: position of the shape AND offset. We should remove the offset.
   * @param shape TODO
   * @param newPoint TODO
   */
   public addPointToShape(shape: any, newPoint: Point) {
    shape.attrs['points'].push(
      newPoint.getX() - this.getOffsetXFromShape(shape),
      newPoint.getY() - this.getOffsetYFromShape(shape)
    );
  }

  // TODO can calculation of offset be done better?
  private getOffsetXFromShape(shape: any) {
    return shape.attrs['x'] === undefined ? 0 : shape.attrs['x'];
  }

  // TODO can calculation of offset be done better?
  private getOffsetYFromShape(shape: any) {
    return shape.attrs['y'] === undefined ? 0 : shape.attrs['y'];
  }

}

import { Injectable } from '@angular/core';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';

import { Point } from '../models/point.model';

@Injectable({ providedIn: 'root' })
export class ShapeService {
  /**
   * Create the basic shape.
   * @returns
   */
  public getNewLine() {
    return new Konva.Line({
      id: uuidv4(),
      points: [],
      stroke: 'red',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });
  }

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

  /**
   * Create Point based on the last 2 coordinates from the provided shape.
   * @param shape contains attributes with coordinates
   * @returns Points or undefined (if not enough coordinates)
   */
  public getLastPointFromShape(shape: any) {
    var coords = shape.attrs['points'];
    if (coords.length < 2) {
      // 0 or 1 coords - not enough to create point
      return undefined;
    }

    return new Point(coords[coords.length - 2], coords[coords.length - 1]);
  }
}

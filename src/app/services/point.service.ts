import { Injectable } from '@angular/core';
import { Near } from '../models/near-point.model';
import { Point } from '../models/point.model';
import { Shape } from '../models/shape.model';

@Injectable({ providedIn: 'root' })
export class PointService {
  private _lastPoint: any;

  get lastPoint() {
    return this._lastPoint;
  }

  set lastPoint(lastPoint: any) {
    this._lastPoint = lastPoint;
  }

  /**
   * Check if coordinates from the event are close to any point from stored shapes.
   * @param shapes stored shapes to search any point
   * @param event contains X and Y coordinates
   * @returns found the first point which is near provided coordinates
   */
  public getNearPoint(shapes: Shape[], event: any) {
    var notTextShapes = shapes.filter((el) => el.type !== 'text');
    for (var i = 0; notTextShapes.length > i; i++) {
      var pointsCoords = notTextShapes[i].attrs['points'];
      for (var j = 0; pointsCoords.length > j; j = j + 2) {
        var x1 = pointsCoords[j];
        var y1 = pointsCoords[j + 1];
        var x2 = event.offsetX;
        var y2 = event.offsetY;
        if (this.isNear(x1, y1, x2, y2)) {
          return new Near(notTextShapes[i], new Point(x1, y1));
        }
      }
    }

    return null;
  }

  /**
   * Check if coordinates from the event are close to any text from stored shapes.
   * @param shapes stored shapes to search any text
   * @param event contains X and Y coordinates
   * @returns found the first text which is near provided coordinates
   */
  public getNearText(shapes: Shape[], event: any) {
    var textShapes = shapes.filter((el) => el.type === 'text');
    for (var i = 0; textShapes.length > i; i++) {
      var x1 = textShapes[i].attrs['x'];
      var y1 = textShapes[i].attrs['y'];
      var x2 = event.offsetX;
      var y2 = event.offsetY;
      if (this.isNear(x1, y1, x2, y2, 50)) {
        return new Near(textShapes[i], new Point(x1, y1));
      }
    }

    return null;
  }
  /**
   * Check if coordinates from the event are close to the first point of the shape.
   * @param shape contains point which will be the main point to check
   * @param event contains coordinates of X and Y which will tell where is mouse
   * @returns
   */
  public isNearFirstPoint(shape: any, event: any) {
    return this.isNearPoint(shape, event, 'first');
  }

  /**
   * Check if coordinates from the event are close to the last point of the shape.
   * @param shape contains point which will be the main point to check
   * @param event contains coordinates of X and Y which will tell where is mouse
   * @returns
   */
  public isNearLastPoint(shape: any, event: any) {
    return this.isNearPoint(shape, event, 'last');
  }

  private isNearPoint(shape: any, event: any, whichPoint: string) {
    var x1, y1;
    var points = shape.attrs['points'];
    switch (whichPoint) {
      case 'first': {
        x1 = points[0] + this.addOffset(shape, 'x');
        y1 = points[1] + this.addOffset(shape, 'y');
        break;
      }
      case 'last': {
        x1 = points[points.length - 2] + this.addOffset(shape, 'x');
        y1 = points[points.length - 1] + this.addOffset(shape, 'y');
        break;
      }
      default: {
        // should not be happening
        return false;
      }
    }

    var x2 = event.offsetX;
    var y2 = event.offsetY;
    return this.isNear(x1, y1, x2, y2);
  }

  /**
   * Get the offset (X or Y based on input).
   * @param coordinate X or Y string
   */
  private addOffset(shape: any, coordinate: string) {
    switch (coordinate) {
      case 'x': {
        return shape.attrs['x'] ? shape.attrs['x'] : 0;
      }
      case 'y': {
        return shape.attrs['y'] ? shape.attrs['y'] : 0;
      }
      default: {
        // should not be happening
        return 0;
      }
    }
  }

  private isNear(x1: number, y1: number, x2: number, y2: number, margin = 10) {
    return (
      x1 < x2 + margin &&
      x1 > x2 - margin &&
      y1 < y2 + margin &&
      y1 > y2 - margin
    );
  }
}

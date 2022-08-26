import { Injectable } from '@angular/core';
import { NearPoint } from '../models/near-point.model';
import { Point } from '../models/point.model';

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
  public getNearPoint(shapes: any, event: any) {
    if (shapes.length === 0) {
      // it's a first point on the layer so defo not near any other point
      return null;
    }

    for (var i = 0; shapes.length > i; i++) {
      var pointsCoords = shapes[i].attrs['points'];
      for (var j = 0; pointsCoords.length > j; j = j + 2) {
        if (
          this.isNear(
            pointsCoords[j],
            pointsCoords[j + 1],
            event.offsetX,
            event.offsetY
          )
        ) {
          var nearShape = shapes[i];
          return new NearPoint(
            nearShape,
            new Point(nearShape.attrs['points'][j], nearShape.attrs['points'][j + 1])
          );
        }
      }
    }

    return null;
  }

  // TODO docs
  public getNearText(shapes: any, event: any) {
    // TODO
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
    switch (whichPoint) {
      case 'first': {
        x1 = shape.attrs['points'][0];
        y1 = shape.attrs['points'][1];
        break;
      }
      case 'last': {
        x1 = shape.attrs['points'][shape.attrs['points'].length - 2];
        y1 = shape.attrs['points'][shape.attrs['points'].length - 1];
        console.log('x1 y1', x1, y1);
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

  private isNear(x1: number, y1: number, x2: number, y2: number) {
    // pixels of the margin to detect interaction with the point
    var margin = 10;
    return (
      x1 < x2 + margin &&
      x1 > x2 - margin &&
      y1 < y2 + margin &&
      y1 > y2 - margin
    );
  }
}

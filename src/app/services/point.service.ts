import { Injectable } from '@angular/core';

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
    // pixels of the margin to detect interaction with the point
    var margin = 10;

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
    return (
      x1 < x2 + margin &&
      x1 > x2 - margin &&
      y1 < y2 + margin &&
      y1 > y2 - margin
    );
  }
}

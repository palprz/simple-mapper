import { Injectable } from '@angular/core';
import { Near } from '../models/near-point.model';
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
    for (var i = 0; shapes.length > i; i++) {
      if (shapes[i].type === 'text') {
        // not a line/polygon so skip it
        continue;
      }

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
          return new Near(
            shapes[i],
            new Point(
              shapes[i].attrs['points'][j],
              shapes[i].attrs['points'][j + 1]
            )
          );
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
  public getNearText(shapes: any, event: any) {
    for (var i = 0; shapes.length > i; i++) {
      if (shapes[i].type !== 'text') {
        // a line/polygon so skip it
        continue;
      }

      if (
        this.isNear(
          shapes[i].attrs['x'],
          shapes[i].attrs['y'],
          event.offsetX,
          event.offsetY,
          50
        )
      ) {
        return new Near(
          shapes[i],
          // this isn't needed to add just in case for the future
          new Point(shapes[i].attrs['x'], shapes[i].attrs['y'])
        );
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

  private isNear(x1: number, y1: number, x2: number, y2: number, margin = 10) {
    return (
      x1 < x2 + margin &&
      x1 > x2 - margin &&
      y1 < y2 + margin &&
      y1 > y2 - margin
    );
  }
}

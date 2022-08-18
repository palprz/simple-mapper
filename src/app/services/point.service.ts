import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PointService {
  private _lastPoint: any;

  /**
   * Compare the point with last point to check if they are the same. The only way to verify is compare coordinates (X and Y).
   * @param point point to check
   * @returns
   */
  public isSamePointAsLastPoint(point: any) {
    return (
      this.lastPoint &&
      point &&
      this.lastPoint.x === point.x &&
      this.lastPoint.y === point.y
    );
  }

  get lastPoint() {
    return this._lastPoint;
  }

  set lastPoint(lastPoint: any) {
    this._lastPoint = lastPoint;
  }
}

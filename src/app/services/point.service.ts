import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PointService {
  private lastPoint: any;

  /**
   * Compare the point with last point to check if they are the same. The only way to verify is compare coordinates (X and Y).
   * @param point point to check
   * @returns
   */
  public isSamePointAsLastPoint(point: any) {
    return (
      this.getLastPoint() &&
      point &&
      this.getLastPoint().getX() === point.getX() &&
      this.getLastPoint().getY() === point.getY()
    );
  }

  public getLastPoint() {
    return this.lastPoint;
  }

  public setLastPoint(lastPoint: any) {
    this.lastPoint = lastPoint;
  }
}

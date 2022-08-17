import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PointService {
  /**
   * Compare two points to check if they are the same point. The only way to verify is compare coordinates (X and Y).
   * @param point1 First point
   * @param point2 Second point
   * @returns
   */
  public areSamePoints(point1: any, point2: any) {
    return (
      point1 &&
      point2 &&
      point1.getX() === point2.getX() &&
      point1.getY() === point2.getY()
    );
  }
}

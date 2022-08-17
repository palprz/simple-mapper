import { Injectable } from '@angular/core';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';

import { Point } from '../models/point.model';
import { Shape } from '../models/shape.model';

@Injectable({ providedIn: 'root' })
export class ShapeService {
  public isDragAction: boolean;

  /**
   * Create the basic shape.
   * @returns
   */
  public createBasicNewLine() {
    var line = new Konva.Line({
      id: uuidv4(),
      points: [],
      stroke: 'red',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    this.addEventsForShape(line);
    return line;
  }

  /**
   * Create the shape (based on the basic shape) with provided details.
   * @param storedData data used to create new line
   * @returns
   */
  public createNewLine(storedData: Shape) {
    var line = this.createBasicNewLine();
    line.attrs['points'] = [...storedData.points];
    line.attrs['stroke'] = 'black';

    // TODO for some reason it doesn't like calling getOffsetX()?
    if (storedData.offsetX !== 0) {
      line.attrs['x'] = storedData.offsetX;
    }

    if (storedData.offsetY !== 0) {
      line.attrs['y'] = storedData.offsetY;
    }

    return line;
  }

  /**
   * Add new point to the shape. We should calculate coordinates of the new point WITHOUT offset to make sure the offset from the shape will not be doubled.
   * @param shape contains coordinates which should be removed from the new point
   * @param newPoint the new point to be added
   */
  public addPointToShape(shape: any, newPoint: Point) {
    shape.attrs['points'].push(
      newPoint.getX() - this.getOffset(shape, 'x'),
      newPoint.getY() - this.getOffset(shape, 'y')
    );
  }

  private getOffset(shape: any, coord: string) {
    return shape.attrs[coord] === undefined ? 0 : shape.attrs[coord];
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

  /**
   * Change cursor for the shape after mouse over it.
   * @param shape the shape which will have changed cursor
   */
  public addEventsForShape(shape: any) {
    shape.on('mouseover', () => {
      document.body.style.cursor = 'pointer';
    });
    shape.on('mouseout', () => {
      document.body.style.cursor = 'default';
    });

    shape.on('dragstart', () => {
      this.isDragAction = true;
    });
    shape.on('dragend', () => {
      this.isDragAction = false;
    });
  }
}

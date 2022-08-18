import { Injectable } from '@angular/core';
import Konva from 'konva';
import { shapes } from 'konva/lib/Shape';
import { v4 as uuidv4 } from 'uuid';

import { Point } from '../models/point.model';
import { Shape } from '../models/shape.model';
import { LayerService } from './layer.service';

@Injectable({ providedIn: 'root' })
export class ShapeService {
  public isDragAction: boolean;
  private shape: any;
  private shapes: Shape[] = [];

  constructor(public layerService: LayerService) {}

  /**
   * Start the Line and hold it as a class variable.
   * @returns
   */
  public startLine() {
    console.log('Start the line');
    var shape = this.createBasicNewLine();
    this.layerService.addShape(shape);
    return shape;
  }

  /**
   * Add new Line based on provided input.
   * @param newLine contains points to define new Line.
   */
  public uploadLine(newLine: any) {
    console.log('UPLOAD the line');
    var uploadedLine = this.createNewLine(newLine);
    this.layerService.addShape(uploadedLine);
  }

  /**
   * Calculate the place of the new coordinates and define new Line based on predicted values.
   * @param point the current place of mouse on the stage. Contains X and Y coordinates.
   */
  public calculateLine(shape: any, point: Point) {
    this.addPointToShape(shape, point);
    this.layerService.draw();
    shape.attrs['points'].pop();
    shape.attrs['points'].pop();
  }

  /**
   * Create the basic shape.
   * @returns
   */
  private createBasicNewLine() {
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

  // TODO docs
  public getPointsNumber() {
    var pointsLength = 0;
    this.getShapes().forEach(
      (el) => (pointsLength = el.getPoints().length + pointsLength)
    );
    return pointsLength / 2;
  }

  // TODO docs
  public getShapeNumber() {
    return this.getShapes().length;
  }

  /**
   * Change cursor for the shape after mouse over it.
   * @param shape the shape which will have changed cursor
   */
  private addEventsForShape(shape: any) {
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
  //

  //TODO maybe it will be not used outside shapeService?
  public getShape() {
    return this.shape;
  }

  //TODO maybe it will be not used outside shapeService?
  public getShapes() {
    return this.shapes;
  }
}

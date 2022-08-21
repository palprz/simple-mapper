import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Line } from 'konva/lib/shapes/Line';
import { v4 as uuidv4 } from 'uuid';

import { Point } from '../models/point.model';
import { Shape } from '../models/shape.model';
import { LayerService } from './layer.service';
import { PointService } from './point.service';

@Injectable({ providedIn: 'root' })
export class ShapeService {
  private _isDragAction: boolean;
  private _shape: any;
  private _shapes: Shape[] = [];

  constructor(
    public layerService: LayerService,
    public pointService: PointService
  ) {}

  /**
   * Start the Line and hold it as a class variable.
   */
  public startLine() {
    console.log('Start the line');
    this.shape = this.createBasicNewLine();
    this.layerService.addShape(this.shape);
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
  public calculateLine(point: Point) {
    this.addPointToShape(this.shape, point);
    this.layerService.draw();
    this.shape.attrs['points'].pop();
    this.shape.attrs['points'].pop();
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

    if (storedData.offsetX !== 0) {
      line.attrs['x'] = storedData.offsetX;
    }

    if (storedData.offsetY !== 0) {
      line.attrs['y'] = storedData.offsetY;
    }

    return line;
  }

  /**
   * Store finished shape with rest shapes.
   * @param shape shape to store
   */
  public saveShape(shape: Konva.Line) {
    this.shapes.push(
      new Shape(
        shape.attrs['id'],
        'line',
        shape.attrs['points'],
        shape.attrs['x'],
        shape.attrs['y']
      )
    );
    console.log('SAVING shape', this.shapes[this.shapes.length - 1]);
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  public addPointToLine(point: Point) {
    console.log('ADD POINT the line');
    this.addPointToShape(this.shape, point);
    this.pointService.lastPoint = point;
  }

  /**
   * Finished currently holded Line. Finished Line will be stored in class variable with rest shapes.
   */
  public finishLine() {
    console.log('FINISH the line');
    this.shape.attrs['stroke'] = 'black';
    this.saveShape(this.shape);
    this.shape = undefined;
    this.pointService.lastPoint = undefined;
  }

  /**
   * Edit existing Line on the layer.
   * @param shape shape to be select as current Line to modify
   */
  public startEditingLine(shape: Line) {
    shape.attrs['stroke'] = 'red';
    this.shape = shape;
    this.pointService.lastPoint = this.getLastPointFromShape(this.shape);
    // TODO this doesn't work - many errors. Figure out how to resolve this
    // this.shapes = this.shapes.filter((el) => {
    //   // todo try this https://konvajs.org/docs/selectors/Select_by_id.html
    //   // remove existing shape from the stored list
    //   return el.id !== shape.attrs['id'];
    // });
  }

  /**
   * Add new point to the shape. We should calculate coordinates of the new point WITHOUT offset to make sure the offset from the shape will not be doubled.
   * @param shape contains coordinates which should be removed from the new point
   * @param newPoint the new point to be added
   */
  private addPointToShape(shape: any, newPoint: Point) {
    shape.attrs['points'].push(
      newPoint.x - this.getOffset(shape, 'x'),
      newPoint.y - this.getOffset(shape, 'y')
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
  private getLastPointFromShape(shape: any) {
    var coords = shape.attrs['points'];
    if (coords.length < 2) {
      // 0 or 1 coords - not enough to create point
      return undefined;
    }

    return new Point(coords[coords.length - 2], coords[coords.length - 1]);
  }

  /**
   * Calculate number of points on the layer based on the shapes.
   * @returns
   */
  public getPointsNumber() {
    var pointsLength = 0;
    this.shapes.forEach(
      (el) => (pointsLength = el.points.length + pointsLength)
    );
    return pointsLength / 2;
  }

  /**
   * Return number of shapes.
   * @returns
   */
  public getShapeNumber() {
    return this.shapes.length;
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

  /**
   * Handle provided data and add them to the layer.
   * @param data datat to process
   */
  public processUpload(data: any) {
    this.layerService.clear();

    var newDatas = JSON.parse(data);
    for (var i = 0; newDatas.length > i; i++) {
      this.uploadLine(newDatas[i]);
    }

    this.shapes = newDatas;
    this.layerService.draw();
  }

  get shape() {
    return this._shape;
  }

  set shape(shape: any) {
    this._shape = shape;
  }

  get shapes() {
    return this._shapes;
  }

  set shapes(shapes: Shape[]) {
    this._shape = shapes;
  }

  get isDragAction(): boolean {
    return this._isDragAction;
  }

  set isDragAction(isDragAction: boolean) {
    this._isDragAction = isDragAction;
  }
}

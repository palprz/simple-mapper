import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Line } from 'konva/lib/shapes/Line';
import { v4 as uuidv4 } from 'uuid';
import { Near } from '../models/near-point.model';

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
    this.shape = new Konva.Line({
      id: uuidv4(),
      points: [],
      stroke: 'red',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    this.addEventsForShape(this.shape);
    this.layerService.addShape(this.shape);
  }

  private uploadText(newText: Shape) {
    var uploadedText = new Konva.Text(newText.attrs);
    uploadedText.draggable(true);
    this.layerService.addShape(uploadedText);
  }

  /**
   * Add new Line based on provided input.
   * @param newLine contains points to define new Line.
   */
  private uploadLine(newLine: Shape) {
    var uploadedLine = new Konva.Line(newLine.attrs);
    this.addEventsForShape(uploadedLine);
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
   * Create text shape.
   * @param text value to be displayed as a text
   * @param menuClickPoint contains coordinates where the text should be added to the layer
   */
  public createText(text: string, menuClickPoint: Point) {
    var textShape = new Konva.Text({
      id: uuidv4(),
      x: menuClickPoint.x,
      y: menuClickPoint.y,
      text: text,
      fontSize: 18,
      fontFamily: 'Calibri',
    });
    textShape.draggable(true);

    this.addEventsForShape(textShape);
    this.layerService.addShape(textShape);
    this.saveShape(textShape);
  }

  /**
   * Store finished shape with rest shapes.
   * @param shape shape to store
   */
  public saveShape(shape: Konva.Shape) {
    this.removeShapeFromStoredList(shape.attrs['id']);

    if (shape instanceof Konva.Text) {
      this.shapes.push(new Shape(shape.attrs['id'], 'text', shape.attrs));
    } else {
      this.shapes.push(
        new Shape(
          shape.attrs['id'],
          shape.attrs['closed'] === 'true' ? 'polygon' : 'line',
          shape.attrs
        )
      );
    }
  }

  /**
   * Remove point from the shape. If shape after that will have only 1 point, fully remove the shape (from layer and stored list).
   * @param near contains near point and shape
   */
  public removePointFromShape(near: Near) {
    this.removeCoordsFromShape(near.shape, near.point);

    // remove shapes with 1 or less (somehow) points
    if (near.shape.attrs['points'].length <= 2) {
      this.layerService.destroyShape(near.shape);
      this.removeShapeFromStoredList(near.shape.attrs['id']);
    }
  }

  /**
   * Remove text from the layer and stored list.
   * @param near contains shape
   */
  public removeText(near: Near) {
    this.layerService.destroyShape(near.shape);
    this.removeShapeFromStoredList(near.shape.attrs['id']);
  }

  /**
   * Remove coordinates from provided shape.
   * @param shape to be modified
   * @param point contains X and Y coordinates to be removed from shape
   * @returns
   */
  public removeCoordsFromShape(shape: Shape, point: Point) {
    var coords = shape.attrs['points'];
    for (var i = 0; coords.length > i; i++) {
      if (point.x === coords[i] && point.y === coords[i + 1]) {
        coords.splice(i, 2);
        return;
      }
    }
  }

  /**
   * Remove shape from stored list.
   * @param shapeID the ID of related shape to delete
   */
  private removeShapeFromStoredList(shapeID: string) {
    var index = this.shapes.findIndex((el) => el.attrs['id'] == shapeID);
    if (index > -1) {
      this.shapes.splice(index, 1);
    }
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  public addPointToLine(point: Point) {
    this.addPointToShape(this.shape, point);
    this.pointService.lastPoint = point;
  }

  /**
   * Close the line to create polygon type.
   */
  public closeLine() {
    this.shape.attrs['closed'] = 'true';
  }

  /**
   * Finished currently holded Line. Finished Line will be stored in class variable with rest shapes.
   */
  public finishLine() {
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
    this.removeShapeFromStoredList(shape.attrs['id']);
  }

  /**
   * Add new point to the shape. We should calculate coordinates of the new point WITHOUT offset to make sure the offset from the shape will not be doubled.
   * @param shape contains coordinates which should be removed from the new point
   * @param newPoint the new point to be added
   */
  private addPointToShape(shape: Konva.Shape, newPoint: Point) {
    shape.attrs['points'].push(
      newPoint.x - this.getOffset(shape, 'x'),
      newPoint.y - this.getOffset(shape, 'y')
    );
  }

  private getOffset(shape: Konva.Shape, coord: string) {
    return shape.attrs[coord] ? shape.attrs[coord] : 0;
  }

  /**
   * Create Point based on the last 2 coordinates from the provided shape.
   * @param shape contains attributes with coordinates
   * @returns Points or undefined (if not enough coordinates)
   */
  private getLastPointFromShape(shape: Konva.Shape) {
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
  private addEventsForShape(shape: Konva.Shape) {
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
      // offset has been changed - save the shape
      this.saveShape(shape);
    });
  }

  /**
   * Handle provided data and add them to the layer.
   * @param newShapes new shapes to add
   */
  public processUpload(newShapes: Shape[]) {
    this.layerService.clear();

    for (var i = 0; newShapes.length > i; i++) {
      if (newShapes[i].type === 'text') {
        this.uploadText(newShapes[i]);
      } else {
        this.uploadLine(newShapes[i]);
      }
    }

    this.shapes = newShapes;
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
    this._shapes = shapes;
  }

  get isDragAction(): boolean {
    return this._isDragAction;
  }

  set isDragAction(isDragAction: boolean) {
    this._isDragAction = isDragAction;
  }
}

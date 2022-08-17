import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { Point } from './models/point.model';
import { Shape } from './models/shape.model';
import { Line } from 'konva/lib/shapes/Line';
import { PointService } from './services/point.service';
import { ShapeService } from './services/shape.service';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pointCounter') pointCounter: ElementRef;
  @ViewChild('shapeCounter') shapeCounter: ElementRef;

  private shape: any;
  private shapes: Shape[] = [];
  private lastPoint: any;
  private layer: Konva.Layer;
  private isDragAction: boolean;

  constructor(
    public dataService: DataService,
    public pointService: PointService,
    public shapeService: ShapeService
  ) {}

  ngAfterViewInit(): void {
    var stage = new Konva.Stage({
      container: 'canvas-container',
      width: 800,
      height: 400,
    });

    this.layer = new Konva.Layer();
    stage.add(this.layer);
    this.updateCounters();

    // assign events to the stage
    stage.on('mouseup', (e) => {
      if (this.isDragAction) {
        // part of drag action - ignore this click
        return;
      }

      // TODO fix red line for this scenario: selected shape and select next shape
      if (
        e.target !== undefined &&
        // cannot be Line OR it can be a Line but still continued (like we would like to finish shape)
        (!(e.target instanceof Line) || this.lastPoint !== undefined)
      ) {
        this.clickedPoint(e.evt);
      } else {
        this.editLine(e.target);
      }
      this.layer.draw();
    });

    stage.on('mousemove', (e) => {
      this.movedMouse(e.evt);
    });
  }

  // START: Main interaction with layer
  /**
   * Handle click on the layer to create a point.
   * @param event contains X and Y coordinates
   */
  public clickedPoint(event: any) {
    var point = new Point(event.offsetX, event.offsetY);

    if (this.shape === undefined) {
      this.startLine();
    }

    if (this.pointService.areSamePoints(this.lastPoint, point)) {
      this.finishLine();
    } else {
      this.addPointToLine(point);
    }
  }

  /**
   * Handle move of the mouse to predict next point on the layer.
   * @param event contains X and Y coordinates
   */
  public movedMouse(event: any) {
    if (this.lastPoint === undefined) {
      // last point not defined so cannot draw a line
      return;
    }

    this.calculateLine(new Point(event.offsetX, event.offsetY));
  }
  // END: Main interaction with canvas

  // START: shape actions
  /**
   * Start the Line and hold it as a class variable.
   */
  private startLine() {
    console.log('START the line');
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
    this.layer.add(this.shape);
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
   * Edit existing Line on the layer.
   * @param shape shape to be select as current Line to modify
   */
  private editLine(shape: Line) {
    this.shape = shape;
    this.shape.attrs['stroke'] = 'red';
    this.lastPoint = this.shapeService.getLastPointFromShape(this.shape);
    this.shapes = this.shapes.filter((el) => {
      // remove existing shape from the stored list
      return el.getID() !== shape.attrs['id'];
    });
    this.updateCounters();
  }

  /**
   * Add new Line based on provided input.
   * @param newLine contains points to define new Line.
   */
  private uploadLine(newLine: any) {
    console.log('UPLOAD the line');
    var uploadedLine = new Konva.Line({
      points: [...newLine.points],
      stroke: 'black',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    this.addEventsForShape(uploadedLine);
    this.layer.add(uploadedLine);
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  private addPointToLine(point: Point) {
    console.log('ADD POINT the line');
    this.shapeService.addPointToShape(this.shape, point);

    this.updateCounters();
    this.lastPoint = point;
  }

  /**
   * Finished currently holded Line. Finished Line will be stored in class variable with rest shapes.
   */
  private finishLine() {
    console.log('FINISH the line');
    this.shape.attrs['stroke'] = 'black';
    this.saveShape(this.shape);
    this.shape = undefined;
    this.lastPoint = undefined;
    this.updateCounters();
  }

  /**
   * Store finished shape with rest shapes.
   * @param shape shape to store
   */
  private saveShape(shape: Konva.Line) {
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
   * Calculate the place of the new coordinates and define new Line based on predicted values.
   * @param point the current place of mouse on the stage. Contains X and Y coordinates.
   */
  private calculateLine(point: Point) {
    this.shapeService.addPointToShape(this.shape, point);
    this.layer.draw();
    this.shape.attrs['points'].pop();
    this.shape.attrs['points'].pop();
  }

  /**
   * Remove all shapes from the layer and reset stored shapes and points on the layer.
   */
  private clearLayer() {
    this.layer.removeChildren();
    this.layer.draw();
    this.shapes = [];
  }
  // END: shape actions

  // START: Helpers
  private updateCounters() {
    var pointsLength = 0;
    this.shapes.forEach(
      (el) => (pointsLength = el.getPoints().length + pointsLength)
    );
    this.pointCounter.nativeElement.innerHTML = pointsLength / 2;
    this.shapeCounter.nativeElement.innerHTML = this.shapes.length;
  }
  // END: Helpers

  // START: Download and upload

  public download() {
    this.dataService.download(this.shapes);
  }

  public handleUploadedFile(event: any) {
    var file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      this.processUpload(fileReader.result);
    };
  }

  private processUpload(data: any) {
    this.clearLayer();

    var newDatas = JSON.parse(data);
    for (var i = 0; newDatas.length > i; i++) {
      this.uploadLine(newDatas[i]);
    }

    this.shapes = newDatas;
    this.layer.draw();
    this.updateCounters();
  }
  // END: Download and upload
}

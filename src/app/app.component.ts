import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { Point } from './point.model';
import { Shape } from './shape.model';
import { Line } from 'konva/lib/shapes/Line';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pointCounter') pointCounter: ElementRef;
  @ViewChild('shapeCounter') shapeCounter: ElementRef;

  private shape: any;
  // TODO extend Shape to keep offsets for X and Y
  private shapes: Shape[] = [];
  // TODO is there a point to have it even? maybe just remove this field?
  private points: Point[] = [];
  private lastPoint: any;
  private layer: Konva.Layer;
  private isDragAction: boolean;

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
      // TODO fix red line for this scenario: selected shape and select next shape
      if (
        e.target !== undefined &&
        // cannot be Line OR it can be a Line but still continued (like we would like to finish shape)
        (!(e.target instanceof Line) || this.lastPoint !== undefined)
      ) {
        this.clickedPoint(e.evt);
      } else if (!this.isDragAction) {
        this.editLine(e.target);
      }
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
    if (this.isDragAction) {
      // part of drag action - ignore this click
      return;
    }

    var point = new Point(event.offsetX, event.offsetY);

    if (this.shape === undefined) {
      this.startLine();
    }

    if (
      this.lastPoint &&
      this.lastPoint.getX() === point.getX() &&
      this.lastPoint.getY() === point.getY()
    ) {
      this.stopLine();
    } else {
      this.continueLine(point);
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
  // TODO think how to simplify these events
  private addEventsForShape(shape: any) {
    shape.on('mouseover', function () {
      document.body.style.cursor = 'pointer';
    });
    shape.on('mouseout', function () {
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
   * TODO docs
   * @param shape
   */
  private editLine(shape: Line) {
    this.shape = shape;
    this.shape.attrs['stroke'] = 'red';
    this.lastPoint = new Point(
      // TODO is this even working? Fix offset calculation
      // this.shape.attrs['points'][this.shape.attrs['points'].length - 2] +
      //   this.getOffsetXFromShape(this.shape),
      // this.shape.attrs['points'][this.shape.attrs['points'].length - 1] +
      //   this.getOffsetYFromShape(this.shape)
      this.shape.attrs['points'][this.shape.attrs['points'].length - 2],
      this.shape.attrs['points'][this.shape.attrs['points'].length - 1]
    );
    this.layer.draw();
    // TODO remove existing shape from the array (we are going to add it anyway at the end)
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
    this.layer.draw();
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  private continueLine(point: Point) {
    console.log('CONTINUE the line');
    // TODO verify if this is correctly working (case when the Line has been dragged)
    this.shape.attrs['points'].push(
      point.getX() + this.getOffsetXFromShape(this.shape),
      point.getY() + this.getOffsetYFromShape(this.shape)
    );
    this.points.push(point);

    this.layer.draw();
    this.updateCounters();
    this.lastPoint = point;
  }

  // TODO can calculation of offset be done better?
  private getOffsetXFromShape(shape: any) {
    return shape.attrs['x'] === undefined ? 0 : shape.attrs['x'];
  }

  // TODO can calculation of offset be done better?
  private getOffsetYFromShape(shape: any) {
    return shape.attrs['y'] === undefined ? 0 : shape.attrs['y'];
  }

  /**
   * Stop continuing hold Line. Finished Line will be stored in class variable with rest shapes.
   */
  private stopLine() {
    console.log('STOP the line');
    this.shape.attrs['stroke'] = 'black';
    this.saveShape(this.shape);
    this.shape = undefined;
    this.lastPoint = undefined;

    //update the canvas
    this.layer.draw();
    this.updateCounters();
  }

  /**
   * Store finished shape with rest shapes.
   * @param shape shape to store
   */
  private saveShape(shape: Konva.Line) {
    this.shapes.push(new Shape(uuidv4(), 'line', shape.attrs['points']));
    console.log('SAVING shape', this.shapes[this.shapes.length - 1]);
  }

  /**
   * Calculate the place of the new coordinates and define new Line based on predicted values.
   * @param point the current place of mouse on the stage. Contains X and Y coordinates.
   */
  private calculateLine(point: Point) {
    this.shape.attrs['points'].push(point.getX(), point.getY());
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
    this.points = [];
  }
  // END: shape actions

  // START: Helpers
  private updateCounters() {
    this.pointCounter.nativeElement.innerHTML = this.points.length;
    this.shapeCounter.nativeElement.innerHTML = this.shapes.length;
  }
  // END: Helpers

  // START: Download and upload

  // TODO read more about this: JSON.stringify
  // TODO bit doggy way ot downloading but well...
  public download() {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(
      new Blob([JSON.stringify(this.shapes, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
    );
    a.download = 'simple-mapper-data.json';
    a.click();
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

      // update array with points
      for (var j = 0; newDatas[i].points.length > j; j = j + 2) {
        this.points.push(
          new Point(newDatas[i].points[j], newDatas[i].points[j + 1])
        );
      }
    }

    this.shapes = newDatas;
    this.updateCounters();
  }
  // END: Download and upload
}

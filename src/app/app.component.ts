import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { Point } from './point.model';
import { Shape } from './shape.model';

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
  private points: Point[] = [];
  private lastPoint: any;
  private layer: Konva.Layer;

  ngAfterViewInit(): void {
    var stage = new Konva.Stage({
      container: 'canvas-container',
      width: 800,
      height: 400,
    });

    this.layer = new Konva.Layer();
    stage.add(this.layer);
    this.updateCounters();
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
  public startLine() {
    console.log('START the line');
    this.shape = new Konva.Line({
      points: [],
      stroke: 'red',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
    });

    this.layer.add(this.shape);
  }

  /**
   * Add new Line based on provided input.
   * @param newLine contains points to define new Line.
   */
  public uploadLine(newLine: any) {
    console.log('UPLOAD the line');
    var uploadedLine = new Konva.Line({
      points: [...newLine.points],
      stroke: 'black',
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
    });

    this.layer.add(uploadedLine);
    this.layer.draw();
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  public continueLine(point: any) {
    console.log('CONTINUE the line');
    this.shape.attrs['points'].push(point.getX(), point.getY());
    this.points.push(point);

    this.layer.draw();
    this.updateCounters();
    this.lastPoint = point;
  }

  /**
   * Stop continuing hold Line. Finished Line will be stored in class variable with rest shapes.
   */
  public stopLine() {
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
  public saveShape(shape: Konva.Line) {
    console.log('SAVING shape');
    this.shapes.push(new Shape(uuidv4(), 'line', shape.attrs['points']));
    console.log(this.shapes[this.shapes.length - 1]);
  }

  /**
   * Calculate the place of the new coordinates and define new Line based on predicted values.
   * @param point the current place of mouse on the stage. Contains X and Y coordinates.
   */
  public calculateLine(point: any) {
    console.log('Calculating line...');
    this.shape.attrs['points'].push(point.getX(), point.getY());
    this.layer.draw();
    this.shape.attrs['points'].pop();
    this.shape.attrs['points'].pop();
  }

  /**
   * Remove all shapes from the layer and reset stored shapes and points on the layer.
   */
  public clearLayer() {
    this.layer.removeChildren();
    this.layer.draw();
    this.shapes = [];
    this.points = [];
  }
  // END: shape actions

  // START: Helpers
  public updateCounters() {
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

  public processUpload(data: any) {
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

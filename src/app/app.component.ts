import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import Konva from 'konva';
import { Point } from './models/point.model';
import { Shape } from './models/shape.model';
import { Line } from 'konva/lib/shapes/Line';
import { PointService } from './services/point.service';
import { ShapeService } from './services/shape.service';
import { DataService } from './services/data.service';
import { LayerService } from './services/layer.service';

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

  constructor(
    public dataService: DataService,
    public layerService: LayerService,
    public pointService: PointService,
    public shapeService: ShapeService
  ) {}

  ngAfterViewInit(): void {
    var stage = this.layerService.initStage();

    this.updateCounters();

    // assign events to the stage
    stage.on('mouseup', (e) => {
      if (this.shapeService.isDragAction) {
        // part of drag action - ignore this click
        return;
      }

      if (e.target instanceof Line && this.pointService.getLastPoint() === undefined) {
        this.startEditingLine(e.target);
      } else {
        if (this.shape === undefined) {
          // start the new shape
          this.shape = this.shapeService.startLine();
        }

        var point = new Point(e.evt.offsetX, e.evt.offsetY);
        if (this.pointService.isSamePointAsLastPoint(point)) {
          // clicked same point - finish shape
          this.finishLine();
        } else {
          // extend the shape by the new point
          this.addPointToLine(point);
        }
      }

      this.layerService.draw();
    });

    stage.on('mousemove', (e) => {
      if (this.pointService.getLastPoint() === undefined) {
        // last point not defined so cannot draw a line
        return;
      }

      this.shapeService.calculateLine(this.shape, new Point(e.evt.offsetX, e.evt.offsetY));
    });
  }

  /**
   * Edit existing Line on the layer.
   * @param shape shape to be select as current Line to modify
   */
  private startEditingLine(shape: Line) {
    this.shape = shape;
    this.shape.attrs['stroke'] = 'red';
    this.pointService.setLastPoint(this.shapeService.getLastPointFromShape(this.shape));
    this.shapes = this.shapes.filter((el) => {
      // remove existing shape from the stored list
      return el.getID() !== shape.attrs['id'];
    });
    this.updateCounters();
  }

  /**
   * Update current hold Line by new coordinates.
   * @param point contains X and Y coordinates
   */
  private addPointToLine(point: Point) {
    console.log('ADD POINT the line');
    this.shapeService.addPointToShape(this.shape, point);

    this.updateCounters();
    this.pointService.setLastPoint(point);
  }

  /**
   * Finished currently holded Line. Finished Line will be stored in class variable with rest shapes.
   */
  private finishLine() {
    console.log('FINISH the line');
    this.shape.attrs['stroke'] = 'black';
    this.saveShape(this.shape);
    this.shape = undefined;
    this.pointService.setLastPoint(undefined);
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

  // END: shape actions

  // START: Helpers
  private updateCounters() {
    this.pointCounter.nativeElement.innerHTML = this.shapeService.getPointsNumber();
    this.shapeCounter.nativeElement.innerHTML = this.shapeService.getShapeNumber();
  }
  // END: Helpers

  // START: Download and upload

  public download() {
    this.dataService.download(this.shapes);
  }

  public handleUploadedFile(event: any) {
    // TODO verify if someone didn't click 'Cancel' during upload - it will throw an error currently
    var file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      this.processUpload(fileReader.result);
    };
  }

  private processUpload(data: any) {
    this.layerService.clear();

    var newDatas = JSON.parse(data);
    for (var i = 0; newDatas.length > i; i++) {
      this.shapeService.uploadLine(newDatas[i]);
    }

    this.shapes = newDatas;
    this.layerService.draw();
    this.updateCounters();
  }
  // END: Download and upload
}

import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
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
      this.handleMouseUpEvent(e);
    });

    stage.on('mousemove', (e) => {
      this.handleMouseMoveEvent(e);
    });
  }

  /**
   * Handle all 'mouseup' events.
   * @param e event
   */
  private handleMouseUpEvent(e: any) {
    if (this.shapeService.isDragAction) {
      // part of drag action - ignore this click
      return;
    }

    if (e.target instanceof Line && this.pointService.lastPoint === undefined) {
      this.shapeService.startEditingLine(e.target);
      this.updateCounters();
    } else {
      if (this.shapeService.shape === undefined) {
        // start the new shape
        this.shapeService.startLine();
      }

      var point = new Point(e.evt.offsetX, e.evt.offsetY);
      if (this.pointService.isSamePointAsLastPoint(point)) {
        // clicked same point - finish shape
        this.shapeService.finishLine();
        this.updateCounters();
      } else {
        // extend the shape by the new point
        this.shapeService.addPointToLine(point);
        this.updateCounters();
      }
    }

    this.layerService.draw();
  }

  /**
   * Handle all 'mousemove' events.
   * @param e event
   */
  private handleMouseMoveEvent(e: any) {
    if (this.pointService.lastPoint === undefined) {
      // last point not defined so cannot draw a line
      return;
    }

    this.shapeService.calculateLine(new Point(e.evt.offsetX, e.evt.offsetY));
  }

  private updateCounters() {
    this.pointCounter.nativeElement.innerHTML =
      this.shapeService.getPointsNumber();
    this.shapeCounter.nativeElement.innerHTML =
      this.shapeService.getShapeNumber();
  }

  // START: Download and upload

  public download() {
    this.dataService.download(this.shapeService.shapes);
  }

  public handleUploadedFile(event: any) {
    // TODO verify if someone didn't click 'Cancel' during upload - it will throw an error currently
    var file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      this.shapeService.processUpload(fileReader.result);
      this.updateCounters();
    };
  }

  // END: Download and upload
}

import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { Point } from './models/point.model';
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

      if (this.hasInteractionWithFirstPoint(this.shapeService.shape, e.evt)) {
        // interaction with first point so close the shape and finish it
        var points = this.shapeService.shape.attrs['points'];
        this.shapeService.addPointToLine(new Point(points[0], points[1]));
        this.shapeService.finishLine();
        this.updateCounters();
      } else if (this.pointService.isSamePointAsLastPoint(point)) {
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

    if (this.hasInteractionWithFirstPoint(this.shapeService.shape, e.evt)) {
      this.shapeService.shape.attrs['stroke'] = 'green';
    } else {
      this.shapeService.shape.attrs['stroke'] = 'red';
    }

    this.shapeService.calculateLine(new Point(e.evt.offsetX, e.evt.offsetY));
  }

  /**
   * Check if coordinates from the event are close to the first point of the shape.
   * @param shape contains point which will be the main point to check
   * @param event contains coordinates of X and Y which will tell where is mouse
   * @returns
   */
  private hasInteractionWithFirstPoint(shape: any, event: any) {
    // pixels of the margin to detect interaction with the point
    var margin = 10;

    var x1 = shape.attrs['points'][0];
    var y1 = shape.attrs['points'][1];
    var x2 = event.offsetX;
    var y2 = event.offsetY;
    return (
      x1 < x2 + margin &&
      x1 > x2 - margin &&
      y1 < y2 + margin &&
      y1 > y2 - margin
    );
  }

  private updateCounters() {
    this.pointCounter.nativeElement.innerHTML =
      this.shapeService.getPointsNumber();
    this.shapeCounter.nativeElement.innerHTML =
      this.shapeService.getShapeNumber();
  }

  public download() {
    this.dataService.download();
  }

  public handleUploadedFile(event: any) {
    if (event.target.files.length == 0) {
      // no file to upload - ignore event
      return;
    }
    var fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    fileReader.onload = () => {
      this.shapeService.processUpload(fileReader.result);
      this.updateCounters();
    };
  }

  // TODO docs
  public uploadStageBackground(event: any) {
    if (event.target.files.length == 0) {
      // no file to upload - ignore event
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      this.layerService.uploadStageBackground(reader.result);
    };
  }

  // TODO temporarily to check if offset is added properly
  // TODO docs
  public setBackgroundOffset(event: any) {
    var offsets = event.target.value.split(',', 2);
    this.layerService.setBackgroundOffset(offsets[0], offsets[1]);
  }
}

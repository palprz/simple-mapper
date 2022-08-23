import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { Point } from './models/point.model';
import { Line } from 'konva/lib/shapes/Line';
import { PointService } from './services/point.service';
import { ShapeService } from './services/shape.service';
import { DataService } from './services/data.service';
import { LayerService } from './services/layer.service';
import { StoreData } from './models/store-data.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pointCounter') pointCounter: ElementRef;
  @ViewChild('shapeCounter') shapeCounter: ElementRef;

  @ViewChild('menu') menu: ElementRef;
  @ViewChild('deletePointMenu') deletePointMenu: ElementRef;

  private nearShape: any;

  constructor(
    public dataService: DataService,
    public layerService: LayerService,
    public pointService: PointService,
    public shapeService: ShapeService
  ) {}

  ngAfterViewInit(): void {
    this.layerService.initStage();

    this.updateCounters();

    // assign events to the stage
    this.layerService.stage.on('mouseup', (e) => {
      this.handleMouseUpEvent(e);
    });

    this.layerService.stage.on('mousemove', (e) => {
      this.handleMouseMoveEvent(e);
    });

    this.layerService.stage.on('contextmenu', (e) => {
      e.evt.preventDefault();
      this.displayContextMenu(e);
    });
  }

  /**
   * Handle all 'mouseup' events.
   * @param e event
   */
  private handleMouseUpEvent(e: any) {
    // hide context menu after any click on the stage
    this.hideContextMenu();

    if (this.shapeService.isDragAction) {
      // part of drag action - ignore this click
      return;
    }

    if (e.target instanceof Line && !this.pointService.lastPoint) {
      this.shapeService.startEditingLine(e.target);
      this.updateCounters();
    } else {
      if (!this.shapeService.shape) {
        // start the new shape
        this.shapeService.startLine();
      }

      var point = new Point(e.evt.offsetX, e.evt.offsetY);

      if (this.pointService.isNearFirstPoint(this.shapeService.shape, e.evt)) {
        // interaction with first point so close the shape and finish it
        var points = this.shapeService.shape.attrs['points'];
        this.shapeService.addPointToLine(new Point(points[0], points[1]));
        this.shapeService.closeLine();
        this.shapeService.finishLine();
        this.updateCounters();
      } else if (
        this.pointService.isNearLastPoint(this.shapeService.shape, e.evt)
      ) {
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
    if (!this.pointService.lastPoint) {
      // last point not defined so cannot draw a line
      return;
    }

    if (this.pointService.isNearFirstPoint(this.shapeService.shape, e.evt)) {
      this.shapeService.shape.attrs['stroke'] = 'green';
    } else {
      this.shapeService.shape.attrs['stroke'] = 'red';
    }

    this.shapeService.calculateLine(new Point(e.evt.offsetX, e.evt.offsetY));
  }

  /**
   * Display context menu next to the pointer.
   */
  // TODO probbaly this should change the name
  private displayContextMenu(e: any) {
    var pointerCoords = this.layerService.stage.getPointerPosition();
    if (!pointerCoords) {
      // this shouldn't be possible but return just in case
      return;
    }

    // display context menu
    var menuStyle = this.menu.nativeElement.style;
    menuStyle.display = 'initial';
    menuStyle.top =
      this.layerService.stageContainer.top + pointerCoords.y + 'px';
    menuStyle.left =
      this.layerService.stageContainer.left + pointerCoords.x + 'px';

    // disable button by default
    this.deletePointMenu.nativeElement.disabled = true;

    var nearShape = this.pointService.getNearShape(
      this.shapeService.shapes,
      e.evt
    );

    if (nearShape != null) {
      this.nearShape = nearShape;
      this.deletePointMenu.nativeElement.disabled = false;
    }
  }

  private updateCounters() {
    this.pointCounter.nativeElement.innerHTML =
      this.shapeService.getPointsNumber();
    this.shapeCounter.nativeElement.innerHTML =
      this.shapeService.getShapeNumber();
  }

  public download() {
    var datasToDownload = new StoreData(
      // remove borders from below value
      this.layerService.stageContainer.width - 2,
      // remove borders from below value
      this.layerService.stageContainer.height - 2,
      this.shapeService.shapes
    );
    this.dataService.download(datasToDownload);
  }

  public handleUploadedFile(event: any) {
    if (event.target.files.length == 0) {
      // no file to upload - ignore event
      return;
    }
    var fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], 'UTF-8');
    fileReader.onload = () => {
      // TODO validation
      var newDatas = JSON.parse(<any>fileReader.result);
      // set proper size of the stage
      this.layerService.processUpload(newDatas.stageX, newDatas.stageY);
      // setup all shapes
      this.shapeService.processUpload(newDatas.shapes);
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

  // TODO context menu probably should be a separate component
  /**
   * Handle interaction with delete point from context menu.
   * @param event
   */
  public contextMenuDeletePoint(event: any) {
    if (!this.nearShape) {
      // shouldn't be possible to click delete without near point but check it just in case
      return;
    }

    console.log('TODO deleting the point now: ', event);
    this.hideContextMenu();
  }

  /**
   * Handle interaction with cancel current action from context menu.
   * @param event
   */
  public contextMenuCancelCurrentAction(event: any) {
    // TODO
  }

  /**
   * Handle interaction with close menu from context menu.
   * @param event
   */
  public contextMenuCloseMenuAction(event: any) {
    this.hideContextMenu();
  }

  private hideContextMenu() {
    this.menu.nativeElement.style.display = 'none';
  }
}

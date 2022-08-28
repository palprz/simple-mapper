import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { Point } from './models/point.model';
import { Line } from 'konva/lib/shapes/Line';
import { PointService } from './services/point.service';
import { ShapeService } from './services/shape.service';
import { DataService } from './services/data.service';
import { LayerService } from './services/layer.service';
import { StoreData } from './models/store-data.model';
import { Stage } from 'konva/lib/Stage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('menu')
  private menu: ElementRef;

  @ViewChild('deletePointMenu')
  private deletePointMenu: ElementRef;

  @ViewChild('deleteTextMenu')
  private deleteTextMenu: ElementRef;

  private nearPoint: any;
  private nearText: any;
  private menuClickPoint: any;

  constructor(
    public dataService: DataService,
    public layerService: LayerService,
    public pointService: PointService,
    public shapeService: ShapeService
  ) {}

  ngAfterViewInit(): void {
    this.layerService.initStage();
    this.addEventsToStage(this.layerService.stage);
  }

  private addEventsToStage(stage: Stage) {
    stage.on('mouseup', (e) => {
      this.handleMouseUpEvent(e);
    });

    stage.on('mousemove', (e) => {
      this.handleMouseMoveEvent(e);
    });

    stage.on('contextmenu', (e) => {
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
    // clear context menu related values
    this.nearPoint = undefined;
    this.nearText = undefined;
    this.menuClickPoint = undefined;

    if (this.shapeService.isDragAction) {
      // part of drag action - ignore this click
      return;
    }

    if (e.target instanceof Line && !this.pointService.lastPoint) {
      this.shapeService.startEditingLine(e.target);
    } else {
      if (!this.shapeService.shape) {
        // start the new shape
        this.shapeService.startLine();
      }

      var point = new Point(e.evt.offsetX, e.evt.offsetY);

      if (this.pointService.isNearFirstPoint(this.shapeService.shape, e.evt)) {
        // interaction with first point so close the shape and finish it
        var points = this.shapeService.shape.attrs['points'];
        var offsetX = this.shapeService.shape.attrs['x'];
        var offsetY = this.shapeService.shape.attrs['y'];

        this.shapeService.addPointToLine(
          new Point(
            // tbf offsets shouldn't be added because we are removing it at the end but it's better to not to overcomplicate code later
            points[0] + (offsetX ? offsetX : 0),
            points[1] + (offsetY ? offsetY : 0)
          )
        );
        this.shapeService.closeLine();
        this.shapeService.finishLine();
      } else if (
        this.pointService.isNearLastPoint(this.shapeService.shape, e.evt)
      ) {
        // clicked same point - finish shape
        this.shapeService.finishLine();
      } else {
        // extend the shape by the new point
        this.shapeService.addPointToLine(point);
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
  private displayContextMenu(e: any) {
    var pointerCoords = this.layerService.stage.getPointerPosition();
    if (!pointerCoords) {
      // this shouldn't be possible but return just in case
      return;
    }

    // display context menu
    var stageContainer = this.layerService.stageContainer;
    var menuStyle = this.menu.nativeElement.style;
    menuStyle.display = 'initial';
    menuStyle.top = stageContainer.top + pointerCoords.y + 'px';
    menuStyle.left = stageContainer.left + pointerCoords.x + 'px';

    // disable button by default
    this.deletePointMenu.nativeElement.disabled = true;
    this.deleteTextMenu.nativeElement.disabled = true;

    this.menuClickPoint = new Point(e.evt.offsetX, e.evt.offsetY);
    this.prepareDeletePointMenu(e);
    this.prepareDeleteTextMenu(e);
  }

  /**
   * Try to find near point. Enable menu context if found something.
   * @param event contains coordinates X and Y
   */
  private prepareDeletePointMenu(event: any) {
    var nearPoint = this.pointService.getNearPoint(
      this.shapeService.shapes,
      event.evt
    );

    if (nearPoint) {
      this.nearPoint = nearPoint;
      this.deletePointMenu.nativeElement.disabled = false;
    }
  }

  /**
   * Try to find near text. Enable menu context if found something.
   * @param event contains coordinates X and Y
   */
  private prepareDeleteTextMenu(event: any) {
    var nearText = this.pointService.getNearText(
      this.shapeService.shapes,
      event.evt
    );
    if (nearText) {
      this.nearText = nearText;
      this.deleteTextMenu.nativeElement.disabled = false;
    }
  }

  // TODO docs
  public demo() {
    // TODO
  }

  /**
   * Download data. Includes: size of stage, shapes, background and offsets for background.
   */
  public download() {
    var container = this.layerService.stageContainer;
    var downloadDatas = new StoreData(
      container.width - 16,
      container.height - 16,
      this.shapeService.shapes,
      this.layerService.background
    );
    this.dataService.download(downloadDatas);
  }

  /**
   * Handle event with uploading the data to save to the stage.
   * @param event
   * @returns
   */
  public handleUploadedData(event: any) {
    event.preventDefault();
    if (event.target[1].files.length == 0) {
      // no file to upload - ignore event
      return;
    }
    var fileReader = new FileReader();
    fileReader.readAsText(event.target[1].files[0], 'UTF-8');
    fileReader.onload = () => {
      // TODO validation
      var newDatas = JSON.parse(<any>fileReader.result);
      // set size of the stage and background for it
      this.layerService.processUpload(
        newDatas.stageX,
        newDatas.stageY,
        newDatas.background
      );
      // setup all shapes
      this.shapeService.processUpload(newDatas.shapes);

      // after re-init stage, we need to re-add events because it's a new object now
      this.addEventsToStage(this.layerService.stage);
    };
  }

  /**
   * Handle event with uploading the background for stage.
   * @param event
   * @returns
   */
  public uploadStageBackground(event: any) {
    event.preventDefault();
    if (event.target[1].files.length == 0) {
      // no file to upload - ignore event
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(event.target[1].files[0]);
    reader.onload = () => {
      this.layerService.setStageBackground(reader.result);
    };
  }

  /**
   * Add offset to the background so it can be moved without moving whole stage.
   * @param event contains X and Y for offset
   */
  public handleBackgroundOffsetChange(event: any) {
    event.preventDefault();
    var offsets = event.target[1].value.split(',', 2);
    this.layerService.setBackgroundOffset(offsets[0], offsets[1]);
  }

  /**
   * Setup the size of the stage.
   * @param event contains X and Y for offset
   */
  public handleStageSizeChange(event: any) {
    event.preventDefault();
    var size = event.target[1].value.split(',', 2);
    this.layerService.setStageSize(size[0], size[1]);
  }

  /**
   * Handle interaction with delete point from context menu.
   */
  public contextMenuDeletePoint() {
    if (!this.nearPoint) {
      // not properly setup data
      return;
    }

    this.shapeService.removePointFromShape(this.nearPoint);

    this.layerService.draw();
    this.hideContextMenu();
  }

  /**
   * Handle interaction with delete text from context menu.
   */
  public contextMenuDeleteText() {
    if (!this.nearText) {
      // not properly setup data
      return;
    }

    this.shapeService.removeText(this.nearText);

    this.layerService.draw();
    this.hideContextMenu();
  }

  /**
   * Handle interaction with add text from context menu.
   * @returns
   */
  public contextMenuAddText() {
    this.hideContextMenu();
    var input = prompt('Please enter the text');
    if (input == null || input == '') {
      // cover also cancel action
      return;
    }

    this.shapeService.createText(input, this.menuClickPoint);
  }

  /**
   * Handle interaction with close menu from context menu.
   */
  public contextMenuCloseMenuAction() {
    this.hideContextMenu();
  }

  private hideContextMenu() {
    this.menu.nativeElement.style.display = 'none';
  }
}

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
  @ViewChild('deleteTextMenu') deleteTextMenu: ElementRef;

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
  // TODO broken interaction with text shape
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
        // TODO BUG cannot finish when moved the shape
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
    this.deleteTextMenu.nativeElement.disabled = true;

    this.menuClickPoint = new Point(e.evt.offsetX, e.evt.offsetY);
    // TODO separate method for nearPoint
    var nearPoint = this.pointService.getNearPoint(
      this.shapeService.shapes,
      e.evt
    );

    if (nearPoint != null) {
      this.nearPoint = nearPoint;
      this.deletePointMenu.nativeElement.disabled = false;
    }

    // TODO separate method for nearText
    var nearText = this.pointService.getNearText(
      this.shapeService.shapes,
      e.evt
    );
    // TODO do I need to check if it's not null?
    if (nearText != null) {
      this.nearText = nearText;
      this.deleteTextMenu.nativeElement.disabled = false;
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

  /**
   * Handle event with uploading the background for stage.
   * @param event
   * @returns
   */
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

  /**
   * Add offset to the background so it can be moved without moving whole stage.
   * @param event contains X and Y for offset
   */
  public handleBackgroundOffsetChange(event: any) {
    var offsets = event.target.value.split(',', 2);
    this.layerService.setBackgroundOffset(offsets[0], offsets[1]);
  }

  /**
   * Setup the size of the stage.
   * @param event contains X and Y for offset
   */
  public handleStageSizeChange(event: any) {
    var size = event.target.value.split(',', 2);
    this.layerService.setStageSize(size[0], size[1]);
  }

  /**
   * Handle interaction with delete point from context menu.
   * @param event
   */
  public contextMenuDeletePoint(event: any) {
    if (!this.nearPoint) {
      // shouldn't be possible to click delete without near point but check it just in case
      return;
    }

    // TODO deleting single point from the polygon -> changing to be just a line
    // make sure it is saved properly in the json at the end
    this.shapeService.removePointFromShape(this.nearPoint);

    this.layerService.draw();
    this.updateCounters();
    this.hideContextMenu();
  }

  // TODO docs
  public contextMenuDeleteText(event: any) {
    console.log('clicked contextMenuDeleteText');
  }

  /**
   * Handle interaction with add text from context menu.
   * @param event
   * @returns
   */
  public contextMenuAddText(event: any) {
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
   * @param event
   */
  public contextMenuCloseMenuAction(event: any) {
    this.hideContextMenu();
  }

  private hideContextMenu() {
    this.menu.nativeElement.style.display = 'none';
  }
}

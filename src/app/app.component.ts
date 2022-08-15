import { AfterViewInit, ElementRef, Component, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pointCounter') pointCounter: ElementRef;
  @ViewChild('shapeCounter') shapeCounter: ElementRef;

  private shape: any;
  private shapes: any[] = [];
  private points: any[] = [];
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
  public clickedPoint(event: any) {
    var point = { x: event.offsetX, y: event.offsetY };

    if (this.shape === undefined) {
      this.startLine();
    }

    if (
      this.lastPoint !== undefined &&
      this.lastPoint.x === point.x &&
      this.lastPoint.y === point.y
    ) {
      this.stopLine();
    } else {
      this.continueLine(point);
    }
  }

  public movedMouse(event: any) {
    if (this.lastPoint === undefined) {
      // last point not defined so cannot draw a line
      return;
    }

    this.calculateLine({ x: event.offsetX, y: event.offsetY });
  }
  // END: Main interaction with canvas

  // START: shape actions
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

    //update the canvas
    this.layer.draw();
  }

  public continueLine(point: any) {
    console.log('CONTINUE the line');
    this.shape.attrs['points'].push(point.x, point.y);
    this.points.push(point);

    //update the canvas
    // TODO is working without it... should it be still here?
    this.layer.draw();
    this.updateCounters();
    this.lastPoint = point;
  }

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

  public saveShape(shape: any) {
    console.log('SAVING shape');
    // TODO find out how to detect 'line' and 'polygon'
    this.shapes.push({
      id: uuidv4(),
      type: 'line',
      points: shape.attrs['points'],
    });
    console.log(this.shapes[this.shapes.length - 1]);
  }

  public calculateLine(point: any) {
    console.log('Calculating line...');
    this.shape.attrs['points'].push(point.x, point.y);
    this.layer.draw();
    this.shape.attrs['points'].pop();
    this.shape.attrs['points'].pop();
  }

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
    a.download = 'demo.json';
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
        this.points.push({
          x: newDatas[i].points[j],
          y: newDatas[i].points[j + 1],
        });
      }
    }

    this.shapes = newDatas;
    this.updateCounters();
  }
  // END: Download and upload
}

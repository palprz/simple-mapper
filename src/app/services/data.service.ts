import { Injectable } from '@angular/core';
import { Shape } from '../models/shape.model';
import { ShapeService } from './shape.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(public shapeService: ShapeService) {}

  /**
   * Create HTML link and click it with generated JSON based on stored shapes.
   */
  public download() {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(
      new Blob([JSON.stringify(this.shapeService.shapes, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
    );
    a.download = 'simple-mapper-data.json';
    a.click();
  }
}

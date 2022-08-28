import { Injectable } from '@angular/core';
import { Shape } from '../models/shape.model';
import { StoreData } from '../models/store-data.model';
import { ShapeService } from './shape.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  /**
   * Create HTML link and click it with generated JSON based on stored shapes.
   * @param downloadDatas
   */
  public download(downloadDatas: StoreData) {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(
      new Blob([JSON.stringify(downloadDatas, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
    );
    a.download = 'simple-mapper-data.json';
    a.click();
  }
}

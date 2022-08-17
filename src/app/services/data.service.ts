import { Injectable } from '@angular/core';
import { Shape } from '../models/shape.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  
  // TODO read more about this: JSON.stringify
  // TODO bit doggy way ot downloading but well...
  public download(shapes: Shape[]) {
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(
      new Blob([JSON.stringify(shapes, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
    );
    a.download = 'simple-mapper-data.json';
    a.click();
  }
}

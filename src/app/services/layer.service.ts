import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({ providedIn: 'root' })
export class LayerService {
  private _layer: Konva.Layer;

  /**
   * Create the stage and save the created layer to the class field.
   * @returns created stage
   */
  public initStage() {
    var stage = new Konva.Stage({
      container: 'canvas-container',
      width: 800,
      height: 400,
    });

    this._layer = new Konva.Layer();
    stage.add(this.layer);

    return stage;
  }

  /**
   * Get the current layer of the stage.
   * @returns layer
   */
  get layer() {
    return this._layer;
  }

  /**
   * Draw (display latest changes) the layer
   */
  public draw() {
    this.layer.draw();
  }

  /**
   * Add shape to the layer
   * @param shape
   */
  public addShape(shape: any) {
    this.layer.add(shape);
  }

  /**
   * Remove all shapes from the layer.
   */
  public clear() {
    this.layer.removeChildren();
  }
}

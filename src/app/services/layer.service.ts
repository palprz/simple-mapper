import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';

@Injectable({ providedIn: 'root' })
export class LayerService {
  private _layer: Konva.Layer;
  private _stage: Stage;

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
    this.stage = stage;
    return stage;
  }

  // TODO docs
  public uploadStageBackground(imgURL: any) {
    this.stage.container().style.background = 'url(' + imgURL + ')';
    this.stage.container().style.backgroundSize = 'cover';
    this.stage.container().style.backgroundRepeat = 'no-repeat';
    // TODO add opacity - this isn't working because it's affecting everything, not: just a background
    this.stage.container().style.opacity = '0.2';
  }

  // TODO docs
  public setBackgroundOffset(offsetX: any, offsetY: any) {
    this.stage.container().style.backgroundPositionX = '' + offsetX + 'px';
    this.stage.container().style.backgroundPositionY = '' + offsetY + 'px';
  }

  /**
   * Get the current layer of the stage.
   * @returns layer
   */
  get layer() {
    return this._layer;
  }

  private set stage(stage: Stage) {
    this._stage = stage;
  }

  private get stage() {
    return this._stage;
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

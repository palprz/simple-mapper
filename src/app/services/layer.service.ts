import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Shape } from '../models/shape.model';

@Injectable({ providedIn: 'root' })
export class LayerService {
  private _layer: Konva.Layer;
  private _stage: Stage;

  /**
   * @returns created stage
   */
  /**
   * Create the stage and save the created layer to the class field.
   * @param stageX the width of the new stage
   * @param stageY the height of the new stage
   */
  public initStage(stageX = 800, stageY = 400) {
    var stage = new Konva.Stage({
      container: 'canvas-container',
      width: stageX,
      height: stageY,
    });

    // add CSS based on provided X and Y
    var container = document.getElementById('canvas-container');
    if (container != undefined) {
      container.style.width = stageX + 'px';
      container.style.height = stageY + 'px';
    }

    this._layer = new Konva.Layer();
    stage.add(this.layer);
    this.stage = stage;
  }

  /**
   * Override existing stage by the new stage with provided details of width and height.
   * @param stageX the width of the new stage
   * @param stageY the height of the new stage
   */
  public processUpload(stageX: number, stageY: number) {
    this.initStage(stageX, stageY);
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

  set stage(stage: Stage) {
    this._stage = stage;
  }

  get stage() {
    return this._stage;
  }

  get stageContainer() {
    return this._stage.container().getBoundingClientRect();
  }

  /**
   * Destroy the shape from the layer, so it will dissapear from the stage and will not cause memory leak.
   * @param shape to be removed from the layer
   * @returns
   */
  public destroyShape(shape: Shape) {
    var children = this.layer.getChildren();
    for (var i = 0; children.length > i; i++) {
      if (children[i].attrs['id'] == shape.id) {
        children[i].destroy();
        return;
      }
    }
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

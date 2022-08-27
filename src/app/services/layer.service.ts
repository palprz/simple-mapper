import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';
import { Background } from '../models/background.model';
import { Shape } from '../models/shape.model';

@Injectable({ providedIn: 'root' })
export class LayerService {
  private _layer: Konva.Layer;
  private _stage: Stage;
  private _background: Background;

  /**
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

    this.updateContainerSize(stageX, stageY);

    this._layer = new Konva.Layer();
    this._background = new Background();
    stage.add(this.layer);
    this.stage = stage;
  }

  /**
   * Update CSS for the stage container.
   * @param width
   * @param height
   */
  private updateContainerSize(width: any, height: any) {
    var container = document.getElementById('canvas-container');
    if (container != undefined) {
      container.style.width = width + 'px';
      container.style.height = height + 'px';
    }
  }

  /**
   * Override existing stage by the new stage with uploaded details.
   * @param stageX the width of the new stage
   * @param stageY the height of the new stage
   * @param background the offset and data for stage's background
   */
  public processUpload(stageX: number, stageY: number, background: Background) {
    this.initStage(stageX, stageY);
    this.setStageBackground(background.data);
    this.setBackgroundOffset(background.offsetX, background.offsetY);
  }

  /**
   * Set background for the stage
   * @param imgURL the data with background
   */
  public setStageBackground(imgURL: any) {
    this.stage.container().style.background = 'url(' + imgURL + ')';
    this.stage.container().style.backgroundSize = 'cover';
    this.stage.container().style.backgroundRepeat = 'no-repeat';
    this.background.data = imgURL;
  }

  /**
   * Set background's offset.
   * @param offsetX
   * @param offsetY
   */
  public setBackgroundOffset(offsetX: number, offsetY: number) {
    this.stage.container().style.backgroundPositionX = '' + offsetX + 'px';
    this.stage.container().style.backgroundPositionY = '' + offsetY + 'px';
    this.background.offsetX = offsetX;
    this.background.offsetY = offsetY;
  }

  /**
   * Set size of the stage.
   * @param width
   * @param height
   */
  public setStageSize(width: any, height: any) {
    this.stage.width(width);
    this.stage.height(height);
    this.updateContainerSize(width, height);
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

  get background() {
    return this._background;
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

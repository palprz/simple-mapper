import { Background } from './background.model';
import { Shape } from './shape.model';

export class StoreData {
  public stageX: number;
  public stageY: number;
  public shapes: Shape[];
  public background: Background;

  constructor(
    stageX: number,
    stageY: number,
    shapes: Shape[],
    background: Background
  ) {
    this.stageX = stageX;
    this.stageY = stageY;
    this.shapes = shapes;
    this.background = background;
  }
}

export class StoreData {
  public stageX: number;
  public stageY: number;
  public shapes: any;

  constructor(stageX: number, stageY: number, shapes: any) {
    this.stageX = stageX;
    this.stageY = stageY;
    this.shapes = shapes;
  }
}

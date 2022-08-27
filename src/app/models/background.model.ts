export class Background {
  private offsetX: number;
  private offsetY: number;
  private data: string;

  public getOffsetX(): number {
    return this.offsetX;
  }

  public setOffsetX(offsetX: number) {
    this.offsetX = offsetX;
  }

  public getOffsetY(): number {
    return this.offsetY;
  }

  public setOffsetY(offsetY: number) {
    this.offsetY = offsetY;
  }

  public getData(): string {
    return this.data;
  }

  public setData(data: string) {
    this.data = data;
  }
}

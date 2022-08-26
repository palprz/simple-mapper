export class Shape {
  public id: string;
  public type: string;
  public attrs: any;

  constructor(id: string, type: string, attrs: any) {
    this.id = id;
    this.type = type;
    this.attrs = attrs;
  }
}

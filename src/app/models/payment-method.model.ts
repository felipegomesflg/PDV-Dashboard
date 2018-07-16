export class PaymentMethod {

  constructor(){
    this.id = null;
    this.active = true;
    this.name = '';
    this.description = '';
  }

  public id?: string;
  public active: boolean;
  public name: string;
  public description: string;

}

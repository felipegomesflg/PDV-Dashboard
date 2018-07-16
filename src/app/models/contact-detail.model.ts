export class ContactDetail {
  constructor(){
    this.id = null;
    this.name = '';
    this.email = '';
    this.phone_number = '';
    this.firebase_path = '';
  }
  public id?: string;
  public name: string;
  public email: string;
  public phone_number: string;
  public firebase_path: string;
}

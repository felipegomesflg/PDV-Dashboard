import { Permission } from './permission.model';

export class AccountEmployee {

  constructor(){
    this.id = null;
    this.active = true;
    this.display_name = '';
    this.unique_identifier = '';
    this.pin_code = null;
    

  }
  public  id: string;
  public active:boolean;
  public display_name:string;
  public unique_identifier:string;
  public pin_code:number;
  public permission :permission_interface;
  

}

interface permission_interface{ [name:string] : Permission}


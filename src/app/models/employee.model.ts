import{Permission} from './permission.model';

export class Employee {

  constructor(){
    this.id = null;
    this.active = true;
    this.display_name = '';
    this.pin_code = null;
    this.unique_identifier = '';
    this.account_detail_id = '';
    this.account_id = '';
    
    
    

  }
  public  id: string;
  public active:boolean;
  public display_name:string;
  public pin_code:number;
  public unique_identifier:string;
  public account_detail_id:string;
  public account_id:string;
  public permission :permission_interface;
  
}

interface permission_interface{ [name:string] : Permission}

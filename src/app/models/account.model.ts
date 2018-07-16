import { AccountStore } from './account-store.model';
import { AccountType } from './account-type.model';

export class Account {

  constructor(){
    this.id = null;
    this.active = true;
    this.email = '';
    this.phone_number = ''; 
    this.password = '';
    this.display_name = '';
    this.photo_url = '';
    this.pin_code = '';
    this.unique_identifier = '';
    

  }
  public id:string;
  public active:boolean;
  public email:string;
  public phone_number:string;
  public password:string;
  public display_name:string;
  public photo_url:string;
  public pin_code:string;
  public unique_identifier:string;
  
  
  public account_parent :parent_interface;
  
  

}



export class AccountParent {
  constructor(){
    this.account_type_id = null ;
    this.active = true;
  }
  public active:boolean
  public account_detail_id:string;
  public account_id:string;
  public account_type_id :number;
  public account_store :store_interface;
}

interface store_interface{ [name:string] : AccountStore}
interface parent_interface{ [name:string] : AccountParent}
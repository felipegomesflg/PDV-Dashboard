import { ContactDetail } from './contact-detail.model';
import { Theme } from './theme.model';
import { BalanceAccount } from './balance-account.model';
import { City } from './city.model';

export class AccountDetail {

  constructor(){
    this.id = null;
    this.active = true;
    this.display_image = '';
    this.company_name = '';
    this.trade_name = ''; 
    this.unique_enterprise_number = '';
    this.address_1 = '';
    this.address_2 = '';
    this.postal_code = '';
    this.city = new City();
    this.city_id = null;
    this.contact_detail = new ContactDetail();
    this.theme_id = '81acbf7e-eda2-e711-8f02-00155d003a02';
    this.balance_account = new BalanceAccount();
    this.balance_account_id = '';
    this.contact_detail_id = '';
  }
  public  id: string;
  public active:boolean;
  public display_image:string;
  public company_name:string;
  public trade_name:string;
  public unique_enterprise_number:string;
  public address_1:string;
  public address_2:string;
  public postal_code:string;
  public city_id:number;
  public city : City;
  public contact_detail :ContactDetail  ;
  public theme_id : string; 
  public balance_account :BalanceAccount ;
  public balance_account_id:string; 
  public contact_detail_id:string;

}

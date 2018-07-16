import { StoreDetailCountry } from './store-detail-country.model';

export class StoreDetail {
  constructor(){
    this.id = '';
    this.value ='';
    this.store_id = '';
    this.store_detail_country_id = '';
    this.store_detail_country = new StoreDetailCountry();
  }
  public id?:string;
  public value: string;
  public store_id?: string;
  public store_detail_country_id?: string;
  public store_detail_country: StoreDetailCountry;
}

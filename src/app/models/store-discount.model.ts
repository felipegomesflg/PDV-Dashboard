import { Discount } from './discount.model';

export class StoreDiscount {
  public id?:string;
  public discount_id?:string;
  public store_id?:string;
  public discount: Discount;
}

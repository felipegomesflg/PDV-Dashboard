import { EventPaymentMethod } from './event-payment-method';
import { City } from './city.model';
import { BalanceAccount } from './balance-account.model';
//import { EventStore } from './event-Store.model';

export class Event {

  constructor(){
    this.active = true;
    this.address_1 = '';
    this.address_2 = '';
    this.account_detail_id = '';
    this.city_id = null;
    this.city = new City();
    //this.created_at = null;
    this.description = '';
    this.end_date = null;
    this.end_time = '';
    //this.event_store = new EventStore();
    this.id = null;
    this.name = '';
    this.number = null;
    this.postal_code = '';
    this.start_date = null;
    this.start_time = '';
    //this.update_at = null;
    this.balance_account = new BalanceAccount();
  }
  active: boolean;
  address_1: string;
  address_2: string;
  account_detail_id: string;
  city_id: number;
  city: City;
  //event_payment_method: eventPaymentMethod_interface;
  //created_at: number;
  description: string;
  end_date: any;
  end_time: string;
  //event_store: EventStore;
  id: string;
  name: string;
  number: number;
  postal_code: string;
  start_date: any;
  start_time: string;
  //update_at: number;
  balance_account: BalanceAccount;
}

//interface eventPaymentMethod_interface{ [name:string] : EventPaymentMethod}






// export class 2d6b408668b7E7119420005056bd139c {
//     store_id: string;
// }

// export class 43199b876ab7E7119420005056bd139c {
//     store_id: string;
// }





//  let dict: Map<number> = {};
//  dict["one"] = 1;

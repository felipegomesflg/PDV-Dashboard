import {PaymentAcquirer} from './payment-acquirer.model'
import { PaymentFee } from './payment-fee.model';

export class BillingAcquirerAgreement {
   constructor(){
      this.id = null;
      this.active = true;
      this.value = 0.0;
      this.payment_acquirer_code = '';
      this.payment_acquirer_id  =null;
      //this.payment_fee = new PaymentFee();
   }
  public id?: string;
  public active?: boolean;
  public value?: number;
  public payment_acquirer_code: string;
  public payment_acquirer_id?: string;
  public created_at?: number;
  public updated_at?: number;
  public payment_fee: Object;
}

interface paymentfee_interface{ [name:string] : PaymentFee}
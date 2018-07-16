import { ValueType } from './value-type.model';
import { BankDetail } from './bank-detail.model';
import { BillingSchedule }  from './billing-schedule.model';
import { BillingTransaction }  from './billing-transaction.model';
import {BillingAcquirerAgreement} from './billing-acquirer-agreement.model'
export class BillingContract {
  constructor(){
    this.id = null;
    this.contract_type = '';
    this.description = '';
    this.contract_url = '';
    this.bank_detail = new BankDetail();
    this.active = false;
    this.on_store_billing = false;
    this.value = 0.0;
    this.billing_acquirer_agreement  = new BillingAcquirerAgreement();

  }
  public id?:string;
  public value:number;
  public contract_type:string;
  public description:string;
  public contract_url:string;
  public active?: boolean;
  public on_store_billing: boolean;
  public bank_detail: BankDetail;
  public billing_acquirer_agreement : BillingAcquirerAgreement;
}

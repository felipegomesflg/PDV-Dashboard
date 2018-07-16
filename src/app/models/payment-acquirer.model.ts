import {ContactDetail} from './contact-detail.model'
import {BillingAcquirerAgreement} from './billing-acquirer-agreement.model';

export class PaymentAcquirer {
  constructor(){
    this.id = null;
    this.active = true;
    this.name = '';
    this.contact_detail_id = '';
    this.description = '';
    this.contact_detail = new ContactDetail();
  }
  public id?: string;
  public active?: boolean;
  public name: string;
  public description: string;
  public contact_detail_id: string;
  public contact_detail: ContactDetail;
  public billing_acquirer_agreement:arquirer_interface;

}
interface arquirer_interface{ [name:string] : BillingAcquirerAgreement}

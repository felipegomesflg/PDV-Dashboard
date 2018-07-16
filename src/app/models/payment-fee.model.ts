import { PaymentMethod } from "./payment-method.model";
import { PaymentBrand } from "./payment-brand.model";

export class PaymentFee {
    constructor(){
        this.id = null;   
        this.billing_acquirer_agreement_id = null;
        this.payment_brand_id = null;
        this.payment_method_id = null;
        this.acquirer_days = 0;
        this.acquirer_fee = 0.0;
        this.payout_days = 0;
        this.payout_fee = 0.0;
        this.payment_brand = new PaymentBrand();
        this.payment_method = new PaymentMethod();
    }
    public id?:string;   
    public billing_acquirer_agreement_id?:string;
    public payment_brand_id?:string;
    public payment_method_id?:string;
    public acquirer_days:number;
    public acquirer_fee:number;
    public payout_days:number;
    public payout_fee:number;
    public payment_brand: PaymentBrand;
    public payment_method: PaymentMethod;
}

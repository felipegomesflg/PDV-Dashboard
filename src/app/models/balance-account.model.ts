import { BillingContract }  from './billing-contract.model';

export class BalanceAccount {
  constructor(){
    this.balance = 0;
  //this.billing_contract = new Map<string,BillingContract>()
    
  }
  public balance:number;
  public billing_contract : billing_interface;
}

interface billing_interface{ [name:string] : BillingContract}

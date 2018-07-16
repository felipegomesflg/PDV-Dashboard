import { Bank } from './bank.model';

export class BankDetail {
  constructor(){
    this.id = '';
    this.account_number = '';
    this.account_type = '';
    this.agency_number = '';
    this.unique_identifier = '';
    this.bank_id = '';
    this.bank = new Bank();
    
  }
  public id?: string;
  public account_number: string;
  public account_type: string;
  public agency_number: string;
  public bank: Bank;
  public bank_id: string;
  public unique_identifier:string;
}


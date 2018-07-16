import { BalanceAccount } from './balance-account.model';
import { ContactDetail } from './contact-detail.model';
import { ProductCategory } from './product-category.model';
import { StoreDetail } from './store-detail.model';
import { StoreDiscount } from './store-discount.model';

export class Store {
  public constructor () {
    this.id = null;
    this.firebase_path = '';
    this.active = true;
    this.company_name = '';
    this.trade_name = '';
    this.unique_enterprise_number = '';
    this.display_image = '';
    this.contact_detail = new ContactDetail();
    this.balance_account = new BalanceAccount();
}

  public id: string;
  public firebase_path: string;
  public active: Boolean;
  public company_name: string;
  public trade_name: string;
  public unique_enterprise_number: string;
  public display_image: string;
  public contact_detail: ContactDetail;
  public balance_account: BalanceAccount;
}

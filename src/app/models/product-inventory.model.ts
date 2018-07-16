import { InventoryTransaction } from "./inventory-transaction.model";
import { Product } from "./product.model";

export class ProductInventory {
  constructor() {
    this.id = null;
    this.current_amount = null;
    this.minimum_amount = null;
     //public inventory_transaction: Map<string, InventoryTransaction>;
    this.product = new Product();
    this.firebase_path = '';
  }
  public id?: string;
  public current_amount: number;
  public minimum_amount?: number;
  public firebase_path: string;
  //public inventory_transaction: Map<string, InventoryTransaction>;//Array<{string, InventoryTransaction}>;
  public product: Product;
}

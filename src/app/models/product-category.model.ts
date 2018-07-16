import { ProductInventory } from './product-inventory.model';

export class ProductCategory {

  constructor(){
    this.id = null;
    this.firebase_path = '';
    //this.active = false;
    this.name = '';
    this.description = '';
    this.image = '';
    //this.product_inventory: Array<{string, ProductInventory}>;
  }

  public id?: string;
  public firebase_path: string;
  //public active: Boolean;
  public name: string;
  public description: string;
  public image: string;
  //public product_inventory: Array<{string, ProductInventory}>;
}

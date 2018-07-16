import { ProductDetail } from './product-detail.model';
import { map } from 'rxjs/operator/map';

export class Product {

  constructor(){

    this.id = null;
    this.active = true;
    this.name = '';
    this.value = null;
    this.cost_value = null;
    this.description = ''; 
    this.current_amount = null;
    this.minimum_amount = null;
    this.display_image = '';
    this.product_category_id = '';
    //this.product_detail: Map<string, ProductDetail>;
  }

  public id?: string;
  public firebase_path: string;
  public active: Boolean;
  public name: string;
  public value: number;
  public current_amount: number;
  public minimum_amount?: number;
  public cost_value?: number;
  public description: string;
  public display_image: string;
  public product_category_id: string;
  
  //public product_detail: Map<string, ProductDetail>;
}

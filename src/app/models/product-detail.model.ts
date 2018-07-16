import { ProductDetailCountry } from './product-detail-country.model';

export class ProductDetail {

  constructor(){}

  public id?: string;
  public value:string;
  public productId: number;
  public productDetailCountryId?: string;
  public productDetailCountry: ProductDetailCountry;
}

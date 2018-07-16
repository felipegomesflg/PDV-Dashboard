import { Country } from './country.model';
import { ValueType } from './value-type.model';

export class ProductDetailCountry {

  constructor(){}

  public id?: string;
  public country_id?: number;
  public name: string;
  public description: string;
  public value_type_id?: string;
  public value_type: ValueType
  public country: Country;
}

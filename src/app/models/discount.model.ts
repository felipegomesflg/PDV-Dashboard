import { ValueType } from './value-type.model';

export class Discount {
  public id?: string;
  public active?:Boolean;
  public name:string;
  public description:string;
  public value?: number;
  public value_type_id:string;
  public value_type: ValueType;
}

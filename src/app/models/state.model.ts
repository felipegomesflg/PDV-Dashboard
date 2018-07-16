import { Country } from './country.model';


export class State {

    constructor(){
      this.abbreviation = '';
      this.country = new Country();
      this.ibge = null;
      this.id = null;
      this.name = '';
    }
    abbreviation: string;
    country: Country;
    ibge: number;
    id: number;
    name: string;
  }

import { State } from './state.model';


export class City {

    constructor(){
      this.ibge = null;
      this.id = null;
      this.name = '';
      this.state = new State();
    }
    ibge: number;
    id: number;
    name: string;
    state: State;
  }

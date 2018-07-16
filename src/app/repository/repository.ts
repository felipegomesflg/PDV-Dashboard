import { Http, Response } from "@angular/http";

import { IRepository } from "./irepository.model";

export class Repository<T> {
  private _uri: string;
  get result(): string {
    return this._uri;
  }

  constructor(public Arg: string, private http: Http) {
    this._uri = Arg;
  }

  List(options: any) {
    return this.http.get(this._uri, options).map(res => res.json());
  }

  Add(entity: T, options: any) {
    //console.log(options);
    //console.log(JSON.stringify(entity));
    return this.http
    .post(this._uri, JSON.stringify(entity), options)
    .map(res => res.json());
  };

  Delete(options: any){ 
    return this.http.delete(this._uri, options).map(res => res.json());
  };

  Update(entity: T, options: any){
    //console.log(options);
    //console.log(JSON.stringify(entity));
    return this.http
    .put(this._uri, JSON.stringify(entity), options)
    .map(res => res.json());
  };

  FindById(options: any, handleError: any) {
    return this.http
      .get(this._uri, options)
      .map((res: Response) => {
        return res.json();
      })
      .catch(handleError);
  }
}

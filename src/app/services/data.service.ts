import { Injectable } from "@angular/core";

import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { LocalStorageService } from 'angular-2-local-storage';
import { config,host} from '../app.environment';

import { IRepository } from "../repository/irepository.model";
import { Repository } from "./../repository/repository";

@Injectable()
export class DataService {
  private headers: any;
  public options: any;
  private baseUrlFirabase: any;
  private baseUrl: any;
  private handleError: any;



  constructor(private http: Http, public localStorage: LocalStorageService) {
    this.baseUrlFirabase = config.firebaseConfig[host];
    this.baseUrl = config.baseUrl[host];
    this.headers = new Headers();
    this.headers.append("Content-Type", "application/json");
    this.headers.append('Access-Control-Allow-Methods', '*');
    //console.log('Bearer', this.localStorage.get('token'));
    this.createOption(this.localStorage.get('token'))//seta bearer e cria options

    // this.headers.append('Bearer', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2YTk0YWY2M2FlZjBjNzBlZjlkZGY3MDNmYjM4NDcwYmJjZDg1MDUifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcGFnYWxlZS1kZXYiLCJuYW1lIjoiRmVsaXBlIEdvbWVzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9IOXlBSXNaWXFiSU9oX0UxT045MGNoVmhPNlNZU0Q2dWNWLVhpclpYa01GRHFMUmpHb3p0b2JheHgxWFM5Q0I0bGZnIiwiYXVkIjoicGFnYWxlZS1kZXYiLCJhdXRoX3RpbWUiOjE1MDgzMzczOTEsInVzZXJfaWQiOiI0MzE5ZjFkOC0xMmI0LWU3MTEtOWE5MS0wMDE1NWQwMDNhMDIiLCJzdWIiOiI0MzE5ZjFkOC0xMmI0LWU3MTEtOWE5MS0wMDE1NWQwMDNhMDIiLCJpYXQiOjE1MDgzMzczOTMsImV4cCI6MTUwODM0MDk5MywiZW1haWwiOiJmZWxpcGVnb21lc2ZsZ0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiZmVsaXBlZ29tZXNmbGdAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.Er2Z6kzX0X0Qs1BXkufhC4xrumydagd35gNwhtY-EEx2OMAzH0S3nV3GDYaz1m0T1lSDmPw24WR_mg9iv3T4kY9C1GGtN-dMG0haUwxVRzcpOowjBuD6EgEMWWQU8c4uxqMdIuCCYswIkFZ-oFqTGiomjkr7tqHS4FgFjLDe0CCI1PPUe1QsTCLmnApxSbgoNB_bJK7gl6UoW4BIGbGqp8ca5fAGrDIM7Uvn0Xq0eamJCzMXoxiqlkMJSVf4FcZCFnunMSIim4thtXOp_2zK-2E7i43UqZ6KolKZJQ9Tbz1ktydI_ne9fGO2vIydV2MTICD8_b4GPfWJUHz2gQkGAg');

  }

  createOption(bearer){
    if(!bearer){ //caso o mesmo nao exista ainda no storage, retornara false, e sera setado no momento do login
      this.options = new RequestOptions({ headers: this.headers });
      return false;
    }
    console.log(bearer)
    this.headers.set('Authorization', 'Bearer '+ bearer);
    this.options = new RequestOptions({ headers: this.headers });
  }

  getBaseUrl(path, isUrlFirebase: boolean = false) {
    if (path) return isUrlFirebase ? this.baseUrlFirabase.databaseURL + "/" + path : this.baseUrl + "/" + path;
    else return isUrlFirebase ? this.baseUrlFirabase.databaseURL : this.baseUrl;
  }

  getList(path) {
    let repository = new Repository<any>(
      this.getBaseUrl(path),
      this.http
    );
    console.log(path);
    return repository.List(this.options);
  }

  GetById(id: any) {

      let repository = new Repository<any>( this.getBaseUrl(id), this.http);
      return repository.FindById(this.options, this.handleError);
  }

  addEntity(entity: any, id: any, isUrlFirebase: boolean = false) {
      let repository = new Repository<any>(this.getBaseUrl(id, isUrlFirebase), this.http);
      return repository.Add(entity, this.options);
  }

  update(entity: any, id: any) {
      let repository = new Repository<any>( this.getBaseUrl(id), this.http);
      return repository.Update(entity, this.options);
  }

  delete(id) {
    //console.log(this.options);
    let repository = new Repository<any>( this.getBaseUrl(id), this.http);
    return repository.Delete(this.options);
  }


  jsonToModel(json,instance,varRet) {
    if(!json)
      return false;
    Object.keys(instance).map((objectKey, index) => {
          if(typeof instance[objectKey] === 'object' && instance[objectKey]!=null ){
            this.jsonToModel(json[objectKey],instance[objectKey],varRet[objectKey])
          }else{
            varRet[objectKey] = json[objectKey]
          }

    });

}
}

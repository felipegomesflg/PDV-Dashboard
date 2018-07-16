import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { LocalStorageService } from 'angular-2-local-storage';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { DataService } from './data.service';
import { ComumService } from "./comum.service";

@Injectable()
export class AuthGuard implements CanActivate {

  userLoggedEmitter = new EventEmitter<boolean>();
  loginFailure = new EventEmitter<boolean>();
  bearer: any;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private localStorageService: LocalStorageService,
    private comum: ComumService,
    private dataService: DataService) { }

  canActivate(): Observable<boolean> {
    return Observable.from(this.auth.authState)
      .take(1)
      .map(state => !!state)
      .do(authenticated => {

        if (!authenticated) {
          this.router.navigate(['/login']);
          this.userLoggedEmitter.emit(false);
        } else {
          this.userLoggedEmitter.emit(true);
        }
      })
  }

  loginEmail(email: string, password: string) {
    let token;
    this.auth.auth.signInWithEmailAndPassword(email, password).then(
      (success) => {
        this.comum.globalLoading = true;
        this.auth.auth.currentUser.getIdToken(true).then(a => {
          token = a;
          this.localStorageService.set('token', token); //seta token no storage
          this.dataService.createOption(token);//seta token no options do dataService no momento do login
          this.localStorageService.set('email', email);
          this.reloadAccounts();
        });
        //this.bearer =
        //this.router.navigate(['/']);
      }).catch(
        (err) => {
          this.loginFailure.emit(true);
          //console.log(err);
        })
  }

  reloadAccounts() {
    this.auth.authState.take(1).subscribe(af => {
      if (!this.localStorageService.get('email'))
        return false;

      let dataSend = {
        id: af.uid,
        email: this.localStorageService.get('email')
      }
      this.dataService.addEntity(dataSend, 'v1/accounts/parents').take(1).subscribe(ret => {   //pega os paths q ele tem acesso
        let paths = [];
        this.comum.accountDetailAndType = [];
        Object.keys(ret.result.parent).map((objectKey, index) => {
          paths.push(ret.result.parent[objectKey]);
          this.comum.accountDetailAndType.push({ account_type: ret.result.parent[objectKey].account_type, account_detail_id: ret.result.parent[objectKey].account_detail_id, company_name: ret.result.parent[objectKey].company_name, uid: dataSend.id });
        });

        this.localStorageService.set('pathArray', paths);
        this.comum.pathArrayGet = paths;

        if (!this.localStorageService.get('path'))
          this.comum.pathGet = paths[0].firebase_path;
        else {
          let temp = this.localStorageService.get('path');
          this.comum.pathGet = temp;
        }
          this.dataService.addEntity(dataSend,'v1/accounts/parents').take(1).subscribe(ret=>{   //pega os paths q ele tem acesso
            let paths =[];
            this.comum.accountDetailAndType =[];
            Object.keys(ret.result.parent).map((objectKey, index)=> {
                paths.push(ret.result.parent[objectKey]);   
                this.comum.accountDetailAndType.push({account_type: ret.result.parent[objectKey].account_type, account_detail_id: ret.result.parent[objectKey].account_detail_id, company_name: ret.result.parent[objectKey].company_name, uid: dataSend.id});                
            });

              this.localStorageService.set('pathArray',paths);
              this.comum.pathArrayGet = paths;                         

              if(!this.localStorageService.get('path')){
                  this.comum.pathGet = paths[0].firebase_path;
              } 
              else {
                let temp = this.localStorageService.get('path');
                this.comum.pathGet = temp;
              }
              this.comum.getAccountType();
          },err=>{
          console.log(err);
          })
      })
    })
  }

  logout() {
    try {
      this.localStorageService.clearAll();
      this.auth.auth.signOut();
      this.userLoggedEmitter.emit(false);
      this.router.navigate(['/login']);
    }
    catch (err) {
      console.log(err);
    }
  }
}

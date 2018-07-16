//import { version } from "punycode";
import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { Router, RoutesRecognized, NavigationEnd,ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';

import { LocalStorageService } from "angular-2-local-storage";
import { ToastsManager } from "ng2-toastr/ng2-toastr";

import { AuthGuard } from "./services/auth.service";
import { isDev,version } from "./app.environment";
import { ComumService } from "./services/comum.service";
import { Intercom } from "ng-intercom";

import {resource} from './services/resource.service';

import * as moment from "moment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  collapsed: boolean = false;
  

  private path: any;
  

  private pathArray: any;
  private isDev: boolean=false;
  private version:any;
  private loggedAcc: any;
  private accArray: Array<any> = [];

  private showStore :boolean;

  public resource:any;
  

  constructor(
    public af: AngularFireAuth,
    public db: AngularFireDatabase,
    private authService: AuthGuard,
    private comum: ComumService,
    private localStorage: LocalStorageService,
    private router: Router,
    route: ActivatedRoute,
    private vcr: ViewContainerRef,
    public toastr: ToastsManager,
    location: Location) {   

    this.isDev = isDev;
  
    this.version = version;
  
    this.toastr.setRootViewContainerRef(vcr);
    
    this.path = this.localStorage.get("path");

    this.comum.path.subscribe(path => {
      //debugger;
      this.loadData(path); 
    });
    if(this.path)
          this.loadData(this.path);
    else{
      this.comum.globalLoading = false;
      this.logout();
    }
  
    // router.events.subscribe(val=>{ //pega os parents a cada vez que muda de rota (concordo? não.)
    //   if(val instanceof RoutesRecognized){
    //     this.toggleStore(val.url)       
    //     this.authService.reloadAccounts();
    //   }
    // })

    
    router.events.subscribe((val) => {
      if(location.path() != ''){
        for(var i in resource.menu){
          if(resource.menu[i]['routerLink'] && resource.menu[i]['routerLink'] == location.path()){
            this.comum.activeResource = resource.menu[i];
          }
        }
      }
      if(!this.comum.activeResource) 
        this.comum.activeResource = resource[i];
    });
    

  }

   ngOnInit() {   
     
     this.resource = resource;
  //  console.log(this.comum.userLang);
    this.comum.menuToggle.subscribe(show => (this.collapsed = !this.collapsed));
    let versionLocalStorage = this.comum.getVersion();
      
      if (!versionLocalStorage || versionLocalStorage === this.version) {
        this.comum.setVersion(this.version);
      } else {
        this.comum.alertInfo('Sistema foi atualizado, por favor efetue o login novamente','Atenção')
        this.logout();
      }

      
  }

  ngOnDestroy(){
    this.comum.path.unsubscribe();
    this.comum.pathArray.unsubscribe();
    this.comum.storeid.unsubscribe();
  }


  loadData(path) { 
    if(this.comum.getVersion() == null)
      this.comum.setVersion(this.version);
    
    this.comum.globalLoading = true;
    this.pathArray = this.localStorage.get("pathArray");
    
    if(this.pathArray.length==0){
      this.comum.globalLoading = false;
      //this.logout();
      return false;
    }
    this.af.authState.subscribe(auth => {
      if (auth && path) {
          if(this.pathArray[0].account_type.id == 1) //CASO SEJA ADMINISTRADOR PAGALEE
            path = path.split('account_detail')[0]+'account_detail/ea2fc641-9ba7-e711-8f02-00155d003a02';
            this.db.object(path + "/account/" + auth.uid).subscribe(a => {
              let account_type;
                Object.keys(a.account_parent).map((key, index) => {
                  if(a.account_parent[key].firebase_path == path)
                    account_type = a.account_parent[key].account_type
              });
              if(path && account_type){
                this.loggedAcc = a;
                this.loggedAcc['account_type'] = account_type;
              }
              this.comum.intercom.boot({
                name: a.display_name, 
                email: a.email,
                user_id: a.id,
                created_at: moment().unix()     
              });
             
              this.comum.globalLoading = false;
            });
          
       
      } else {
        this.comum.intercom.shutdown();
        this.comum.intercom.hide();
        this.loggedAcc = undefined;
        this.comum.globalLoading = false;
      }
    });
  }

  toggleStore(url){
    //console.log(url);
    let show = false;
    switch(url){
      case '/products': show = true;
      break;
      case '/users': show = true;
      break;
      case '/sales': show = true;
      break;
    }
    this.showStore = show;
  }
  logout() {
    this.authService.logout();
    this.localStorage.clearAll();
  }


}

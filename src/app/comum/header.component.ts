import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { LocalStorageService } from 'angular-2-local-storage'

import { ComumService } from '../services/comum.service';
import{AuthGuard} from '../services/auth.service';

@Component({
    selector: 'app-header',
    template: `
  <header id="navbar">
    <div id="navbar-container" class="boxed">
        <!--    
        <div class="navbar-header">

            <div id="dropdown-header" class="dropdown navbar-top-links">
                <a href="#" data-toggle="dropdown" class="dropdown-toggle text-center dropdown-menu-md" *ngIf="currentAcc" title="{{currentAcc.trade_name}}" >
                    <img  [src]= "currentAcc.display_image" alt="{{currentAcc.trade_name}}" class="brand-icon padding-5" >
                    <div class="brand-title">
                        <span class="brand-text">{{currentAcc.trade_name}}</span>
                    </div>
                </a>


                <div class="dropdown-menu dropdown-menu-md dropdown-menu-left panel-default">
                    <ul class="head-list">
                        <li *ngFor="let p of accList">
                            <a (click)="changeAcc(p.id)">
                                <span class="">
                                <img class="img-logo padding-5" src="{{p.display_image}}">

                                </span> {{p.trade_name}}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        -->
        <div class="navbar-content clearfix">
            <ul class="nav navbar-top-links pull-left">
                <li class="tgl-menu-btn">
                    <a class="mainnav-toggle hand" (click)="toggleMenu()">
                        <i class="demo-pli-view-list"></i>
                    </a>
                </li>
                <!--
                <li class="dropdown">
                    <a href="#" data-toggle="dropdown" class="dropdown-toggle">
                        <i class="demo-pli-bell"></i>
                        <span class="badge badge-header badge-danger"></span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-md">
                        <div class="pad-all bord-btm">
                            <p class="text-semibold text-main mar-no">You have 9 notifications.</p>
                        </div>
                        <div class="nano scrollable">
                            <div class="">
                                <ul class="head-list">
                                    <li>
                                        <a class="media" href="#">
                                            <div class="media-body">
                                                <div class="text-nowrap">HDD is full</div>
                                                <small class="text-muted">50 minutes ago</small>
                                            </div>
                                        </a>
                                    </li>

                                </ul>
                            </div>
                        </div>
                        <div class="pad-all bord-top">
                            <a href="#" class="btn-link text-dark box-block">
                                <i class="fa fa-angle-right fa-lg pull-right"></i>Show All Notifications
                            </a>
                        </div>
                    </div>
                </li>
                -->

            </ul>
            <ul class="nav navbar-top-links pull-right">
                <!--
                <li>
                    <a class="hand" title="Ajuda">
                        <span class="pull-left"><i class="demo-pli-information icon-lg"></i></span>
                        <span class="slide-show">Ajuda</span>
                    </a>
                </li>
                -->
                <li>
                    <a class="hand" title="Sair" (click)="logout()">
                        <span class="pull-left"><i class="demo-pli-unlock icon-lg"></i></span>
                        <span class="slide-show">Sair</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</header>
  `
})
export class HeaderComponent implements OnInit {
    constructor(
        private authService: AuthGuard,
        private comum: ComumService,
        private db: AngularFireDatabase,
        private localStorage: LocalStorageService,
        private router: Router
    ) { }
    @Input('loggedAcc') loggedAcc:any;
    @Input('showStore') showStore:boolean;

    private storeid: any;


    private currentStore: any;
    private currentAcc: any;
    private path: any;
    private pathArray: any;
    private accImage: any;
    private accName: any;
    private storeList: Array<any> = [];
    private accList: Array<any> = [];
    ngOnInit() {
        // console.log(this.showStore);
        this.path = this.localStorage.get('path');


        // this.comum.path.subscribe(val => {
        //     this.loadData(val);
        // })

        // this.comum.path.subscribe(val => {
        //     this.loadAccList(val);
        // })
       
        // this.comum.pathArray.subscribe(val => {
        //     this.loadAccList();
        // })

        // if(this.path)
        //     this.loadAccList(this.path);

        // if(this.path)
        //     this.loadData(this.path);

    }

    ngOnChanges() {
    }

    // loadData(val) {

    //   if(!val)
    //     return false;
    //    this.loadAccList(val);

    //     if(this.currentAcc && this.currentAcc.account_store && (this.currentAcc.account_type.id==4 || this.currentAcc.account_type.id==5)){

    //         Object.keys(this.currentAcc.account_store).map((objectKey, index) => {
    //         let prod = this.currentAcc.account_store[objectKey];

    //         this.currentStore = prod;
    //         this.comum.storeGet = prod.id;
    //         });

    //     }

    //     this.db.list(val + '/store').subscribe(a => {

    //         this.storeid = this.localStorage.get('storeid');
    //         let firstID;
    //         this.storeList = [];
    //         this.currentStore = null;
    //         if (a.length > 0) {
    //             firstID = a[0]['id']; //pegar primeiro ID para caso de redirect
    //             a.forEach(element => {
    //                 this.storeList.push(element)
    //                 if (this.storeid && element.id == this.storeid) {
    //                     this.currentStore = element;
    //                 }
    //                 if(!this.storeid){

    //                     this.comum.storeGet = element.id;
    //                 }
    //             });
    //         }
    //         // }else{
    //         //     this.comum.storeGet = '';
    //         //     this.router.navigate(['/store']);
    //         // }

    //         if ((!this.storeid || !this.currentStore) && this.storeList.length > 0) { //redirecionar para o primeiro id caso não tenha id, ou o id selecionado nao exista
    //             //this.router.navigate(['/dashboard/'+a[0]['id']]);
    //             this.comum.storeGet = a[0]['id'];
    //             this.currentStore = a[0];
    //         }
    //     });
    // }

    // loadAccList(val = null){
    //      this.accList = [];
    //     this.pathArray = this.localStorage.get('pathArray');
    //     this.pathArray.forEach(p => {
    //         this.accList.push({ id: p.firebase_path, trade_name: p.trade_name, display_image: p.display_image });

    //         if (val && p.firebase_path == val) {
    //             this.currentAcc = p;
    //         }

    //         //if(this.currentAcc && this.currentAcc.account_store && (this.currentAcc.account_type.id==4 || this.currentAcc.account_type.id==5)){
    //             // if(this.currentAcc && this.currentAcc.account_store && (this.currentAcc.account_type.id==4 || this.currentAcc.account_type.id==5)){

    //             // Object.keys(this.currentAcc.account_store).map((objectKey, index) => {
    //             // let prod = this.currentAcc.account_store[objectKey];
    
    //             // this.currentStore = prod;
    //             //this.comum.storeGet = prod.id;
    //             //});            
    //         //}

    //     });
    // }
    // changeStore(el) {
    //     this.currentStore = el;
    //     this.comum.storeGet = el.id;
    //     //this.router.navigate(['/dashboard/'+el.id]);
    // }

    // changeAcc(acc) {
    //     this.comum.pathGet = acc;
    // }

    logout(){
        if(this.comum.confirm('Deseja sair do sistema?')){
            this.authService.logout();
        }
  }
    toggleMenu() {
        this.comum.toggleMenu();
        this.comum.toggleMenuSm();
    }
}

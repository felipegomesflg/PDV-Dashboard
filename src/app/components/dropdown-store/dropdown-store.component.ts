import { Component, OnInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from 'angularfire2/database';
import { Select2OptionData } from 'ng2-select2';
import { LocalStorageService } from 'angular-2-local-storage';

import { DataService } from "./../../services/data.service";
import { ComumService } from '../../services/comum.service';

import { AfterViewChecked } from "@angular/core/src/metadata/lifecycle_hooks";



@Component({
    selector: 'app-dropdown-store',
    templateUrl: './dropdown-store.component.html'
})
export class DropdownStoreComponent implements OnInit, AfterViewChecked {
    @Output() changeDataStore: EventEmitter<any> = new EventEmitter(); // acho que era pra resolver problema assync
    @Input() hasAll; // se for true, adicionar opcao de todas as lojas

    private path: any;
    private SelectedStore: any;
    private selectStoreList: Array<Select2OptionData>;
    //private storeList: Array<any> = [];
    private accList: Array<any> = [];
    private pathArray: any;
    private currentAcc: any;
    //private currentStore: any;
    private storeid: any;
    public releaseEvent: boolean = false;

    constructor(
        private localStorage: LocalStorageService,
        public af: AngularFireAuth,
        private comum: ComumService,
        private db: AngularFireDatabase,
        private dataService: DataService,
        private ref: ChangeDetectorRef,
        private router: Router) { }

    ngOnInit() {
        this.path = this.localStorage.get('path');
        this.pathArray = this.localStorage.get('pathArray');
        this.comum.path.subscribe(val => {
            this.loadData(val, true);
        });
        this.loadData(this.path, true);
    }

    setSelectedStore(el) {

        let storeid = this.localStorage.get('storeid');
        if (el.value == "0") // opcao todas marcada, storeid = 0 significa buscar todas as lojas
            this.comum.storeGet = "0";
        if (el.value !== '') {
            if (this.storeid || !storeid) //caso tenha storeid vindo do set inicial ou não tenha ainda storeid setado no storage
                this.comum.storeGet = el.value;
            else
                this.SelectedStore = this.storeid = storeid  //seta storeid como marcação de que é a o set inicial
        }
    }

    loadData(val, isPathSubscribe = false) {
        let tempPath = '';
        this.comum.getAccountType();

        this.af.authState.take(1).subscribe(auth => {
            this.db.list(val + '/store').take(1).subscribe(a => { //pega todas as stores do path selecionado
                if (this.comum.accountTypeId == 5) { //caso usuario seja dono de loja, compara com as lojas que ele tem acesso    
                    let tempStore = [];
                    this.db.list(val + '/account/' + auth.uid + '/account_parent/').take(1).subscribe(x => {

                        x.forEach(element => {
                            if (element.account_store) {
                                Object.keys(element.account_store).map((key) => {

                                    a.forEach(all => {
                                        if (all.id == element.account_store[key].store_id)
                                            tempStore.push(all);
                                    });
                                });
                            }
                        });
                        this.selectStoreList = this.comum.setSelect2(tempStore, "id", "trade_name", false);
                    });
                } else { //caso nao seja dono de loja, ve todas as lojas do path selecionado
                    this.selectStoreList = this.comum.setSelect2(a, "id", "trade_name", false);
                }
                if (this.hasAll && this.selectStoreList)
                    this.selectStoreList.unshift({ id: '0', text: "Todas" });
            });
        });

    }

    ngAfterViewChecked(): void {
        this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
    }

    selectFirstorNavigate(storeList, isPathSub = false) {
        let currentStore = null;
        if (storeList.length > 0) {
            storeList.forEach(element => {
                if (this.storeid == element.id)
                    currentStore = element
            });
            if ((this.storeid && !currentStore) || !this.storeid)
                this.SelectedStore = this.selectStoreList[0].id;
            else
                this.SelectedStore = currentStore.id;
        } else if (this.comum.accountTypeId !== 1) {
            this.router.navigate(['/store']);
        }
    }

}

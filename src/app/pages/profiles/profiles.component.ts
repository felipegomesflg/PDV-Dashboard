import { Component, OnInit } from "@angular/core";

import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { LocalStorageService } from 'angular-2-local-storage';
import { ComumService } from "../../services/comum.service";
import { Account } from "../../models/account.model";
import { forEach } from "@angular/router/src/utils/collection";
import { DataService } from "./../../services/data.service";

@Component({
  selector: "app-profiles",
  templateUrl: "./profiles.component.html",
  styleUrls: ["./profiles.component.scss"]
})
export class ProfilesComponent implements OnInit {

  constructor(
    public af: AngularFireAuth,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService) { }

  private path: any;
  private pathArray: any;
  private profileData: Account = new Account();
  private parentData: any = [];
  private TempVar;

  loadUserData() {
    this.af.authState.subscribe(auth => {
      if(this.pathArray[0].account_type.id == 1 || this.pathArray[0].account_type.id == 2) //CASO SEJA ADMINISTRADOR PAGALEE
            this.path = this.path.split('account_detail')[0]+'account_detail/ea2fc641-9ba7-e711-8f02-00155d003a02';
      if (auth) {
        this.db.object(this.path + '/account/' + auth.uid).subscribe(el => {
          this.profileData = el;
          this.parentData = [];
            Object.keys(el.account_parent).map((key, index) => {
              let obj = [];
              obj['account_type_name'] = el.account_parent[key].account_type.name;
              obj['account_detail_id'] = el.account_parent[key].account_detail_id;
              obj['store'] = [];
              this.pathArray.forEach(p => {
                if (p.account_detail_id == obj['account_detail_id']) {
                  obj['trade_name'] = p.trade_name; // nome fantasia contratante 
                  obj['company_name'] = p.company_name; // razao social contratante
                  obj['display_image'] = p.display_image; // img contratante
                }
              });
              obj['account_type_id'] = el.account_parent[key].account_type_id;
              if (el.account_parent[key].account_store) {
                Object.keys(el.account_parent[key].account_store).map((key2, index) => {
                  let cfpCnpj = el.account_parent[key].account_store[key2].unique_enterprise_number;
                  el.account_parent[key].account_store[key2].unique_enterprise_number = this.comumService.fCnpjCpf(cfpCnpj);
                  obj['store'].push(el.account_parent[key].account_store[key2]); // obj['store'] -> dados das lojas

                });
                this.parentData.push(obj);
              }
            });
        });
      }
    });

  }

  uploadDisplayImage(evt) {
    var files = evt.target.files;
    var file = files[0];

    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }
  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.profileData["photo_url"] =
      "data:image/jpg;base64," + btoa(binaryString);
    this.saveData();
  }

  saveData() {
    this.comumService.loading = true;
    this.dataService.update(this.profileData, 'v1/accountdetails/' + this.path.split('account_detail/')[1] + '/accounts/' + this.profileData.id)
      .subscribe(val => {
        this.comumService.displayImage.emit(this.profileData.photo_url);
        this.comumService.loading = false;
      },
      Error => {
        this.comumService.errorModal('Ocorreu um Erro');
        //console.log(JSON.stringify(this.profileData));
        console.log(Error);
      });

  }

  ngOnInit() {
    this.path = this.localStorage.get("path");
    this.pathArray = this.localStorage.get("pathArray");
    this.loadUserData();
  }


}
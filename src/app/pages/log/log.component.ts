import { Component, OnInit,ViewChild,Renderer } from '@angular/core';

import { NgbModal, ModalDismissReasons, NgbCalendar,NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from "angularfire2/auth";
import { LocalStorageService } from 'angular-2-local-storage'
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Select2OptionData } from 'ng2-select2';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';


import { ComumService } from '../../services/comum.service';
import { DataService } from "./../../services/data.service";


import * as moment from 'moment';



@Component({
  selector: 'app-sale',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

  

  constructor(private calendar: NgbCalendar,
    private location: Location,
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer,
    public af: AngularFireAuth,
  ) {
    // let dStart = this.comumService.formDateApi(this.calendar.getPrev(this.calendar.getToday(), 'd', 8));
    // let dEnde = this.comumService.formDateApi(this.calendar.getPrev(this.calendar.getToday(), 'd', 1));
    
  }

  private ready: boolean = false;
  private eventID: any;
  private eventList: any[];
  
  private userStores: any[]; //loja do usuario caso ele seja dono de loja (tipo 5)
  private eventStores: any[];
  private eventStoreID: any;

  private filterPeriod: boolean = false;


  private columns: Array<any> = [
    { title: 'Data', name: 'date', sort: 'desc' , 
    filtering: { 
      filterString: "",
      placeholder: "Data" 
    } },
    { title: 'Usuário', name: 'request_user_email',
    filtering: { 
      filterString: "",
      placeholder: "Nome" 
    } },
    { title: 'Requisição', name: 'request_action', className:"minimal",
    filtering: { 
      filterString: "",
      placeholder: "Requisição" 
    }},
    { title: 'Caminho', name: 'request_path', 
    filtering: { 
      filterString: "",
      placeholder: "Caminho" 
    }},
    { title: 'IP', name: 'request_user_ip',
    filtering: { 
      filterString: "",
      placeholder: "IP" 
    }},
    { title: 'Status', name: 'response_status_code', 
    filtering: { 
      filterString: "",
      placeholder: "Status" 
    }},
    { title: 'Resposta', name: 'success', className:"minimal",
    filtering: { 
      filterString: "",
      placeholder: "Resposta" 
    }},
    { title: 'Versão', name: 'version', className:"minimal",
    filtering: { 
      filterString: "",
      placeholder: "Versão" 
    }}
  ];

  private dataLog: Array<any> = []; 
  EditData:any;
  private groupByID: any;
  private path: any;
  private pathArray:any;
  private storeid: any;

  public ModelstartDate: NgbDateStruct;
  ngOnInit() {
    this.path = this.localStorage.get("path");
    this.ModelstartDate = this.comumService.formDateView(moment().format('DD/MM/YYYY'));
    
   this.loadData();
  }
loadData(){
  var date = moment().format('DD/MM/YYYY');
  if(this.renderer.selectRootElement("#startDate").value)
    date = this.renderer.selectRootElement("#startDate").value;

    date = this.comumService.formDatetoMoment(date).replace('-','').replace('-','');
  
  
  this.db.list(this.path.split('account_detail')[0] + "log/"+date).subscribe(a => {
    this.dataLog = [];
    a.forEach(element => {
      element.date = moment.unix(element.timestamp).format('DD/MM/YYYY HH:MM');
      element.version = element.response_body.version;
      element.success = element.response_body.success;
      element.request_user_ip = element.request_user_info.client_ip;
      if(element.request_body)
        element.request_body = JSON.stringify(element.request_body, null,4);

      if(element.response_body.result)
          element.result = JSON.stringify(element.response_body.result, null,4);
        else
          element.result ='';

      this.dataLog.push(element);
    });
  });
  
}
  openModal(data, content) {
    this.EditData = data.row;
    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg" });

  }

}

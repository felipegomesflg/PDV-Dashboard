import { Component, OnInit } from '@angular/core';

import {ComumService} from '../../services/comum.service';

import {NgbModal, ModalDismissReasons, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

import * as moment from 'moment';


@Component({
  selector: 'app-home',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  constructor(private comumService:ComumService,private modalService: NgbModal) { }

  resumeDate : any[] = [];
  
  selectedDay:number ;
  ngOnInit() {
    this.loadData();
  
    

  }



  loadData(){
    this.resumeDate = [{
    'date':1513908000,
    'sales':'0,00',
    'debit':'0,00',
    'credit':'0,00',
    'anticipation':'0,00',
    'chargeback':'0,00',
    'void':'0,00',
    'other':'0,00',
    'balance':'0,00',
    'status':'Depositado'
    },
    {
    'date':1514167200,
    'sales':'0,00',
    'debit':'0,00',
    'credit':'0,00',
    'anticipation':'0,00',
    'chargeback':'0,00',
    'void':'0,00',
    'other':'0,00',
    'balance':'0,00',
    'status':'Depositado'
    },
    {
    'date':1514253600,
    'sales':'0,00',
    'debit':'0,00',
    'credit':'0,00',
    'anticipation':'0,00',
    'chargeback':'0,00',
    'void':'0,00',
    'other':'0,00',
    'balance':'0,00',
    'status':'A Receber'
    },
    {
    'date':1514340000,
    'sales':'0,00',
    'debit':'0,00',
    'credit':'0,00',
    'anticipation':'0,00',
    'chargeback':'0,00',
    'void':'0,00',
    'other':'0,00',
    'balance':'0,00',
    'status':'A Receber'
    },
    {
    'date':1514426400,
    'sales':'0,00',
    'debit':'0,00',
    'credit':'0,00',
    'anticipation':'0,00',
    'chargeback':'0,00',
    'void':'0,00',
    'other':'0,00',
    'balance':'0,00',
    'status':'A Receber'
    }
    ];

  }



  openCalendar(content,date){
    this.selectedDay = date;
    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg",windowClass:'large scrollable' });
  }

  dayOfWeek(day){
    
    return moment.unix(day).locale('pt').format('dddd');
  }
  dayMonth(day){
    return moment.unix(day).format("DD/MM");
  }

  isToday(day){
    if(moment.unix(day).format("DD/MM") ==  moment().format("DD/MM"))
      return true
    else
      return false
  }
 
}

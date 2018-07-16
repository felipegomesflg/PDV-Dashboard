import { Component, OnInit, Input } from "@angular/core";

import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { Select2OptionData } from "ng2-select2";
import { ActivatedRoute, Router } from "@angular/router";

import { ComumService } from "../../services/comum.service";
import { DataService } from "./../../services/data.service";
import { PaymentAcquirer } from './../../models/payment-acquirer.model';

import * as firebase from 'firebase';

@Component({
  selector: 'app-acquirer',
  templateUrl: './acquirer.component.html',
  styleUrls: ['./acquirer.component.scss']
})
export class AcquirerComponent implements OnInit {

  public columnsAcquirer: Array<any> = [
    {
      title: "Nome",
      name: "name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    { title: "Descrição", name: "description", className: ['hidden-xs'] }
  ];

  private EditData: PaymentAcquirer = new PaymentAcquirer();
  private sendData: PaymentAcquirer = new PaymentAcquirer();
  private dataAcquirer: Array<any> = [];


  constructor(
    private modalService: NgbModal,
    private comumService: ComumService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
      this.dataService.getList("v1/paymentAcquirers")
      .subscribe(val => {
        this.dataAcquirer = [];
       val.result.forEach(element => {
         element.description = element.description === '.' ? element.description.replace( /./g, '' ) : element.description;
        this.dataAcquirer.push(element);
       });

        this.comumService.loading = false;
      },
    Error=>{
      this.comumService.errorModal('Ocorreu um Erro');
      //console.log(Error);
    });
  }

  openModal(content, data) {

    this.EditData = new PaymentAcquirer();

    if (data) {
      this.comumService.loading = true;
      this.dataService.getList(`v1/contactdetails/${data.row.contact_detail_id}`)
      .subscribe(val => {
        data.row['contact_detail'] = val.result;
        this.dataService.jsonToModel( data.row,new PaymentAcquirer(),this.EditData);
        this.EditData.contact_detail.phone_number = this.comumService.fPhone(this.EditData.contact_detail.phone_number);
       this.comumService.loading = false;
      },
        Error=>{
        this.comumService.errorModal('Ocorreu um Erro');
        //console.log(Error);
      });
    }

    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static" });
    this.comumService.focusFirst();
  }


  saveData() {
    this.EditData.description = this.EditData.description.replace( /\s/g, '' ) === '' ? '.' : this.EditData.description;
    this.comumService.loading = true;
      if(!this.validateFields())
        {this.comumService.loading = false; return false;}
      this.dataService.jsonToModel( this.EditData,new PaymentAcquirer(),this.sendData);

      this.sendData.contact_detail.phone_number = '+'+this.sendData.contact_detail.phone_number.replace(/[^0-9]/g, "");

      if (this.sendData.id) { // Editar


        this.dataService.update(this.sendData,`v1/paymentacquirers/${this.sendData.id}`)
          .subscribe(val => {
            this.comumService.loading = false;
            this.comumService.modalReference.close();
            this.loadData();
          },
        Error=>{
          this.comumService.errorModal('Ocorreu um Erro');
        });
      } else { // Adicionar
        this.dataService.addEntity(this.sendData,"v1/paymentacquirers")
        .subscribe(val => {
          this.comumService.loading = false;
          this.comumService.modalReference.close();
          this.loadData();
        },
        Error=>{
          this.comumService.errorModal('Ocorreu um Erro');
        });
      }
    }


  validateFields(){
    let valid = []

      valid = [
        [this.EditData.name,'string','Nome do adquirente'],
        [this.EditData.contact_detail.name,'string','Nome do contato'],
        [this.EditData.contact_detail.email,'string','E-mail'],
        [this.EditData.contact_detail.phone_number.replace(/[^0-9]/g, "").length > 2,'string','Telefone']
      ];

     for(var i in valid){
        if(!this.comumService.validField(valid[i][0],valid[i][1],valid[i][2]))
          return false
     }

      return true;
  }

  validateEmail(email){

  }

  deleteData(){
    this.comumService.loading = true;
      if(confirm('Você deseja mesmo excluir o adquirente '+this.EditData.name)){
      this.dataService.delete(`v1/paymentacquirers/${this.EditData.id}`).subscribe(val =>{
        this.comumService.loading = false;
        this.comumService.modalReference.close();
        this.loadData();
      },
        Error=>{
          this.comumService.errorModal('Ocorreu um Erro');
        });
      }
  }
}

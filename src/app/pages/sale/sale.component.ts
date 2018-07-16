import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { NgbModal, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireAuth } from "angularfire2/auth";
import { LocalStorageService } from 'angular-2-local-storage'
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Select2OptionData } from 'ng2-select2';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BillingContract } from "../../models/billing-contract.model";

import { ComumService } from '../../services/comum.service';
import { DataService } from "./../../services/data.service";

import { AfterViewChecked } from "@angular/core/src/metadata/lifecycle_hooks";

import * as moment from 'moment';




@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss']
})
export class SaleComponent implements OnInit, AfterViewChecked {

  @ViewChild('saleBulk')
  saleBulk: any;

  constructor(private calendar: NgbCalendar,
    private location: Location,
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    public af: AngularFireAuth,
    private ref: ChangeDetectorRef
  ) {
    // let dStart = this.comumService.formDateApi(this.calendar.getPrev(this.calendar.getToday(), 'd', 8));
    // let dEnde = this.comumService.formDateApi(this.calendar.getPrev(this.calendar.getToday(), 'd', 1));
    this.dateRangeStart = this.dateStart = moment().unix();
    this.dateRangeEnd = this.dateEnd = moment().add(1, 'day').unix();
  }

  private ready: boolean = false;
  private eventID: any;
  private eventList: any[];

  private userStores: any[]; //loja do usuario caso ele seja dono de loja (tipo 5)
  private eventStores: any[];
  private resumeStores: any[] = [];
  private eventStoreID: any;
  private currentEvent: any[] = [];

  private filterPeriod: boolean = true;


  private columnsSale: Array<any> = [
    { title: 'Data', name: 'date', sort: 'asc' },
    { title: 'Evento', name: 'event', className: ['hidden-xs'] },
    { title: 'Forma Pgto', name: 'pgto' },
    { title: 'Bandeira', name: 'brand_ico', className: ['text-center'] },
    { title: 'Dispositivo', name: 'device_name', className: ['hidden-xs'] },
    { title: 'Consumidor', name: 'consumer_info', className: ['hidden-xs'] },
    { title: 'Status', name: 'status_info', className: ['hidden-xs'] },
    { title: 'Valor', name: 'value', className: [''] }
  ];

  private columnsSaleProduct: Array<any> = [
    { title: 'Nome', name: 'name', sort: 'asc' },
    { title: 'Categoria', name: 'product_category', className: ['hidden-xs'] },
    { title: 'Loja', name: 'product_store' },
    { title: 'Valor Unit.(R$)', name: 'value' },
    { title: 'Qtd', name: 'amount' },
    { title: 'Total (R$)', name: 'total' }
  ];

  private dateStart: number;
  private dateEnd: number;
  private dateRangeStart: number;
  private dateRangeEnd: number;
  private optionFilter: Array<any> = [];
  private option: string = '';
  private columnsType: string = '';
  private isClickTabOnline: boolean = true;
  private isClickTabSalesStore: boolean = false;
  private isClickTabProduct: boolean = false;
  private isDatepikertConfigPositionRigth: boolean = false;
  public isColumnsSaleByEvent: boolean = true;
  private options: Array<any> = [];
  private optionsMap: any;
  private optionsChecked: Array<any> = [];

  private dataSale: Array<any> = []; //objeto de vendas
  private dataSaleTemp: Array<any> = []; //objeto temporario de vendas usado para o push antes de carregar datatable
  private dataOnline: FirebaseListObservable<any>; //objeto de vendas em tempo real
  private dataSaleProduct: Array<any> = []; //objeto de vendas de produtos
  private dataSaleProductTemp: Array<any> = []; //objeto de vendas de produtos temporario para o push antes de carregar o datatable

  private dataProd: Array<any> = []; //objeto dos produtos da modal
  private totalSale: number = 0;//total vendido
  private pagaleeService: any = [];//serviços 
  private totalDesconto: number = 0;//cancelamentos
  private totalReceipt: number = 0;//total a receber

  private creditPayment = [];
  private creditService = [];
  private creditPaymentTemp = [];
  private creditPaymentTotal = 0;
  private creditPaymentTax = 0;
  private debitPayment = [];
  private debitService = [];
  private debitPaymentTemp = [];
  private debitPaymentTotal = 0;
  private debitPaymentTax = 0;
  private othersPayment = [];
  private othersService = [];
  private othersServiceDetail = [];
  private othersPaymentTemp = [];
  private othersPaymentTotal = 0;
  private othersPaymentTax = 0;
  private eventData: any;
  private billingData: BillingContract = new BillingContract();
  private el: any;
  private storeInfo = [];
  private chargingData = [];

  private filterEventID;
  private filterEvent = [];

  private groupByList: Array<Select2OptionData> =
    [
      { text: 'Evento', id: 'event' },
      { text: 'Data', id: 'data' },
      { text: 'Operador', id: 'operator' }
    ]
  private groupByID: any;
  private path: any;
  private pathArray: any;
  private storeid: any;

  private currentContract: any;

  ngOnInit() {

    this.pagaleeService['total'] = 0;

    this.path = this.localStorage.get("path");
    this.pathArray = this.localStorage.get("pathArray");
    // if (this.pathArray && this.pathArray[0].account_type_id == 1)//se for adm mostra tid
    //   this.columnsSale.push({ title: 'TID', name: 'tid', className: ['hidden-xs'] });

    this.comumService.path.subscribe(val => {
      this.path = val;
      this.comumService.loading = true;
      this.loadEvent();
    });
    if (this.path)
      this.loadEvent();
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
  }

  doSaleBulk(event) {
    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer 
    if (event.target.files && event.target.files[0]) {

      var reader = new FileReader();
      reader.onload = (event) => {
        var data = event.target['result'];
        this.doImportSale(JSON.parse(data));
      }
      reader.readAsBinaryString(event.target.files[0]);
    }
    this.saleBulk.nativeElement.value = "";
  }
  doImportSale(json) {
    this.comumService.loading = true;
    this.dataService.addEntity(json, "v1/sales").subscribe(val => {
      this.comumService.loading = false;
    });
  }

  loadEvent() {
    this.userStores = [];
    this.db.list(this.path + "/event/", {
      query: {
        orderByChild: 'start_date'
      }
    }).take(1)
      .subscribe(a => {
        let ev = [];
        a.forEach(val => {
          val['tempNome'] = val.name + ' ' + moment.unix(val.start_date).format('DD/MM');
          val['tempStartDate'] = moment.unix(val.start_date).format('DD/MM/YYYY'); // data inicio do contrato
          val['tempEndDate'] = moment.unix(val.end_date).format('DD/MM/YYYY'); // data fim do contrato
          ev.unshift(val);
        })
        this.ready = true;
        this.loadStores();
        this.processEvent(ev)
      });
  }

  processEvent(ev) { //processa eventos do usuario
    var tempEv = [];
    if (this.comumService.accountTypeId == 5) { //se for dono de loja devo conferir se ele possui eventos de suas lojas
      this.af.authState.take(1).subscribe(auth => {
        //this.db.list(this.path + '/account/' + auth.uid + '/account_parent/'+this.path.split('/account_detail/')[1]+'/account_store').take(1).subscribe(el => { //esse é com accountdetail a forma correta
        this.db.list(this.path + '/account/' + auth.uid + '/account_parent/').take(1).subscribe(el => { //leio lojas do usuario
          el.forEach(y => {
            if (y.account_detail_id == this.path.split('/account_detail/')[1]) {//gambiarra ate moura arrumar chave do parent
              Object.keys(y.account_store).map((obj, index) => {//gambiarra ate moura arrumar chave do parent
                //el.forEach(y => {descomentar qdo acabar gambiarra
                this.userStores.push(y.account_store[obj]);
                ev.forEach(val => { //leio evento
                  if (val.event_store)//se tiver loja leio lojas
                    Object.keys(val.event_store).map((key, index) => {
                      if (y.account_store[obj].store_id == val.event_store[key]['store_id']) //faço a comparação , caso exista retorno verdadeiro
                        tempEv.push(val);
                    })
                });
              });
            }
          })
          this.event(tempEv);
        })
      });
    } else  //caso nao seja dono de loja chama direto
      this.event(ev);
  }

  event(ev) { //pega retorno do processamento para manipulação
    if (ev.length > 0) 
      this.eventList = this.comumService.setSelect2(ev, 'id', 'tempNome', 'Selecione', true, false);
    else {
      this.eventList = []
      this.comumService.loading = false;
      return false;
    }

    // this.eventList.forEach(element => {
    //   if (element.additional.start_date < moment().unix() && element.additional.end_date > moment().unix())
    //       element['text'] = "<span class='online'></span>"+element['text']
    // });

  }

  hasEvent(id) {
    let isReturn = false;
    if (!this.eventList)
      return false;
    this.eventList.forEach(e => {
      if (e.id == id)
        isReturn = true;
    });
    return isReturn;
  }

  loadStores() {
    let cont = 0;

    this.db.object(this.path).take(1)
      .subscribe(a => {
        let tempStore = [];
        if (a.store && a.event && this.eventID && a.event[this.eventID] && a.event[this.eventID].event_store) {
          Object.keys(a.event[this.eventID].event_store).map((key) => { //pega lojas do evento selecionado
            tempStore.push(a.store[a.event[this.eventID].event_store[key].store_id]); // antes tentativa solucao lucas
          });
          this.eventStores = this.comumService.setSelect2(tempStore, 'id', 'trade_name', 'Todas', true);
          this.currentEvent['payment_date'] = a.event[this.eventID].end_date;
          if (this.comumService.accountTypeId != 5)
            this.eventStores.unshift({ id: '0', text: 'Todas' })
        }
        this.comumService.loading = false;
      });
  }



  loadSalesStore() {
    if (!this.eventStores) {
      this.comumService.loading = false;
      return false;
    }
    this.resetData();
    //this.comumService.loading = true;
    let cont = 0; //contador para chamar soma ao final do foreach de eventos
    this.db.object(this.path + "/event/" + this.eventID).subscribe(a => {
      this.resetData();
      let taxes = [];
      var b = a.balance_account.billing_contract;
      Object.keys(b).map((key) => {

        this.db.object(this.path + '/store').take(1).subscribe(c => { //pega todas as lojas, caso seja onbillingstore utiliza as taxas delas, tive que por acima para manter a sicronia, mas so usa se for billingstore
          if (b[key] && b[key].active) {
            this.currentContract = b[key];
            this.currentContract.value = this.comumService.fMoeda(this.currentContract.value.toFixed(2)); // mascara field valor do contrato
            let tax = [];
            this.chargingData = [];
            //se for repasse por loja
            Object.keys(a.event_store).map((key2) => { //lista lojas do evento
              tax[a.event_store[key2].store_id] = []; //cria posiçao da taxa com id da loja
              if (b[key].on_store_billing) {
                Object.keys(c[a.event_store[key2].store_id].balance_account.billing_contract).map((key3) => {//lista contratos da loja
                  if ((a.event_store[key2].billing_contract_id == c[a.event_store[key2].store_id].balance_account.billing_contract[key3].id) || (!a.event_store[key2].billing_contract_id && c[a.event_store[key2].store_id].balance_account.billing_contract[key3].active)) { //encontra contrato vigente dentro dos contratos da loja
                    this.currentContract[c[a.event_store[key2].store_id].id] = c[a.event_store[key2].store_id].balance_account.billing_contract[key3]['bank_detail'];
                    if (c[a.event_store[key2].store_id].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee) {
                      Object.keys(c[a.event_store[key2].store_id].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee).map((key5) => {//pega todos tipos de pagamento da loja
                        tax[c[a.event_store[key2].store_id].id].push(c[a.event_store[key2].store_id].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee[key5])
                      });
                    }
                  }
                });
              } else {
                  Object.keys(b[key].billing_acquirer_agreement.payment_fee).map((key3) => {
                    tax[a.event_store[key2].store_id].push(b[key].billing_acquirer_agreement.payment_fee[key3])
                    //let tax = b[key].billing_acquirer_agreement.payment_fee[key2];
                    //taxes.push(tax);
                  });
              } 
              this.chargingData[a.event_store[key2].store_id] = []; //cria posiçao de charges com id da loja
              if (a.event_store[key2].event_charge) {
                Object.keys(a.event_store[key2].event_charge).map((charge) => { //lista charges daquele evento
                  this.chargingData[a.event_store[key2].store_id].push(a.event_store[key2].event_charge[charge]); //adiciona charges de cada loja
                });
              } else
                this.chargingData[a.event_store[key2].store_id].push({ name: 'Dispositivos', value: parseFloat(b[key].value.replace(',','.')) }); //adiciona charges de cada loja
            });



            this.setCharges();
            this.db.object(this.path.split('/account_detail')[0] + "/event/" + this.eventID).subscribe(val => {
              this.loadSaleData(val, tax);
              let groups = this.groupArrayItem(this.dataSaleProductTemp);
              let duplicateRemoved = this.removeDuplicates(this.dataSaleProductTemp, 'name');
              this.dataSaleProductTemp = [];
              groups.forEach(g => {
                duplicateRemoved.forEach(d => {
                  if (g.idProduct.length > 1 && g.groupName === d.name) {
                    this.dataSaleProductTemp.push({
                      amount: 1 * g.idProduct.length,
                      id: d.id,
                      name: d.name,
                      product_category: d.product_category,
                      production_area: d.production_area,
                      sale_id: d.sale_id,
                      product_store: d.product_store,
                      sale_product_unique_number: d.sale_product_unique_number,
                      value: this.comumService.fMoeda(d.value.toFixed(2)),
                      total: this.comumService.fMoeda((d.value * g.idProduct.length).toFixed(2))
                    })
                  } else if (g.idProduct.length === 1 && g.groupName === d.name) {
                    d['value'] = this.comumService.fMoeda(parseFloat(d.value).toFixed(2));
                    d['total'] = this.comumService.fMoeda(parseFloat(d.value).toFixed(2));
                    this.dataSaleProductTemp.push(d);
                  }
                });
              });
              this.dataSale = this.dataSaleTemp;
              this.dataSaleProduct = this.dataSaleProductTemp;
              this.sumSaleValue();
              this.comumService.loading = false;
            });
          };
        });
      });
      //this.comumService.loading = false;
    })

    // this.db.list(this.path.split('/account_detail')[0] + "/event/").subscribe(a => {
    //   this.resetData();
    //   a.forEach(val => {
    //     if (this.eventID && (this.eventID == 0 || this.eventID == val.id)) {//caso seja todos ou se escolher conferir o evento que deseja
    //       //objeto que tera os ids das lojas com suas taxas dentro, caso nao seja billing por loja as taxas se repitirão
    //       let taxes = [];
    //       this.db.object(this.path + '/event/' + val.id).take(1).subscribe(x => { //pega formas de pagamento e sua taxas
    //         this.db.object(this.path + '/store').take(1).subscribe(c => { //pega todas as lojas, caso seja onbillingstore utiliza as taxas delas, tive que por acima para manter a sicronia, mas so usa se for billingstore
    //           let totem = 0;
    //           var b = x.balance_account.billing_contract;//pois tive que mudar a pegada da arvore , fix para nao ter que mudar todos Bs
    //           Object.keys(b).map((key) => {
    //             if (b[key] && b[key].active) {
    //               totem = b[key].value;
    //               this.currentContract = b[key];
    //               this.currentContract.value = this.comumService.fMoeda(this.currentContract.value.toFixed(2)); // mascara field valor do contrato
    //               if (b[key].on_store_billing) {//se for repasse por loja
    //                 let tax = [];
    //                 Object.keys(c).map((key2) => { //lista lojas
    //                   tax[c[key2].id] = []; //cria posiçao da taxa com id da loja
    //                   Object.keys(c[key2].balance_account.billing_contract).map((key3) => {//lista contratos da loja
    //                     Object.keys(x.event_store).map((key4) => { //Pega o contrato vigente do evento
    //                       if ((x.event_store[key4].billing_contract_id == c[key2].balance_account.billing_contract[key3].id) || (!x.event_store[key4].billing_contract_id && c[key2].balance_account.billing_contract[key3].active)) { //encontra contrato vigente dentro dos contratos da loja
    //                         this.currentContract[c[key2].id] = c[key2].balance_account.billing_contract[key3]['bank_detail'];
    //                         if (c[key2].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee) {
    //                           Object.keys(c[key2].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee).map((key5) => {//pega todos tipos de pagamento da loja
    //                             tax[c[key2].id].push(c[key2].balance_account.billing_contract[key3].billing_acquirer_agreement.payment_fee[key5])
    //                           });
    //                         }
    //                       }
    //                     });
    //                   });
    //                 });
    //                 taxes = tax;
    //               } else {
    //                 let tax = [];
    //                 Object.keys(c).map((key2) => { //lista lojas
    //                   tax[c[key2].id] = []; //cria posiçao da taxa com id da loja
    //                   Object.keys(b[key].billing_acquirer_agreement.payment_fee).map((key3) => {
    //                     tax[c[key2].id].push(b[key].billing_acquirer_agreement.payment_fee[key3])
    //                     //let tax = b[key].billing_acquirer_agreement.payment_fee[key2];
    //                     //taxes.push(tax);
    //                   });
    //                 });
    //                 taxes = tax;
    //               }
    //             };
    //           });
    //           this.loadSaleData(val, taxes, totem);
    //           let groups = this.groupArrayItem(this.dataSaleProductTemp);
    //           let duplicateRemoved = this.removeDuplicates(this.dataSaleProductTemp, 'name');
    //           this.dataSaleProductTemp = [];
    //           groups.forEach(g => {
    //             duplicateRemoved.forEach(d => {
    //               if (g.idProduct.length > 1 && g.groupName === d.name) {
    //                 this.dataSaleProductTemp.push({
    //                   amount: 1 * g.idProduct.length,
    //                   id: d.id,
    //                   name: d.name,
    //                   product_category: d.product_category,
    //                   production_area: d.production_area,
    //                   sale_id: d.sale_id,
    //                   product_store: d.product_store,
    //                   sale_product_unique_number: d.sale_product_unique_number,
    //                   value: this.comumService.fMoeda(d.value.toFixed(2)),
    //                   total: this.comumService.fMoeda((d.value * g.idProduct.length).toFixed(2))
    //                 })
    //               } else if (g.idProduct.length === 1 && g.groupName === d.name) {
    //                 d['value'] = this.comumService.fMoeda(parseFloat(d.value).toFixed(2));
    //                 d['total'] = this.comumService.fMoeda(parseFloat(d.value).toFixed(2));
    //                 this.dataSaleProductTemp.push(d);
    //               }
    //             });
    //           });
    //           this.dataSale = this.dataSaleTemp;
    //           this.dataSaleProduct = this.dataSaleProductTemp;
    //           cont++;
    //           if (cont == a.length) //se estiver no ultimo evento soma os resultados
    //             this.sumSaleValue();

    //           this.comumService.loading = false;
    //         });
    //       });
    //     } else
    //       cont++; //aumenta contador mesmo se nao for evento escolhido
    //   });
    // });
  }

  resetData() {
    this.pagaleeService['total'] = 0;
    this.pagaleeService['credit'] = 0;
    this.pagaleeService['debit'] = 0;
    this.pagaleeService['other'] = 0;
    this.creditPayment = [];
    this.creditService = [];
    this.creditPaymentTemp = [];
    this.creditPaymentTotal = 0;
    this.creditPaymentTax = 0;
    this.debitPayment = [];
    this.debitService = [];
    this.debitPaymentTemp = [];
    this.debitPaymentTotal = 0;
    this.debitPaymentTax = 0;
    this.othersPayment = [];
    this.othersService = [];
    this.othersServiceDetail = [];
    this.othersPaymentTemp = [];
    this.othersPaymentTotal = 0;
    this.othersPaymentTax = 0;
    this.dataSaleTemp = [];
    this.dataSale = [];
    this.dataSaleProductTemp = [];
    this.dataSaleProduct = [];
    this.totalDesconto = 0;
    this.totalSale = 0;
    this.currentContract = [];
    //this.resumeStores = [];
  }

  loadSaleData(val, taxes) {

    if (this.eventStoreID != 0) {
      this.resumeStores.forEach(s => {
        s['total'] = 0;
        s['totalTax'] = 0;
        s['taxes'] = [];
        s['taxes']['credit'] = [];
        s['taxes']['debit'] = [];
        s['taxes']['other'] = [];
      });
    }
    else {
      this.resumeStores = this.eventStores;
      this.resumeStores.forEach(s => {
        s['total'] = 0;
        s['totalTax'] = 0;
        s['taxes'] = [];
        s['taxes']['credit'] = [];
        s['taxes']['debit'] = [];
        s['taxes']['other'] = [];
      });
    }

    if (this.hasEvent(val.id) && val.sale) {
      Object.keys(val.sale).map((key) => {
        if (((this.filterPeriod && this.dateRangeStart <= val.sale[key].created_at && this.dateRangeEnd >= val.sale[key].created_at) || !this.filterPeriod) && this.storeHasSale(val.sale[key])) {
          let element = val.sale[key];
          if (element.status_id == 11)//compras canceladas
            this.totalDesconto += element.sale_total;
          else { //pois so adiciona taxa de compras que nao foram canceladas
            this.resumeStores.forEach(s => {
              let ret = false;
              Object.keys(element.sale_product).map((key) => {//caso possua vendas da loja, retorna true para adicionar a lista de vendas
                if (element.sale_product[key].product_store_id == s.id)
                  ret = true;
              });
              if (ret) {
                if (element.payment_method.toLowerCase().indexOf('crédito') >= 0)
                  s['taxes']['credit'].push(element);
                else if (element.payment_method.toLowerCase().indexOf('débito') >= 0)
                  s['taxes']['debit'].push(element);
                else
                  s['taxes']['other'].push(element);
              }
            });

            let tempTax = this.getTax(element.sale_product, element.payment_method, element.brand, taxes);
            if (!element.brand)
              element.brand = 'EventFly';
            if (element.payment_method.toLowerCase().indexOf('crédito') >= 0 || element.payment_method.toLowerCase().indexOf('credit') >= 0) {
              this.pagaleeService['credit'] += tempTax;
              this.creditPaymentTemp.push(element);
            } else if (element.payment_method.toLowerCase() == 'débito' || element.payment_method.toLowerCase() == 'debit') {
              this.pagaleeService['debit'] += tempTax;
              this.debitPaymentTemp.push(element);
            } else {
              this.pagaleeService['other'] += tempTax;
              this.othersPaymentTemp.push(element);
            }
            this.pagaleeService['total'] += tempTax;
            this.totalSale += element.sale_total;
          }

          //this.pagaleeService+=totalTaxed;              

          this.dataSaleTemp.push(
            {
              'brand_ico': '<img src="' + this.comumService.getBrandIco(element.brand) + '">',
              'sale_id': element.id,
              'event': val.name,
              // 'date': val.date +' '+ val.time,
              'date': this.comumService.formatTimeStamp(element.created_at),//moment(element.created_at).format('hh:mm:ss DD/MM/YYYY'),
              'value': 'R$ ' + this.comumService.fMoedaReal(element.sale_total.toFixed(2)),
              'pgto': element.payment_method,
              'tid': element.receipt_no,
              'brand': element.brand ? this.comumService.capitalizeFirstLetter(element.brand.toLowerCase()) : 'EventFly',
              'operator': element.operator,
              'products': element.sale_product,
              'device_name': element.operator,
              'consumer_info': element.card_holder_name ? element.card_holder_name : '',
              'status_info': element.status_id == 11 ? 'Estornado' : 'Pago'
            }
          );
        }
      });
      this.resumeStores.forEach(evs => {
        evs["total"] = 0;
        evs["totalTax"] = 0;
        this.setStoreData(evs, 'distinct_brand_credit', evs.taxes.credit, "Crédito", taxes);
        this.setStoreData(evs, 'distinct_brand_debit', evs.taxes.debit, "Débito", taxes);
        this.setStoreData(evs, 'distinct_brand_other', evs.taxes.other, "Outros", taxes);
      });
    }
  }

  setStoreData(evs, brand, obj, name, taxes) {
    evs[brand] = this.comumService.distinctSumValues(obj, 'brand', 'sale_total');

    evs[brand].forEach(dbc => {
      let taxsom = 0;
      obj.forEach(evc => {
        if (dbc.brand == evc.brand) {
          let ret = this.getTax(evc.sale_product, evc.payment_method, evc.brand, taxes, true);
          taxsom += ret['value'];
          if (this.currentEvent['payment_date'])
            dbc["payment_day"] = moment.unix(this.currentEvent['payment_date']).add(ret['days'], 'days').format('DD/MM/YYYY');
          else
            dbc["payment_day"] = 0;
          dbc["tax"] = ret['tax'];
        }
        dbc["taxValue"] = taxsom;
        dbc["payment_method"] = name;
      });
      evs["total"] += dbc.value;
      evs["totalTax"] = evs["total"] - dbc["taxValue"];
    });
  }

  sumSaleValue() {
    this.creditPayment = this.comumService.distinctSumValues(this.creditPaymentTemp, 'brand', 'sale_total');
    this.debitPayment = this.comumService.distinctSumValues(this.debitPaymentTemp, 'brand', 'sale_total');
    this.othersPayment = this.comumService.distinctSumValues(this.othersPaymentTemp, 'brand', 'sale_total');

    this.creditPaymentTotal = this.comumService.sumValues(this.creditPayment, 'value');
    this.debitPaymentTotal = this.comumService.sumValues(this.debitPayment, 'value');
    this.othersPaymentTotal = this.comumService.sumValues(this.othersPayment, 'value');

    let totalCharging = 0;
    this.othersServiceDetail.forEach(element => {
      totalCharging+=element.value;
    });
    this.othersService.push({ brand: 'SERVIÇOS', value: this.pagaleeService.other + totalCharging })
    this.debitService.push({ brand: 'SERVIÇOS', value: this.pagaleeService.debit })
    this.creditService.push({ brand: 'SERVIÇOS', value: this.pagaleeService.credit })

    this.othersServiceDetail.push({ brand: 'Serviços', value: this.pagaleeService.other })

    this.totalReceipt = this.totalSale;
    //this.pagaleeService = this.totalReceipt*0.015; //calcula porcentagem do total com apenas cancelamentos
    this.pagaleeService['total'] += totalCharging;
    this.totalReceipt -= this.pagaleeService['total']; //substrai o serviço

  }

  storeHasSale(sale) { //caso usuario seja dono de loja, selecionar apenas vendas q possuam registros da sua loja

    let ret = false;
    var cont = 0;

    Object.keys(sale.sale_product).map((key) => {
      if (sale.sale_product[key].product_store_id && this.eventStoreID && (sale.sale_product[key].product_store_id.toLowerCase() == this.eventStoreID.toLowerCase() || this.eventStoreID == 0)) { //se a venda tiver item de alguma loja do usuario
        cont += sale.sale_product[key].value;
        this.dataSaleProductTemp.push(sale.sale_product[key]);
        ret = true;
      } else
        delete sale.sale_product[key]; //remove compras que nao sejam da loja
    });

    if (ret)
      sale.sale_total = cont;

    return ret;
  }

  getTax(sale, pgt, brand, tax, getDate = undefined) { //getDate é caso tenha que retornar os dias para pagamento (payout_day)
    //let total = value;
    let total;
    if (getDate) {
      total = [];
      total['value'] = 0;
      total['tax'] = 0;
      total['days'] = 0;
    } else
      total = 0;
    if (brand && pgt) {
      Object.keys(sale).map((key) => { //cada produto da venda
        if (sale[key].product_store_id && tax[sale[key].product_store_id.toLowerCase()]) { //se tem id da store
          tax[sale[key].product_store_id.toLowerCase()].forEach(element => { //pegar taxa a ser usada
            if (element.payment_brand.name.toLowerCase() == brand.toLowerCase() && element.payment_method.name.toLowerCase().indexOf(pgt.toLowerCase()) > -1) {
              if (getDate) {
                total['value'] += (sale[key].value * element.payout_fee) / 100; //faz calculo e soma ao contador do valor total
                total['days'] = element.payout_days;
                total['tax'] = element.payout_fee;
              } else
                total += (sale[key].value * element.payout_fee) / 100; //faz calculo e soma ao contador do valor total
            }
          });
        }
      });
    }
    return total;
  }

  setEvent(type) {
    this.comumService.loading = true;
    this.eventID = type.value;
    let tempEventID = this.eventID;
    this.eventList.forEach(val => {
      if (val.id == this.eventID) 
        this.eventData = val; // montando objeto com os dados do evento selecionado
    });
    if (this.eventStoreID && this.eventID != tempEventID) { //para so chamar quando mudar o valor e nao reclarregar desnecessariamente
      this.ready = true;
      this.loadStores();
    }
    this.loadEvent();
  }

  setStore(type) {
    this.comumService.loading = true;
    this.resumeStores = [];
    let tempStoreID = this.eventStoreID;
    this.eventStoreID = type.value;

    this.setCharges();

    if (this.eventStores) {
      this.eventStores.forEach(st => {
        if (st.id == this.eventStoreID || this.eventStoreID == 0) {
          st.brand = st.brand ? st.brand : 'EventFly';
          this.resumeStores.push(st);
        }
      });
    }
    if (this.eventStoreID != tempStoreID || this.ready) { //para so chamar quando mudar o valor e nao reclarregar desnecessariamente
      this.loadSalesStore();
      this.ready = false; 
    }
  }


  setCharges() {
    if (this.eventStoreID != 0 && this.chargingData[this.eventStoreID]) { // loja marcada, filtrar pela loja marcada
      this.othersServiceDetail = this.chargingData[this.eventStoreID].slice();
    }
    else if(this.chargingData) { // opcao todas marcada, mostrar todas as lojas
      Object.keys(this.chargingData).map((key) => {
        this.chargingData[key].forEach(scd => {
          this.othersServiceDetail.push(scd);
        });
      });
    }
    this.othersServiceDetail = this.comumService.distinctSumValues(this.othersServiceDetail, "name", "value"); // unificando valores de despesas iguais
    
  }
  openModal(sale, content) {
    let saleAndOnline: any;
    if (sale.sale_product)
      saleAndOnline = sale.sale_product;
    else
      saleAndOnline = sale.row.products;

    let products: any = [];

    if (saleAndOnline) {
      Object.keys(saleAndOnline).map((objectKey, index) => {
        products.push(saleAndOnline[objectKey]);
      });
    }

    if (products.length == 0) {
      this.comumService.alertInfo('Essa venda não possui produto');
      return false;
    }
    let produtcsRow: Array<{}> = [];
    let groups = this.groupArrayItem(products);
    let duplicateRemoved = this.removeDuplicates(products, 'name');

    groups.forEach(g => {
      duplicateRemoved.forEach(d => {
        if (g.idProduct.length > 1 && g.groupName === d.name) {
          produtcsRow.push({
            amount: 1 * g.idProduct.length,
            id: d.id,
            name: d.name,
            product_category: d.product_category,
            production_area: d.production_area,
            sale_id: d.sale_id,
            product_store: d.product_store,
            sale_product_unique_number: d.sale_product_unique_number,
            value: d.value * g.idProduct.length
          })
        } else if (g.idProduct.length === 1 && g.groupName === d.name)
          produtcsRow.push(d);
      });
    });

    produtcsRow.forEach(p => {
      if (typeof p['value'] === "number")
        p['value'] = 'R$     ' + this.comumService.fMoedaReal(p['value'].toFixed(2));
    });

    this.dataProd = produtcsRow;
    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg" });
  }

  removeDuplicates(myArr, prop) { // remove posicoes duplicadas de um array
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  groupArrayItem(myArray) {
    let group_to_values = myArray.reduce(function (obj, item) {
      obj[item.name] = obj[item.name] || [];
      obj[item.name].push(item.id);
      return obj;
    }, {});

    let groups = Object.keys(group_to_values).map(function (key) {
      return { groupName: key, idProduct: group_to_values[key] };
    });

    return groups;
  }

  changeDatePeriod(objDates) {
    this.dateRangeStart = moment(objDates.start).unix();
    this.dateRangeEnd = moment(objDates.end + ' 23:59:59').unix();
    this.comumService.loading = true;

      this.loadSalesStore();

 // carregando as informações após mudar a data no filtro 
    // if(this.isClickTabProduct )
    //   this.loadSalesProduct();
    // else
    //this.loadSalesStore();
  }

  initOptionsMap() {
    for (var x = 0; x < this.options.length; x++) {
      this.optionsMap[this.options[x]] = false;
    }
    this.optionFilter = []; this.option = 'Sale';
  }

  // updateCheckedOptions(option, event) {
  //   if (!this.option.includes(option) && event.target.checked)
  //     this.optionFilter.push(option)
  //   else
  //     this.optionFilter = this.optionFilter.filter(item => item !== option)

  //   if (this.optionFilter.length === 0)
  //     this.option = 'Sale';
  //   else
  //     this.option = this.optionFilter.sort().toString().replace(/,/g, '/');

  //   this.optionsMap[option] = event.target.checked;

  //   this.loadSalesStore();
  // }

  loadCheckeList() {
    this.options = ['Evento', 'Data', 'Operador'];
    this.optionsMap = {
      Evento: false,
      Data: false,
      Operador: false,
    };
  }

  closeDateRange(e) {
    //console.log(e)
  }

  slideTable(e) { // abre e fecha informacoes do resumo financeiro
    $(e.target).parent().parent().parent().parent().toggleClass('open');
  }
}

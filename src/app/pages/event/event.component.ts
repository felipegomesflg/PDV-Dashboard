import { Component, OnInit, Renderer, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Http, Response } from "@angular/http";
import { getParseErrors } from "@angular/compiler/src/util";

import { NgbModal, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage";
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { Select2OptionData, Select2TemplateFunction } from "ng2-select2";

import { ComumService } from "./../../services/comum.service";
import { DataService } from "./../../services/data.service";
import { AuthGuard } from "../../services/auth.service";
import { pdfSenderService } from "../../services/pdfSender.service";


import { Event } from "./../../models/event.model";
import { City } from "./../../models/city.model";
import { State } from "./../../models/state.model";
import { BillingContract } from "../../models/billing-contract.model";
import { AccountDetail } from "../../models/account-detail.model";
import { PaymentFee } from "../../models/payment-fee.model";
import { BillingAcquirerAgreement } from "../../models/billing-acquirer-agreement.model";
import { BankDetail } from "../../models/bank-detail.model";
import { BalanceAccount } from "../../models/balance-account.model";

import * as moment from 'moment';
import { EventEmitter } from "events";
import { AfterViewChecked } from "@angular/core/src/metadata/lifecycle_hooks";
import { format, getDate, getMonth, getYear } from 'date-fns';



@Component({
  selector: "app-event",
  templateUrl: "./event.component.html",
  styleUrls: ["./event.component.scss"]
})
export class EventComponent implements OnInit, AfterViewChecked {

  public ModelstartDate: NgbDateStruct;
  public ModelendDate: NgbDateStruct;

  public columnsEvent: Array<any> = [
    {
      title: "Nome do Evento", name: "name", sort: 'asc',
      filtering: {
        filterString: "",
        placeholder: "Filtrar por nome"
      }
    },
    { title: "Data Início", name: "start_date" },
    { title: "Data Final", name: "end_date" },
    { title: "Hora Iníco", name: "table_start_time", className: ['hidden-xs'] },
    { title: "Hora Fim", name: "table_end_time", className: ['hidden-xs'] },
    { title: "", name: "performancereport", className: "minimal" },
    { title: "", name: "financialreport", className: "minimal" },
    { title: "", name: "salesreport", className: "minimal" },
    { title: "", name: "close_box", className: "minimal" }
  ];

  public columnsPaymentMethodAndTax: Array<any> = [
    { title: "", name: "displayImage", sort: false },
    { title: "Tipo", name: "pg", sort: 'asc' }
  ];

  public paymentMethodsValues: string[];
  public storesValues: string[];
  public storeIDCharging: string;
  public isUpdateDisabled: boolean;
  public accountType_id: any;

  private dataEvent: Array<any> = [];
  private EditData: Event = new Event();
  private path: any;
  private storeid: string;
  private checkStoreChange: any;
  private static stateList: Array<Select2OptionData>;
  private paymentMethodsList: Array<Select2OptionData>;
  private paymentBrandsList: Array<Select2OptionData>;
  private cityList: Array<Select2OptionData>;
  private storesList: Array<Select2OptionData>;
  private storeListContract: Array<any> = [];
  private storeListContractTemp: BillingContract = new BillingContract();
  private isContractType_1: boolean = true;
  private isContractType_2: boolean = false;
  private isKeepPaging: boolean;

  private dataPaymentFee: Array<any> = [];
  private paymentFee: PaymentFee = new PaymentFee();
  private EditDatapaymentFee: PaymentFee = new PaymentFee();
  private selectedPaymentMethodsValue: string;
  private selectedPaymentBrandsValue: string;
  private dataPaymentMethodAndTaxTemp: any;
  private dataPaymentMethodAndTax: Array<any> = [];
  private billingData: BillingContract = new BillingContract();
  private billingDataTemp: BillingContract = new BillingContract();
  private selectPaymentTemp: Array<Select2OptionData>;
  private selectPaymentBrandsTemp: Array<Select2OptionData>;
  private static acquirerList: Array<Select2OptionData>;
  private contractTypeList: Array<Select2OptionData>;
  public static bankList: Array<Select2OptionData>;
  public accountTypeList: Array<Select2OptionData>;
  public isNewContract: boolean = false;
  public isChargingEditionEnabled: boolean = false;
  private pathContract: any;
  private today: any;
  private tradeName: any;
  private enterpriseNumber: any;
  private formStoreData: any = [];
  private storeHasStaff: boolean = false;
  private formChargingData: any = [];
  private tableStoreData: any = [];
  private tableChargingData: any = [];
  private pinArray = [];
  private storesListCharging: any = [];
  private flagEnd: boolean = false;
  private boxAction: string = "";

  constructor(
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService,
    private pdf: pdfSenderService,
    private renderer: Renderer,
    private http: Http,
    private router: Router,
    private authService: AuthGuard,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.today = this.comumService.formatDateSemBarra(this.comumService.formDateApi(this.comumService.today));

    this.comumService.getAccountType();

    this.accountType_id = this.comumService.accountTypeId;

    this.pathContract = this.localStorage.get("path");
    this.comumService.path.subscribe(val => {
      this.loadContract(val);
      this.pathContract = val;
    });

    this.comumService.storeid.subscribe(val => {
      if (this.checkStoreChange != val) { // mecanismo desenvolvido para só chamar o loadData quando o valor for diferente do ultimo que foi setado
        this.checkStoreChange = val; // parte do bugFix do Erro 401 https://api-dev.pagalee.com/api/v1/banks e https://api-dev.pagalee.com/api/v1/paymentacquirers
        this.loadData(val);
      }
    });

    this.loadContract(this.localStorage.get("path"));
    this.loadStates();

    this.accountTypeList = [
      { id: '0', text: "Selecione" },
      { id: 'Conta Corrente', text: "Conta Corrente" },
      { id: 'Poupança', text: "Poupança" }
    ];
  }


  ngAfterViewChecked(): void {
    this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
  }

  loadBank() {
    if (!EventComponent.bankList) { // verificando se ja possui o bankList guardado para não precisar buscar de novo
      this.dataService.getList('v1/banks')
        .take(1).subscribe(val => {
          EventComponent.bankList = this.comumService.setSelect2(val.result, 'id', 'name', 'Selecione');
          //this.loadAcquirer();
          this.comumService.loading = false;
        },
          Error => {
            this.comumService.alertError('Ocorreu um Erro');
            //console.log(Error);
            this.comumService.loading = false;
          });
    }
  }

  get bankListStatic() { // get para retornar o bankList para o template
    return EventComponent.bankList;
  }

  loadAcquirer() {
    if (!EventComponent.acquirerList) { // verificando se ja possui o acquirerList guardado para não precisar buscar de novo
      if (this.comumService.accountTypeId == 1) {
        this.comumService.loading = true;
        this.dataService.getList('v1/paymentacquirers')
          .take(1).subscribe(val => {
            EventComponent.acquirerList = this.comumService.setSelect2(val.result, 'id', 'name', 'Selecione');
            this.comumService.loading = false;
          },
            Error => {
              this.comumService.alertError('Ocorreu um Erro');
              //console.log(Error);
              this.comumService.loading = false;
            });
      }
    }
  }

  get acquirerListStatic() { // get para retornar o bankList para o template
    return EventComponent.acquirerList;
  }

  setNewContract() {
    if (this.comumService.accountTypeId == 1 && !this.isUpdateDisabled) {
      if (this.billingData.id && !confirm('Deseja utilizar os dados do contrato ativo?')) {
        this.billingData = new BillingContract();
        this.dataPaymentMethodAndTax = this.dataPaymentMethodAndTaxTemp = [];
      }
      this.isNewContract = !this.isNewContract;
      this.setAvailableChargingStores();
    }
  }

  setAcquirer(s) {
    if (s != '')
      this.billingData.billing_acquirer_agreement.payment_acquirer_id = s;
  }

  setContractType(ContractTypeId) {
    if (ContractTypeId)
      this.billingData.contract_type = ContractTypeId;
  }

  setBank(bank) {
    this.billingData.bank_detail.bank.id = bank;
  }

  setBankType(bankType) {
    this.billingData.bank_detail.account_type = bankType;
  }

  deleteTableRow(rowObject) {
    this.tableStoreData = this.tableStoreData.filter(i => { return !(i.unique_identifier == rowObject.unique_identifier && i.name == rowObject.name && i.store_id == rowObject.store_id) });
    if (!this.isNewContract) {
      this.storesListCharging = this.storesListCharging.filter(i => { return !(i.id == rowObject.store_id) });
      this.setAvailableChargingStores();
    }
  }

  deleteTableChargingRow(rowObject) {
    this.tableChargingData = this.tableChargingData.filter(i => { return !(i.store_id == rowObject.store_id && i.name == rowObject.name) });
  }

  loadStore(path) {

    this.path = path;
    let storeList: any = [];
    this.storeListContract = [];

    this.db.list(this.path + "/store").subscribe(a => {
      //if(this.billingData.on_store_billing)// Se for "repase por loja"(on_store_billing) no billingcontract do path apenas store com contrato
      a.forEach(f => {
        if (f.balance_account.billing_contract)
          Object.keys(f.balance_account.billing_contract).map((objectKey, index) => {
            if (f.balance_account.billing_contract[objectKey].active) {
              storeList.push(f); // Só mostra lojas com contratos. hora fim
              this.storeListContract = storeList.slice();
            }
          });
      });
      this.storesList = this.comumService.setSelect2(storeList, "id", "trade_name", "Selecione", true);
    },
      e => {
        this.comumService.errorModal('Ocorreu um Erro');
      });
  }

  async buildDataEvent(list) {
    for (let item of list) {
      if (this.storeid == "0" || this.storeid == item.id) // tratamento para o filtro de lojas 0-> todas as lojas, caso tenha id, só mostrar os eventos daquela loja
        this.flagEnd = true;
      if (typeof item.start_date === "number") {
        item.start_date = moment.unix(item.start_date).format('DD/MM/YYYY'); //funcionamento antigo que dava bug iOS
      }
      if (item.end_date) {
        if (typeof item.end_date === "number") {
          item.end_date = moment.unix(item.end_date).format('DD/MM/YYYY'); //funcionamento antigo que dava bug iOS
        } else if (typeof item["end_date"] === 'undefined') {
          item.end_date = '';
        } else {
          item.end_date = item.end_date;
        }
      } else {
        item.end_date = 'Indefinido';
      }
      item['table_start_time'] = item.start_time.substr(0, (item.start_time.length - 3));
      item['table_end_time'] = item.end_time.substr(0, (item.end_time.length - 3));

      item['close_box'] = '';
      item['performancereport'] = '';
      item['financialreport'] = '';
      item['salesreport'] = '';

      if (this.comumService.formatDate(item.start_date) <= this.today && (this.comumService.accountTypeId == 1 || this.comumService.accountTypeId == 2)) {
        if (item.active) {
          item['close_box'] = '<h3 class="btn btn-primary" id="close_box">Fechar Caixa</h3>';
        } else {
          item['performancereport'] = '<h3 class="btn btn-primary" id="performancereport">Gerar Performance</h3>';
          item['financialreport'] = '<h3 class="btn btn-primary" id="financialreport">Gerar Financeiro</h3>';
          item['salesreport'] = '<h3 class="btn btn-primary" id="salesreport">Gerar Vendas</h3>';
        }
      }

      if (item['event_store']) {
        let previous_id = "";
        Object.keys(item['event_store']).map((Key) => {
          if (item['event_store'][Key].store_id === this.storeid) // alguma loja selecionada
            this.dataEvent.push(item);
          if (this.storeid == "0") { // opcao todas marcada
            if (previous_id != item.id) {
              previous_id = item.id; // armazenando id do evento anterior para não mostrar o mesmo evento duas vezes
              this.dataEvent.push(item);
            }
          }
        });
      } else
        this.dataEvent.push(item);
    }
    this.flagEnd = false;
  }

  loadData(id = null) {
    this.storeid = id === null ? this.localStorage.get("storeid") : id;

    // if(!this.storeid)
    //   this.router.navigate([ '/store' ]);
    this.path = this.localStorage.get("path");

    this.loadAcquirer();
    this.loadBank();

    this.db.list(this.path + "/event/").subscribe(a => {
      this.dataEvent = [];
      if (!this.flagEnd)
        this.buildDataEvent(a);
    },
      // Error
      e => {
        this.comumService.alertError('Ocorreu um error: ' + e.status);
        this.comumService.loading = false;
        //console.log("onError: %s", e);
      }
    );
  }

  loadContract(_path: any) {
    let getPath = _path + '/balance_account/billing_contract';
    this.billingDataTemp = new BillingContract();
    this.db.object(_path).subscribe(a => {
      Object.keys(a.balance_account.billing_contract).map((objectKey, index) => {
        if (a.balance_account.billing_contract[objectKey].active) {
          this.billingDataTemp = a.balance_account.billing_contract[objectKey];
          this.billingDataTemp.bank_detail.bank.id = a.balance_account.billing_contract[objectKey].bank_detail.bank_id;
          this.billingData.bank_detail.unique_identifier = this.comumService.fCnpjCpf(a.unique_enterprise_number);
          this.tradeName = a.trade_name;
          this.enterpriseNumber = this.comumService.fCnpjCpf(a.unique_enterprise_number);

          this.loadStore(_path);
        }

      });
      this.comumService.loading = false;
    });
  }


  loadPaymentMethods() {
    if (this.comumService.accountTypeId == 1)
      this.dataService.getList("v1/PaymentMethods").subscribe(val => {
        val.result = val.result.filter(f => { return f.active });
        //fazendo combo de PaymentMethods
        this.paymentMethodsList = this.comumService.setSelect2(
          val.result,
          "id",
          "name",
          "Selecione"
        );
        this.comumService.loading = false;
      },
        // Error
        e => {
          this.comumService.alertError('Ocorreu um error: ' + e.status);
          this.comumService.loading = false;
          //console.log("onError: %s", e);
        }
      );
  }

  loadPaymentBrands() {
    if (this.comumService.accountTypeId == 1)
      this.dataService.getList("v1/paymentbrands").subscribe(val => {
        //fazendo combo de paymentbrands
        this.paymentBrandsList = this.comumService.setSelect2(
          val.result,
          "id",
          "name",
          "Selecione"
        );
        this.comumService.loading = false;
      },
        // Error
        e => {
          this.comumService.alertError('Ocorreu um error: ' + e.status);
          this.comumService.loading = false;
          //console.log("onError: %s", e);
        }
      );
  }

  loadStates() {
    if (!EventComponent.stateList) { // verificando se ja possui o bankList guardado para não precisar buscar de novo
      this.dataService.getList("v1/states").subscribe(val => {
        //fazendo combo de estados
        EventComponent.stateList = this.comumService.setSelect2(
          val.result,
          "id",
          "abbreviation",
          "Selecione"
        );
      },
        // Error
        e => {
          this.comumService.alertError('Ocorreu um error:' + e.status);
          this.comumService.loading = false;
          //console.log("onError: %s", e);
        }
      );
    }
  }

  get stateListStatic() { // get para retornar o bankList para o template
    return EventComponent.stateList;
  }

  setStateId(id, cityName) {
    console.log(id, cityName);
    this.cityList = [];
    this.EditData.city.state.id = id;
    if (id) {
      this.dataService.getList(`v1/cities?state_id=${id}`).subscribe(
        val => {
          // fazendo combo de estados
          this.cityList = this.comumService.setSelect2(
            val.result,
            "id",
            "name",
            cityName || "Selecione"
          );
        },
        // Error
        e => {
          this.comumService.alertError('Ocorreu um error: ' + e.status);
          this.comumService.loading = false;
          //console.log("onError: %s", e);
        }
      );
      if (!cityName)
        this.EditData.city.id = null;
    }
  }

  onSearchCEP(cep) {
    if (cep.replace(/[_,:]/g, "").replace(/[-,:]/g, "").length === 8) {
      this.comumService.loading = true;
      this.comumService.readCEP(cep).subscribe(cep => {
        if (!cep["_body"].erro) {

          this.EditData.address_1 =
            cep["_body"].logradouro + " - " + cep["_body"].bairro;

          if (!!EventComponent.stateList)
            EventComponent.stateList.forEach(i => {

              if (i.text.toUpperCase() === cep["_body"].uf.toUpperCase()) {
                this.EditData.city.state.id = parseInt(i.id);

                setTimeout(() => {
                  if (!!this.cityList)
                    this.cityList.forEach(c => {
                      if (c.text.toUpperCase() === cep["_body"].localidade.toUpperCase())
                        this.EditData.city.id = parseInt(c.id);
                    })
                }, 2000);
              }
            });
        }
      },
        // Error
        e => {
          this.comumService.alertError('Ocorreu um error: ' + e.status);
          this.comumService.loading = false;
          //console.log("onError: %s", e);
        },
        // Done
        () => this.comumService.loading = false
      );
    } else {
      this.EditData.address_1 = '';
      this.EditData.city.state.id = null;
      this.EditData.city.id = null;
    }
  }

  setCityId(id) {
    if (id) {
      this.EditData.city.id = id;
      this.EditData.city_id = id;
    }
  }

  setStores(id) {
    this.storesValues = id;
  }

  setMultiValues(id) {
    this.paymentMethodsValues = id;
  }

  setFocus(type: string) {
    let element = this.renderer.selectRootElement(`#${type}`);
    this.renderer.invokeElementMethod(element, 'focus');
  }

  setFocusById(id) {
    setTimeout(() => {
      $('#' + id).focus();
    }, 500);
  }

  setPaymentMethodsValues(id) {
    if (this.selectedPaymentMethodsValue !== '') {
      this.selectPaymentTemp = [];
      this.selectPaymentTemp = this.paymentMethodsList.filter(i => { return i.id == id });

      if ((this.dataPaymentMethodAndTaxTemp && this.selectPaymentTemp && this.selectPaymentBrandsTemp) && (this.selectPaymentTemp.length > 0 && this.selectPaymentBrandsTemp.length > 0) &&
        (this.selectPaymentTemp[0].id != '' && this.selectPaymentBrandsTemp[0].id != '')) {

        let tempPayment = this.dataPaymentMethodAndTaxTemp.filter(i => { return i.payment_method_id == this.selectPaymentTemp[0].id });
        if (tempPayment.filter(i => { return i.payment_brand_id == this.selectPaymentBrandsTemp[0].id }).length > 0) {
          this.comumService.alertWarning('Este item já foi adicionado a lista!');
          this.resetFieldsPayment();
          return false;
        }
      }
    }
    this.selectedPaymentMethodsValue = id;
  }

  setPaymentBrandsValues(id) {
    if (this.selectedPaymentBrandsValue !== '') {
      this.selectPaymentBrandsTemp = [];
      this.selectPaymentBrandsTemp = this.paymentBrandsList.filter(i => { return i.id == id });

      if ((this.dataPaymentMethodAndTaxTemp && this.selectPaymentTemp && this.selectPaymentBrandsTemp) && (this.selectPaymentTemp.length > 0 && this.selectPaymentBrandsTemp.length > 0) &&
        (this.selectPaymentTemp[0].id != '' && this.selectPaymentBrandsTemp[0].id != '')) {

        let tempPayment = this.dataPaymentMethodAndTaxTemp.filter(i => { return i.payment_method_id == this.selectPaymentTemp[0].id });
        if (tempPayment.filter(i => { return i.payment_brand_id == this.selectPaymentBrandsTemp[0].id }).length > 0) {
          this.comumService.alertWarning('Este item já foi adicionado a lista!');
          this.resetFieldsPayment();
          return false;
        }
      } else {
        this.setFocus('numberTax');
      }
    }
    this.selectedPaymentBrandsValue = id;
  }

  addPaymentMethodTax() {
    if (this.selectedPaymentMethodsValue == '' || this.selectedPaymentBrandsValue == '')
      this.comumService.alertError('Selecione um tipo de pagamento e a Bandeira do cartão!');
    else if (this.EditDatapaymentFee.acquirer_fee == 0 || this.EditDatapaymentFee.payout_fee == 0)
      this.comumService.alertError('Digite as taxas, os valores das taxa devem ser maiores que zero!');
    else if (parseFloat(this.EditDatapaymentFee.payout_fee.toString()) < parseFloat(this.EditDatapaymentFee.acquirer_fee.toString()))
      this.comumService.alertError('A taxa do cliente deve ser maior ou igual a taxa do adquirente!');
    else if (this.EditDatapaymentFee.acquirer_days <= 0 || this.EditDatapaymentFee.payout_days <= 0)
      this.comumService.alertError('Digite os dias, os dias devem ser maiores que zero!');
    else {
      this.dataPaymentMethodAndTaxTemp.push({ payment_method_id: this.selectPaymentTemp[0].id, pg: this.selectPaymentTemp[0].text, payment_brand_id: this.selectPaymentBrandsTemp[0].id, brandName: this.selectPaymentBrandsTemp[0].text, displayImage: '<img src="' + this.selectPaymentBrandsTemp[0].additional.display_image + '" alt="store Image">', acquirer_fee: this.comumService.fMoeda(this.EditDatapaymentFee.acquirer_fee) + ' - ' + this.EditDatapaymentFee.acquirer_days, acquirer_days: this.EditDatapaymentFee.acquirer_days, payout_fee: this.comumService.fMoeda(this.EditDatapaymentFee.payout_fee) + ' - ' + this.EditDatapaymentFee.payout_days, payout_days: this.EditDatapaymentFee.payout_days, icon: this.comumService.iconRemove() });
      this.dataPaymentMethodAndTax = this.dataPaymentMethodAndTaxTemp.slice();
      this.resetFieldsPayment();
    }
  }

  removeRowPaymentTax(e) {
    if ((!this.isNewContract && !this.isUpdateDisabled) || !this.EditData.id)
      if (e.column === 'icon') {
        let selectedRemove = this.dataPaymentMethodAndTax.filter(i => { return !(i.payment_method_id == e.row.payment_method_id && i.payment_brand_id == e.row.payment_brand_id) });
        this.dataPaymentMethodAndTaxTemp = selectedRemove.slice();
        this.dataPaymentMethodAndTax = selectedRemove.slice();
        this.comumService.alertWarning('Item removido com sucesso!');
      }
  }

  openModal(data, content) {
    
    if (this.comumService.accountTypeId == 1)
      this.columnsPaymentMethodAndTax.push({ title: "Adquirente  (% / Dias)", name: "acquirer_fee" });

    this.columnsPaymentMethodAndTax.push({ title: "Cliente  (% / Dias)", name: "payout_fee" })

    let btnArray = ['performancereport', 'financialreport', 'salesreport'];
    let btnClicked = false;
    if (data.table) {
      btnArray.forEach(btn => {
        if (data.table.search(btn) != -1) {
          this.geraRel(data.row.id, btn);
          btnClicked = true;
        }
        if (data.table.search('close_box') != -1) {
          this.checkOut(data.row.id);
          btnClicked = true;
        }
      });
    }


    if (btnClicked) return false; // nao abrir modal, caso clique em algum dos botoes

    this.loadPaymentBrands();
    this.loadPaymentMethods();
    this.resetFieldsEvent();

    this.contractTypeList = [{ id: '1', text: 'Recorrente' }, { id: '2', text: 'Comissão' }];
    this.billingData = new BillingContract();
    this.storeListContractTemp = new BillingContract();
    if (this.billingDataTemp && this.billingDataTemp.active) {

      if (data) {
        console.log(data.row);
        this.isNewContract = true;

        if (data.row.balance_account.billing_contract) {
          Object.keys(data.row.balance_account.billing_contract).map((objectKey, index) => {
            if (data.row.balance_account.billing_contract[objectKey].active) {
              this.dataService.jsonToModel(data.row.balance_account.billing_contract[objectKey], new BillingContract(), this.billingData);
            }
          });
        }

        let startDate = this.comumService.formatDate(data.row.start_date + ' ' + data.row.start_time);
        //if (startDate <= this.today) this.isUpdateDisabled = true; else this.isUpdateDisabled = false; MUDANÇA RAPIDA LUCAS BARROS

        if (data.row.event_store) {
          this.billingData.value = 0;
          Object.keys(data.row.event_store).map((objectKey, index) => {
            if (data.row.event_store[objectKey].event_staff) {
              this.storeHasStaff = true;
              Object.keys(data.row.event_store[objectKey].event_staff).map((stfkey, stfindex) => { // lojas e funcionarios das lojas 
                this.storesList.forEach(sl => { // array de lojas
                  if (sl.id == data.row.event_store[objectKey].store_id) { // caso o store_id seja igual ao do escolhido, atribuir o nome da loja correto
                    this.tableStoreData.push({
                      name: data.row.event_store[objectKey].event_staff[stfkey].name,
                      unique_identifier: data.row.event_store[objectKey].event_staff[stfkey].unique_identifier,
                      pin_code: data.row.event_store[objectKey].event_staff[stfkey].pin_code,
                      id: data.row.event_store[objectKey].event_staff[stfkey].id,
                      staff_token: '',
                      store: sl.text,
                      store_id: sl.id
                    });
                  }
                });
              });
            }
            if (data.row.event_store[objectKey].event_charge) {

              Object.keys(data.row.event_store[objectKey].event_charge).map((stfkey, stfindex) => { // lojas e funcionarios das lojas 
                this.storesList.forEach(sl => { // array de lojas

                  if (sl.id == data.row.event_store[objectKey].store_id) {

                    this.tableChargingData.push( // push no array dentro do foreach para inserir todas as lojas com o valor dividido entre elas
                      {
                        name: data.row.event_store[objectKey].event_charge[stfkey].name,
                        description: data.row.event_store[objectKey].event_charge[stfkey].description,
                        expense: data.row.event_store[objectKey].event_charge[stfkey].expense.toFixed(2),
                        value: data.row.event_store[objectKey].event_charge[stfkey].value.toFixed(2),
                        store_id: data.row.event_store[objectKey].store_id,
                        store_name: sl.text
                      });
                  }
                });
                this.billingData.value += data.row.event_store[objectKey].event_charge[stfkey].value;
              });
            }
            this.storesValues.push(data.row.event_store[objectKey].store_id);
          });
        }
        this.dataService.jsonToModel(data.row, new Event(), this.EditData);
        this.ModelstartDate = this.comumService.formDateView(this.EditData.start_date);
        this.ModelendDate = this.comumService.formDateView(this.EditData.end_date);
        this.setStateId(this.EditData.city.state.id, this.EditData.city.name);
        //#endregion

        // [Formas de Pagamento]
        if (data.row.balance_account.billing_contract) {
          Object.keys(data.row.balance_account.billing_contract).map((contractKey, index) => {
            if (data.row.balance_account.billing_contract[contractKey].active)
              if (data.row.balance_account.billing_contract[contractKey].billing_acquirer_agreement.active)
                if (data.row.balance_account.billing_contract[contractKey].billing_acquirer_agreement.payment_fee)
                  Object.keys(data.row.balance_account.billing_contract[contractKey].billing_acquirer_agreement.payment_fee).map((paymentFeeKey, index) => {
                    this.paymentFee = new PaymentFee();
                    this.paymentFee = data.row.balance_account.billing_contract[contractKey].billing_acquirer_agreement.payment_fee[paymentFeeKey];
                    this.dataPaymentFee.push(this.paymentFee);
                  });
          });
        } else {
          if (this.storeListContractTemp.active) {
            if (this.storeListContractTemp.billing_acquirer_agreement.payment_fee)
              Object.keys(this.storeListContractTemp.billing_acquirer_agreement.payment_fee).map((key, index) => {
                this.paymentFee = new PaymentFee();
                this.paymentFee = this.storeListContractTemp.billing_acquirer_agreement.payment_fee[key];
                this.dataPaymentFee.push(this.paymentFee);
              });
          } else {
            if (this.billingDataTemp.billing_acquirer_agreement.payment_fee)
              Object.keys(this.billingDataTemp.billing_acquirer_agreement.payment_fee).map((key, index) => {
                this.paymentFee = new PaymentFee();
                this.paymentFee = this.billingDataTemp.billing_acquirer_agreement.payment_fee[key];
                this.dataPaymentFee.push(this.paymentFee);
              });
          }
        }
      } else {
        this.isNewContract = false;
        this.dataService.jsonToModel(this.billingDataTemp, new BillingContract(), this.billingData);
        this.ModelstartDate =
          {
            year: this.comumService.today.year,
            month: this.comumService.today.month,
            day: this.comumService.today.day
          };
        this.ModelendDate =
          {
            year: this.comumService.today.year,
            month: this.comumService.today.month,
            day: this.comumService.today.day
          };

        if (this.storeListContractTemp.active) {
          if (this.storeListContractTemp.billing_acquirer_agreement.payment_fee)
            Object.keys(this.storeListContractTemp.billing_acquirer_agreement.payment_fee).map((key, index) => {
              this.paymentFee = new PaymentFee();
              this.paymentFee = this.storeListContractTemp.billing_acquirer_agreement.payment_fee[key];
              this.dataPaymentFee.push(this.paymentFee);
            });
        } else {
          if (this.billingDataTemp.billing_acquirer_agreement.payment_fee)
            Object.keys(this.billingDataTemp.billing_acquirer_agreement.payment_fee).map((key, index) => {
              this.paymentFee = new PaymentFee();
              this.paymentFee = this.billingDataTemp.billing_acquirer_agreement.payment_fee[key];
              this.dataPaymentFee.push(this.paymentFee);
            });
        }
      }
      if (this.billingData.value)
        this.billingData.value = this.comumService.fMoeda(this.billingData.value.toFixed(2));
      this.dataPaymentFee.forEach((payment, i) => {
        this.dataPaymentMethodAndTax.push({ payment_method_id: payment.payment_method_id, pg: payment.payment_method.name, payment_brand_id: payment.payment_brand.id, brandName: payment.payment_brand.name, displayImage: '<img src="' + payment.payment_brand.display_image + '" alt="store Image">', acquirer_fee: this.comumService.fMoeda(payment.acquirer_fee.toFixed(2)) + ' - ' + payment.acquirer_days, acquirer_days: payment.acquirer_days, payout_fee: this.comumService.fMoeda(payment.payout_fee.toFixed(2)) + ' - ' + payment.payout_days, payout_days: payment.payout_days, icon: this.comumService.iconRemove() });
        this.dataPaymentMethodAndTaxTemp.push(this.dataPaymentMethodAndTax[i]);
      });

      this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg", windowClass: "scrollable" });
      this.comumService.focusFirst();
    } else {
      this.comumService.alertError('Você não pode criar um evento sem cadastrar um contrato!');
    }

    if (this.storesList.length > 0) {
      this.EditData['store_name'] = this.storesList[0].text; // setando primeira posicao do array de lojas como padrao
      this.EditData['store_id'] = this.storesList[0].id; // setando primeira posicao do array de lojas como padrao
    }

    if (this.storesListCharging.length > 0)
      this.storeIDCharging = this.storesListCharging[0].id;

    this.comumService.setWindowHeight(455); // setando tamanho fixo da modal

  }

  geraRel(id, tp) {
    this.comumService.loading = true;
    this.http.get(this.dataService.getBaseUrl('v1/events/' + id + '/' + tp + '/base64'), this.dataService.options).subscribe(response => {
      this.comumService.loading = false;
      var blob = this.pdf.b64toBlob(response['_body'], "application/pdf");
      var blobUrl = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = blobUrl;
      link.download = tp + moment().format('DDMMYYYYHHMMSS') + ".pdf";
      link.click();
      setTimeout(function () {
        window.URL.revokeObjectURL(blobUrl)// For Firefox it is necessary to delay revoking the ObjectURL
          , 100
      });
    }, err => {
      console.log(err);
      this.comumService.loading = false;
    })
  }

  checkOut(id) {
    if (this.comumService.confirm('Deseja mesmo fechar o caixa?')) {
      this.comumService.loading = true;
      this.dataService.update('', 'v1/events/' + id + '/closecheckouts').subscribe(val => {
        this.comumService.loading = false;
        this.comumService.alertOk('Evento Fechado com sucesso!');
        //console.log(val);
      }, err => {
        console.log(err)
      })
    }
  }

  resetFieldsEvent() {
    this.isChargingEditionEnabled = false;
    this.isUpdateDisabled = false;
    this.storeHasStaff = false;
    this.EditData = new Event();
    this.EditDatapaymentFee = new PaymentFee();
    this.billingData = new BillingContract();
    this.cityList = [];
    this.paymentMethodsValues = [];
    this.storesValues = [];

    this.dataPaymentMethodAndTaxTemp = [];
    this.dataPaymentMethodAndTax = [];
    this.dataPaymentFee = [];
    this.selectedPaymentMethodsValue = '';
    this.selectedPaymentBrandsValue = '';

    this.formStoreData = [];
    this.formChargingData = [];
    this.tableChargingData = [];
    this.tableStoreData = [];
    this.pinArray = [];
  }

  resetFieldsPayment() {
    this.selectedPaymentMethodsValue = '';
    this.selectedPaymentBrandsValue = '';
    this.selectPaymentTemp = [];
    this.selectPaymentBrandsTemp = [];
    this.EditDatapaymentFee.acquirer_fee = 0;
    this.EditDatapaymentFee.acquirer_days = 0;
    this.EditDatapaymentFee.payout_fee = 0;
    this.EditDatapaymentFee.payout_days = 0;
  }

  OnBillingStore() {
    this.billingData.on_store_billing = !this.billingData.on_store_billing;
  }

  setFormStoreData(val) {
    this.storesValues = val;
    this.setAvailableChargingStores();
  }

  setFormChargingData(val) {
    this.storeIDCharging = val;
  }

  setChargingEdition(row) {
    this.formChargingData.name = row.name;
    this.formChargingData.expense = row.expense;
    this.formChargingData.value = row.value;
    this.formChargingData.store_id = row.store_id;
    this.storeIDCharging = row.store_id;
    this.formChargingData.description = row.description;
  }

  setAvailableChargingStores() {
    let chargingTemp = [];
    if (!this.isNewContract) {
      this.storesListCharging = [];
      let availableStores = [];
      let cont = 0;
      if (this.storeHasStaff) {
        this.storesListCharging = this.comumService.setSelect2(this.tableStoreData, 'store_id', 'store', '');

        this.storesListCharging.forEach(slc => { // montando array com lojas disponiveis
          availableStores.push(slc.id);
        });
      } else {
        this.storesList.forEach(slc => {
          if (this.storesValues.includes(slc.id)) {
            this.storesListCharging.push(slc);
            availableStores.push(slc.id)
          }
        });
      }
      if (this.storesListCharging.length > 1)
        this.storesListCharging.unshift({ id: '0', text: 'Todas' });

      this.tableChargingData.forEach(tcd => { // varrendo tabela de cobrança para excluir rows que possuem lojas nao marcadas na aba lojas 
        if (availableStores.includes(tcd.store_id))
          chargingTemp.push(tcd);
      });
      this.tableChargingData = chargingTemp;
    }
    if (this.isUpdateDisabled) {
      this.storesListCharging = [];
      this.tableStoreData.forEach(tsd => {
        this.storesValues.push(tsd.store_id);
      });
      if (this.storeHasStaff)
        this.storesListCharging = this.comumService.setSelect2(this.tableStoreData, 'store_id', 'store', '');
      else {
        this.storesList.forEach(sl => {
          if (this.storesValues.includes(sl.id))
            this.storesListCharging.push({ id: sl.id, text: sl.text });
        });
      }
    }
  }

  enableChargingEdition() {
    if (confirm('Deseja editar as informações de cobrança de um evento já finalizado?')) {
      this.isChargingEditionEnabled = !this.isChargingEditionEnabled;
    }
    this.setAvailableChargingStores();
  }

  insertChargingData() {

    let storeName;
    let valueSpended;
    let chargingValue;
    let valid = [
      [this.formChargingData['name'], "string", "Nome da Cobrança"]
    ]
    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false;
    }

    chargingValue = this.formChargingData.value ? parseFloat(this.comumService.fMoeda(this.formChargingData.value).replace(',', '.')) : 0;
    valueSpended = this.formChargingData.expense ? parseFloat(this.comumService.fMoeda(this.formChargingData.expense).replace(',', '.')) : 0;
    if (this.storeIDCharging == '0') { // opcao Todas marcada
      if (confirm('Deseja dividir o valor gasto e a cobrar entre as lojas?')) {
        chargingValue = chargingValue / this.storesList.length;
        valueSpended = valueSpended / this.storesList.length;
      }
      this.storesListCharging.forEach(s => { // lista de todas as lojas
        if (s.id != 0) {
          this.tableChargingData.push( // push no array dentro do foreach para inserir todas as lojas com o valor dividido entre elas
            {
              name: this.formChargingData.name,
              description: this.formChargingData.description,
              expense: valueSpended.toFixed(2),
              value: chargingValue.toFixed(2),
              store_id: s.id,
              store_name: s.text
            });
        }
      });
    }
    else {
      this.storesListCharging.forEach(s => { // lista de todas as lojas
        if (s.id == this.storeIDCharging) // caso seja a mesma loja, atribuir valor ao array -> somente uma loja selecionada
          storeName = s.text;
      });
      this.tableChargingData.push(
        {
          name: this.formChargingData.name,
          description: this.formChargingData.description,
          expense: valueSpended.toFixed(2),
          value: chargingValue.toFixed(2),
          store_id: this.storeIDCharging,
          store_name: storeName
        })
    }
    this.formChargingData = [];
    this.setFormChargingData(0);
  }

  insertStoreData() { // inserindo dados da aba de lojas

    if (this.formStoreData.name == undefined || this.formStoreData.name == "") {
      this.comumService.alertError('Digite o nome do funcionário!');
      return false;
    }
    if (this.formStoreData.unique_identifier == undefined) {
      this.comumService.alertError('Digite o CPF do funcionário!');
      return false;
    }
    if (this.tableStoreData.filter(i => { return (this.comumService.fCnpjCpf(i.unique_identifier) == this.formStoreData.unique_identifier && i.name != this.formStoreData.name) }).length > 0) {
      this.comumService.alertError('Um mesmo CPF não pode ser cadastrado para funcionários com nomes diferentes!');
      return false;
    }

    if (this.tableStoreData.filter(i => { return (this.comumService.fCnpjCpf(i.unique_identifier) == this.formStoreData.unique_identifier && this.storesValues.includes(i.store_id)) }).length > 0) {
      this.comumService.alertError('Um funcionário com este CPF já está cadastrado em uma das lojas selecionadas!');
      return false;
    }
    // chegou ate aqui, pode dar o push, campos validados

    this.storesValues.forEach(std => {
      let storeName = '';
      this.storesList.forEach(s => { // lista de todas as lojas
        if (s.id == std)  // caso seja a mesma loja, atribuir valor ao array
          storeName = s.text;
      });
      this.tableStoreData.push({
        name: this.formStoreData.name,
        unique_identifier: this.formStoreData.unique_identifier,
        pin_code: '',
        id: '',
        staff_token: '',
        store: storeName,
        store_id: std
      });
    });
    this.formStoreData = []; // limpando campos do formulario exceto select de lojas 
    this.storesValues = [];

  }

  nextInputFocus(el) {
    el.select();
  }

  saveData() {
    if ((this.comumService.accountTypeId == 1 && !this.isUpdateDisabled) || (this.comumService.accountTypeId == 1 && this.isChargingEditionEnabled)) {

      if (!this.validateFields()) return false;

      if (this.tableStoreData[0] == undefined && this.storeHasStaff) { // ultima validacao a ser realizada
        this.comumService.alertError('Não existem funcionários cadastrados para nenhuma loja!');
        return false;
      }

      this.EditData.start_date = moment(this.comumService.formatDate(this.renderer.selectRootElement("#startDate").value)).unix();

      if (!this.renderer.selectRootElement("#endDate").value)
        this.EditData.end_date = null;
      else
        this.EditData.end_date = moment(this.comumService.formatDate(this.renderer.selectRootElement("#endDate").value)).unix();

      let hashEventStore = new Object();
      let hashEventCharge = new Object();
      let arr = [];
      if (this.storeHasStaff)  // existem funcionarios adicionados para o evento
        arr = this.tableStoreData;
      else
        arr = this.storesValues;
      let cont = 0;
      arr.forEach(element => { // foreach em elementos adicionados na tabela
        let storeid = element.store_id ? element.store_id : element;
        if (!this.EditData['event_store_id'])
          this.EditData['event_store_id'] = element.event_id;
        if (!hashEventStore[storeid]) { // caso nao tenha essa loja no hash
          hashEventStore[storeid] = {}; //inicializando objeto
          hashEventStore[storeid] = { // setando dados 
            event_id: this.EditData['event_store_id'],
            store_id: storeid,
            billing_contract_id: null,
            event_charge: {}
          }
        }
        if (element.name) { //pois apenas o array com funcionarios tem o name
          if (!hashEventStore[storeid]['event_staff'])
            hashEventStore[storeid]['event_staff'] = {};

          hashEventStore[storeid]['event_staff']["00000000-0000-0000-0000-00000000000" + cont] = { // setando hash dentro do event_staff, a ideia e um hash pra cada loja, limite de lojas por enquanto: 9
            id: null,
            staff_token: null,
            name: element.name,
            unique_identifier: element.unique_identifier.replace(/[^0-9]/g, ""), // limpando cpf para inserir no banco
            pin_code: element.pin_code
          }
        }
        cont++;
      });

      cont = 0;
      this.tableChargingData.forEach(element => {
        if (this.tableChargingData.length > 0) {

          if (hashEventStore[element.store_id]['event_charge'] == undefined)
            hashEventStore[element.store_id]['event_charge'] = {};

          if (element.description == undefined)
            element.description = "";

          hashEventStore[element.store_id]['event_charge']["00000000-0000-0000-0000-00000000000" + cont] = { // setando hash dentro do event_staff, a ideia e um hash pra cada loja, limite de lojas por enquanto: 9
            id: null,
            event_store_id: null,
            name: element.name,
            description: element.description,
            expense: parseFloat(element.expense),
            value: parseFloat(element.value),
          }
          cont++;
        }
      });


      this.EditData['event_store'] = hashEventStore;
      //console.log(this.EditData);
      //  if (!this.isNewContract) //usar para travar a inserção no banco de dados e observar o objeto que esta sendo enviado
      //    return false;


      this.EditData.postal_code = this.EditData.postal_code.replace(/[^0-9]/g, "");
      let accountDetailId = this.path.split('account_detail/')[1];
      this.EditData.account_detail_id = accountDetailId;

      if (!this.isNewContract) {
        let h = new Object();
        let billingAcquirerAgreementCorrent: any;
        let bankDetailCorrent: any;
        let bankDetail = new BankDetail();
        let billingAcquirerAgreement = new BillingAcquirerAgreement();
        if (this.billingData.contract_type == '1') {

          if (this.storeListContractTemp.active) {
            this.storeListContractTemp.billing_acquirer_agreement.payment_acquirer_code = this.billingData.billing_acquirer_agreement.payment_acquirer_code;
            this.storeListContractTemp.billing_acquirer_agreement.payment_acquirer_id = this.billingData.billing_acquirer_agreement.payment_acquirer_id;
            this.storeListContractTemp.contract_type = this.billingData.contract_type;
            this.dataService.jsonToModel(this.storeListContractTemp, new BillingContract(), this.billingData);
          } else {
            this.billingDataTemp.billing_acquirer_agreement.payment_acquirer_code = this.billingData.billing_acquirer_agreement.payment_acquirer_code;
            this.billingDataTemp.billing_acquirer_agreement.payment_acquirer_id = this.billingData.billing_acquirer_agreement.payment_acquirer_id;
            this.billingDataTemp.contract_type = this.billingData.contract_type;
            this.dataService.jsonToModel(this.billingDataTemp, new BillingContract(), this.billingData);
          }

        } else {

          if (this.storeListContractTemp.active) {
            this.billingData.billing_acquirer_agreement.payment_acquirer_code = this.storeListContractTemp.billing_acquirer_agreement.payment_acquirer_code;
            this.billingData.billing_acquirer_agreement.payment_acquirer_id = this.storeListContractTemp.billing_acquirer_agreement.payment_acquirer_id;
          } else {
            this.billingData.billing_acquirer_agreement.payment_acquirer_code = this.billingDataTemp.billing_acquirer_agreement.payment_acquirer_code;
            this.billingData.billing_acquirer_agreement.payment_acquirer_id = this.billingDataTemp.billing_acquirer_agreement.payment_acquirer_id;
          }

        }
        //debugger;
        this.billingData.bank_detail.bank_id = this.billingData.bank_detail.bank.id;
        this.billingData.value = parseFloat(this.comumService.fMoeda(this.billingData.value).toString().replace(',', '.'));
        //this.billingData.bank_detail.unique_identifier = this.billingData.bank_detail.unique_identifier.replace(/[^0-9]/g, "");
        this.billingData.id = null;
        this.EditData.balance_account.billing_contract = { "00000000-0000-0000-0000-000000000000": this.billingData }
        this.EditData.balance_account.billing_contract["00000000-0000-0000-0000-000000000000"]["firebase_path"] = '';
        this.EditData.balance_account.billing_contract["00000000-0000-0000-0000-000000000000"]['billing_acquirer_agreement_id'] = null;

        billingAcquirerAgreementCorrent = this.EditData.balance_account.billing_contract["00000000-0000-0000-0000-000000000000"].billing_acquirer_agreement;
        billingAcquirerAgreement.active = billingAcquirerAgreementCorrent.active;
        billingAcquirerAgreement.payment_acquirer_code = billingAcquirerAgreementCorrent.payment_acquirer_code;
        billingAcquirerAgreement.payment_acquirer_id = billingAcquirerAgreementCorrent.payment_acquirer_id;
        billingAcquirerAgreement.value = billingAcquirerAgreementCorrent.value;
        this.EditData.balance_account.billing_contract["00000000-0000-0000-0000-000000000000"].billing_acquirer_agreement = billingAcquirerAgreement;

        this.dataPaymentMethodAndTax.forEach((p, i) => {
          this.paymentFee = new PaymentFee();
          this.paymentFee.acquirer_fee = parseFloat(p.acquirer_fee.toString().replace(',', '.'));
          this.paymentFee.acquirer_days = parseFloat(p.acquirer_days);
          this.paymentFee.payout_fee = parseFloat(p.payout_fee.toString().replace(',', '.'))
          this.paymentFee.payout_days = parseFloat(p.payout_days);
          this.paymentFee.payment_brand_id = p.payment_brand_id;
          this.paymentFee.payment_method_id = p.payment_method_id;
          h["00000000-0000-0000-0000-00000000000" + i] = this.paymentFee;
        });
        this.EditData.balance_account.billing_contract["00000000-0000-0000-0000-000000000000"].billing_acquirer_agreement.payment_fee = h;
      } else
        this.EditData.balance_account = new BalanceAccount();



      //#endregion
      this.comumService.loading = true;
      if (this.EditData.id) {

        //this.EditData.account_detail_id = accountDetailId;
        this.EditData.start_time = this.EditData.start_time.length < 8 ? this.EditData.start_time + ":00" : this.EditData.start_time;
        this.EditData.end_time = this.EditData.end_time.length < 8 ? this.EditData.end_time + ":00" : this.EditData.end_time;
        console.log(JSON.stringify(this.EditData));
        this.dataService
          .update(this.EditData, "v1/accountdetails/" + accountDetailId + "/events/" + this.EditData.id)
          .subscribe(val => {
            //this.saveEventStore(this.EditData.id);
            this.comumService.modalReference.close();
            this.comumService.loading = false
            this.isKeepPaging = true;
          },
            Error => {
              this.comumService.errorModal('Ocorreu um Erro');
              console.log(Error);
            });
      } else {
        this.EditData.start_time = this.EditData.start_time + ":00";
        this.EditData.end_time = this.EditData.end_time + ":00";

        //console.log(JSON.stringify(this.EditData));
        this.dataService
          .addEntity(this.EditData, "v1/accountdetails/" + accountDetailId + "/events")
          .subscribe(val => {
            //this.saveEventStore(val.result);
            this.comumService.modalReference.close();
            this.comumService.loading = false
            this.isKeepPaging = true;
          },
            Error => {
              this.comumService.errorModal('Ocorreu um Erro');
              console.log(Error);
            });
      }
    }
  }

  saveEventStore(event) {
    let stores = []
    for (var i in this.storesValues) {
      stores.push({ store_id: this.storesValues[i] });
    }
    this.dataService
      .addEntity(stores, "v1/events/" + event + "/eventstores")
      .subscribe(val => {
        this.comumService.modalReference.close();
        this.comumService.loading = false
      },
        Error => {
          this.comumService.errorModal('Ocorreu um Erro');
          //console.log(Error);
        });
  }
  deleteData() {
    if (this.comumService.accountTypeId == 1 && !this.isUpdateDisabled)
      if (confirm('Você deseja mesmo excluir o Evento ' + this.EditData.name)) {
        this.dataService.delete("v1/events/" + this.EditData.id).subscribe(val => {
          //console.log(val);
          this.comumService.modalReference.close();
          this.isKeepPaging = true;
        },
          Error => {
            this.comumService.errorModal('Ocorreu um Erro');
            //console.log(Error);
          });
      }
  }

  //region [ Validação ]

  validateStartDate() {
    let inputStartDate = this.renderer.selectRootElement("#startDate");
    if (inputStartDate.value === '')
      return "";
    else return inputStartDate.value
  }

  validateStarTime() {
    if (
      !this.EditData.start_time ||
      this.EditData.start_time.replace(/[_,:]/g, "").length < 4
    )
      return "";
    else return this.EditData.start_time;
  }

  validateEndTime() {
    if (
      !this.EditData.end_time ||
      this.EditData.end_time.replace(/[_,:]/g, "").length < 4
    )
      return "";
    else return this.EditData.end_time;
  }

  validateCPF() {
    return this.EditData.postal_code
      .replace(/[_,\/]/g, "")
      .replace(/[-,\/]/g, "")
      .length < 8 ? '' : this.EditData.postal_code;
  }

  private validateFields() {

    let valid = [
      [this.EditData.name, "string", "Evento"],
      [this.validateStartDate(), "string", "Data Inicial"],
      [this.validateStarTime(), "string", "Hora Início"],
      [this.validateEndTime(), "string", "Hora Fim"],
      [this.validateCPF(), "string", "CEP"],
      [this.EditData.address_1, "string", "Endereço"],
      [this.EditData.city.state.id || 0, "combo", "Estados"],
      [this.EditData.city.id || 0, "combo", "Cidades"],
    ];

    if (!this.isNewContract) {
      valid.push([this.billingData.contract_type, 'combo', 'Tipo de Contrato']);
      if (this.billingData.contract_type == '2') {
        valid.push([this.billingData.bank_detail.bank.id, 'combo', 'Banco']);
        valid.push([this.billingData.bank_detail.account_type, 'combo', 'Tipo de Conta']);
        valid.push([this.billingData.bank_detail.agency_number, 'string', 'Agência']);
        valid.push([this.billingData.bank_detail.account_number, 'string', 'Conta']);
      } else {
        valid.push([this.billingData.billing_acquirer_agreement.payment_acquirer_id == null ? '0' : this.billingData.billing_acquirer_agreement.payment_acquirer_id, 'combo', 'Adquirente']);
        valid.push([this.billingData.billing_acquirer_agreement.payment_acquirer_code, 'string', 'Código Adquirente']);
      }
      valid.push([this.dataPaymentMethodAndTax.length, "table", "Forma de Pagamento"]);
    }

    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false;
    }

    return true;
  }

  //endregion
}

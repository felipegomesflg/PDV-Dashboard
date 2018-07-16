import { Component, OnInit, Renderer, Input, ChangeDetectorRef } from "@angular/core";

import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage";
import { AngularFireDatabase } from "angularfire2/database";
import { Select2OptionData } from "ng2-select2";
import { CropperSettings } from "ng2-img-cropper";
import { Http } from "@angular/http";

import { DataService } from "./../../services/data.service";
import { AuthGuard } from "../../services/auth.service";
import { ComumService } from "../../services/comum.service";

import { AccountDetail } from "../../models/account-detail.model"
import { Store } from "../../models/store.model"
import { BalanceAccount } from "../../models/balance-account.model"
import { BillingContract } from "../../models/billing-contract.model"
import { Bank } from "../../models/bank.model"
import { PaymentFee } from "../../models/payment-fee.model";

import { AfterViewChecked } from "@angular/core/src/metadata/lifecycle_hooks";



@Component({
  selector: 'app-account-store',
  templateUrl: './account-store-modal.component.html',
})

export class AccountStoreComponent implements OnInit, AfterViewChecked {
  private jsonEstate: any[];
  private data: Array<any> = [];
  private path: any;
  private EditData: any;
  private sendData: any;
  private textTab: string = 'Loja';

  private bankData: Bank = new Bank();
  private billingData: BillingContract = new BillingContract(); //variavel para fazer gambiarra, visto que api espera algo que é apenas gambiarravel
  private EditDatapaymentFee: PaymentFee = new PaymentFee();
  private hasFantasyName: boolean = false;
  private hasCpf: boolean = false;
  //private hasCnpjCpf: boolean = false;

  profileImg: any;
  cropperSettings: CropperSettings;
  private dataPaymentMethodAndTaxTemp: any;
  private dataPaymentMethodAndTax: Array<any> = [];
  private selectedPaymentMethodsValue: string;
  private selectedPaymentBrandsValue: string;
  private selectPaymentTemp: Array<Select2OptionData>;
  private selectPaymentBrandsTemp: Array<Select2OptionData>;
  private paymentMethodsList: Array<Select2OptionData>;
  private paymentBrandsList: Array<Select2OptionData>;
  private paymentMethodsArray: Array<any> = [];
  private paymentBrandsArray: Array<any> = [];
  private dataPaymentFee: Array<any> = [];
  private paymentFee: PaymentFee = new PaymentFee();
  private isStore = false;

  public accountTypeList: Array<Select2OptionData>;
  public bankList: Array<Select2OptionData>;
  public cityList: Array<Select2OptionData>;
  public stateList: Array<Select2OptionData>;
  private contractTypeList: Array<Select2OptionData>;
  public acquirerList: Array<Select2OptionData>;

  public isNewContract: boolean = false;

  public editPayment: any;

  @Input('title') title: any;


  public columns: Array<any> = [
    { title: "Logo", name: "table_image", sort: false, className: ['hidden-xs'] },
    {
      title: "CNPJ",
      name: "table_cnpj"
    },
    {
      title: "Nome",
      name: "trade_name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por Nome da Empresa" }
    },
    {
      title: "Contato",
      name: "table_name",
      filtering: { filterString: "", placeholder: "Filtrar por Nome do Contato" },
      className: ['hidden-xs']
    },
    {
      title: "Telefone",
      name: "table_phone",
      className: ['hidden-xs']
    }
  ];

  public columnsPaymentMethodAndTax: Array<any> = [
    { title: "", name: "displayImage", sort: false },
    { title: "Tipo", name: "pg", sort: 'asc' },
    //{ title: "Nome Bandeira",name: "brandName"},        
    { title: "Adquirente  (% / Dias)", name: "acquirer_feeTemp" },
    //{ title: "Taxa/Dias", name: "acquirer_days"},
    { title: "Cliente  (% / Dias)", name: "payout_feeTemp" },
    //{ title: "Taxa/Dias", name: "payout_days"},
    //{ title: "", name: "icon", sort: false }
    
  ];

  constructor(
    private renderer: Renderer,
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private dataService: DataService,
    private authService: AuthGuard,
    private ref: ChangeDetectorRef
  ) {
  }


  ngOnInit() {

    this.contractTypeList = [{ id: '1', text: 'Recorrente' }, { id: '2', text: 'Comissão' }];

    if (this.title == 'Contrato')
      this.textTab = 'Contratante';

    this.resetData(); //pois é necessario instanciar o objeto (loja ou contrato)
    this.searchStates();
    this.loadPaymentMethods();
    this.loadPaymentBrands();
    this.comumService.path.subscribe(val => {
      this.searchStates();
    });
    this.loadData(this.localStorage.get("storeid"));
  }

  setContractType(ContractTypeId) {
    if (ContractTypeId)
      this.billingData.contract_type = ContractTypeId;
    //console.log(ContractTypeId, this.billingData.contract_type)
  }

  searchStates() {
    this.comumService.loading = true;
    this.dataService.getList("v1/states").subscribe(val => {
      //fazendo combo de estados
      this.stateList = this.comumService.setSelect2(val.result, "id", "abbreviation", "Selecione");
      this.loadBank();
    },
      // onError
      e => {
        //console.log("onError: %s", e);
      }
    );
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
  }

  onlyNumber(e) {
    let v = e.value.replace(/[^0-9]/g, "");
    e.value = v;
  }

  bindCnpjCpf(e) {
    if (!this.EditData.id) {
      if (e.target.value.replace(/[^0-9]/g, "").length === 11) {
        this.hasCpf = true;
        // this.resetCnpjCpf();
        // this.comumService.fmask(this.comumService.fCnpjCpf,e.target,'CPF inválido');  
        this.formatCnpjAndCpf(e, 'CPF inválido');
      } else if (e.target.value.replace(/[^0-9]/g, "").length >= 14) {
        this.hasCpf = false;
        this.formatCnpjAndCpf(e, 'CNPJ inválido');
      } else {
        this.resetCnpjCpf();
      }
    }
  }

  formatCnpjAndCpf(e, msg) {
    this.resetCnpjCpf();
    this.comumService.fmask(this.comumService.fCnpjCpf, e.target, msg);
    this.searchCnpj(e);
  }

  resetCnpjCpf() {
    this.EditData.company_name = '';
    this.EditData.trade_name = '';
    this.EditData.postal_code = '';
    this.EditData.address_1 = '';
    if (this.title == 'Contrato')
      this.EditData.city.state.id = 0;
    this.EditData.address_2 = '';
  }

  loadBank() {
    //this.comumService.loading = true;
    this.dataService.getList('v1/banks')
      .subscribe(val => {
        this.bankList = this.comumService.setSelect2(val.result, 'id', 'name', 'Selecione');
        this.loadAcquirer();
        this.comumService.loading = false;
      },
      Error => {
        this.comumService.alertError('Ocorreu um Erro');
        //console.log(Error);
        this.comumService.loading = false;
      });
  }


  loadAcquirer() {
    this.dataService.getList('v1/paymentacquirers')
      .subscribe(val => {
        this.acquirerList = this.comumService.setSelect2(val.result, 'id', 'name', 'Selecione');
        this.loadData(this.localStorage.get("storeid"));
        this.comumService.loading = false;
      },
      Error => {
        this.comumService.alertError('Ocorreu um Erro');
        //console.log(Error);
        this.comumService.loading = false;
      });
  }

  loadData(storeid) {
    this.comumService.loading = true;
    this.path = this.localStorage.get("path");
    let getPath = '';

    if (this.title == 'Contrato') //se for accountDetail ou Store
      getPath = this.path.split('/')[0] + "/account_detail"
    else
      getPath = this.path + "/store"

    this.db.list(getPath).subscribe(a => {

      this.data = [];
      a.forEach(val => {
        let vl = val;
        if (!vl["display_image"])
          vl["table_image"] = '<img src="' + this.comumService.noImgStoreAccount + '" alt="store Image">';
        else
          vl["table_image"] = '<img src="' + vl["display_image"] + '" alt="store Image">';

        vl["table_name"] = val.contact_detail.name;
        vl["table_cnpj"] = this.comumService.fCnpj(val.unique_enterprise_number);
        vl["table_phone"] = this.comumService.fPhone(val.contact_detail.phone_number);
        //delete vl['product_category'];
        this.data.push(vl);
      });
      this.comumService.loading = false;
    });

    this.accountTypeList = [
      { id: '0', text: "Selecione" },
      { id: 'Conta Corrente', text: "Conta Corrente" },
      { id: 'Poupança', text: "Poupança" }
    ];
  }

  formContracting(form: string) {
    this.resetFieldsPayment();
    if (form == 'getForm') {
      this.comumService.loading = true;
      this.db.list(this.path + '/balance_account/billing_contract').subscribe(a => {
        a.forEach(val => {

          if (val.active) {
            this.dataService.jsonToModel(val, new BillingContract(), this.billingData);
            if (this.billingData.value)
              this.billingData.value = this.comumService.fMoeda(this.billingData.value.toFixed(2));
            this.billingData.id = null;
            this.dataPaymentFee = [];
            this.dataPaymentMethodAndTax = [];
            this.dataPaymentMethodAndTaxTemp = [];


            Object.keys(val.billing_acquirer_agreement.payment_fee).map((paymentFeeKey, index) => {
              this.paymentFee = new PaymentFee();
              this.paymentFee = val.billing_acquirer_agreement.payment_fee[paymentFeeKey];

              this.dataPaymentFee.push(this.paymentFee);
            });

            if (this.dataPaymentFee)
              this.dataPaymentFee.forEach((payment, i) => {
                this.dataPaymentMethodAndTax.push({
                  payment_method_id: payment.payment_method_id,
                  pg: payment.payment_method.name,
                  payment_brand_id: payment.payment_brand.id,
                  brandName: payment.payment_brand.name,
                  displayImage: '<img src="' + payment.payment_brand.display_image + '" alt="store Image">',
                  acquirer_fee: payment.acquirer_fee,
                  acquirer_feeTemp: this.comumService.fMoeda(payment.acquirer_fee.toFixed(2)) + ' - ' + payment.acquirer_days,
                  acquirer_days: payment.acquirer_days,
                  payout_fee: payment.payout_fee,
                  payout_feeTemp: this.comumService.fMoeda(payment.payout_fee.toFixed(2)) + ' - ' + payment.payout_days,
                  payout_days: payment.payout_days, icon: this.comumService.iconRemove()
                });
                this.dataPaymentMethodAndTaxTemp.push(this.dataPaymentMethodAndTax[i]);
              });
          }

        });
        this.comumService.loading = false;
      });
    } else {
      this.billingData = new BillingContract();
      this.dataPaymentFee = [];
      this.resetPayments();
      this.resetFieldsPayment();
    }
  }

  loadPaymentMethods() {
    //if(this.comumService.accountTypeId == 1)
    this.dataService.getList("v1/PaymentMethods").subscribe(val => {
      this.paymentMethodsArray = val.result.filter(f => { return f.active });
      //fazendo combo de PaymentMethods
      this.paymentMethodsList = this.comumService.setSelect2(
        this.paymentMethodsArray,
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
    //if(this.comumService.accountTypeId == 1)
    this.dataService.getList("v1/paymentbrands").subscribe(val => {
      //console.log(val);
      this.paymentBrandsArray = val.result;
      //fazendo combo de paymentbrands
      this.paymentBrandsList = this.comumService.setSelect2(
        this.paymentBrandsArray,
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
    this.EditData["display_image"] =
      "data:image/jpg;base64," + btoa(binaryString);
  }

  setFocus(type: string) {
    let element = this.renderer.selectRootElement(`#${type}`);
    this.renderer.invokeElementMethod(element, 'focus');
  }

  setPaymentMethodsValues(id) {
    if (this.selectedPaymentMethodsValue !== '') {
      this.selectPaymentTemp = [];
      this.selectPaymentTemp = this.paymentMethodsList.filter(i => { return i.id == id });

      // if((this.dataPaymentMethodAndTaxTemp && this.selectPaymentTemp && this.selectPaymentBrandsTemp) && (this.selectPaymentTemp.length > 0 && this.selectPaymentBrandsTemp.length > 0)  &&
      //   (this.selectPaymentTemp[0].id != '' && this.selectPaymentBrandsTemp[0].id != '') &&
      //   (this.dataPaymentMethodAndTaxTemp.filter(i=>{return i.payment_method_id == this.selectPaymentTemp[0].id})).length > 0 &&
      //   (this.dataPaymentMethodAndTaxTemp.filter(i=>{return i.payment_brand_id == this.selectPaymentBrandsTemp[0].id})).length > 0){
      //   this.comumService.alertWarning('Este item já foi adicionado a lista!');
      //   this.resetFieldsPayment();              
      //   return false;
      // }  

    }
    this.selectedPaymentMethodsValue = id;
  }

  setPaymentBrandsValues(id) {
    if (this.selectedPaymentBrandsValue !== '') {
      this.selectPaymentBrandsTemp = [];
      this.selectPaymentBrandsTemp = this.paymentBrandsList.filter(i => { return i.id == id });

      // if((this.dataPaymentMethodAndTaxTemp && this.selectPaymentTemp && this.selectPaymentBrandsTemp) && (this.selectPaymentTemp.length > 0 && this.selectPaymentBrandsTemp.length > 0) &&
      //   (this.selectPaymentTemp[0].id != '' && this.selectPaymentBrandsTemp[0].id != '')){

      //     let tempPayment = this.dataPaymentMethodAndTaxTemp.filter(i=>{return i.payment_method_id == this.selectPaymentTemp[0].id});
      //     if(tempPayment.filter(i => {return i.payment_brand_id == this.selectPaymentBrandsTemp[0].id}).length > 0){
      //       this.comumService.alertWarning('Este item já foi adicionado a lista!');
      //       this.resetFieldsPayment(); 
      //       return false;
      //     }

      // }else{          
      //   this.setFocus('numberTax');
      // }
    }
    this.selectedPaymentBrandsValue = id;
  }

  addPaymentMethodTax() {
    if (this.selectedPaymentMethodsValue == '' || this.selectedPaymentBrandsValue == '')
      this.comumService.alertError('Selecione um tipo de pagamento e a Bandeira do cartão!');
    else if (this.EditDatapaymentFee.acquirer_fee == 0 || this.EditDatapaymentFee.payout_fee == 0)
      this.comumService.alertError('Digite as taxas, os valores das taxa devem ser maiores que zero!');
    // else if(parseFloat(this.EditDatapaymentFee.payout_fee.toString()) < parseFloat(this.EditDatapaymentFee.acquirer_fee.toString()))
    //   this.comumService.alertError('A taxa do cliente deve ser maior ou igual a taxa do adquirente!');
    else if (this.EditDatapaymentFee.acquirer_days <= 0 || this.EditDatapaymentFee.payout_days <= 0)
      this.comumService.alertError('Digite os dias, os dias devem ser maiores que zero!');
    else if (this.editPayment) {
      let selectedEdit = this.dataPaymentMethodAndTax.filter(i => { return !(i.payment_method_id == this.editPayment.payment_method_id && i.payment_brand_id == this.editPayment.payment_brand_id) });
      this.dataPaymentMethodAndTaxTemp = selectedEdit.slice();
      this.dataPaymentMethodAndTax = selectedEdit.slice();
      this.editPayment = '';
      this.comumService.alertWarning('Edição realizada com sucesso!');
    } else {
      let tempPayment = this.dataPaymentMethodAndTaxTemp.filter(i => { return i.payment_method_id == this.selectPaymentTemp[0].id });
      if (tempPayment.filter(i => { return i.payment_brand_id == this.selectPaymentBrandsTemp[0].id }).length > 0) {
        this.comumService.alertWarning('Este item já foi adicionado a lista!');
        return false;
      }
    }
    this.dataPaymentMethodAndTaxTemp.push({
      payment_method_id: this.selectPaymentTemp[0].id,
      pg: this.selectPaymentTemp[0].text,
      payment_brand_id: this.selectPaymentBrandsTemp[0].id,
      brandName: this.selectPaymentBrandsTemp[0].text,
      displayImage: '<img src="' + this.selectPaymentBrandsTemp[0].additional.display_image + '" alt="store Image">',
      acquirer_fee: this.EditDatapaymentFee.acquirer_fee,
      acquirer_feeTemp: this.comumService.fMoeda(parseFloat(this.EditDatapaymentFee.acquirer_fee.toString()).toFixed(2)) + ' - ' + this.EditDatapaymentFee.acquirer_days,
      acquirer_days: this.EditDatapaymentFee.acquirer_days,
      payout_fee: this.EditDatapaymentFee.payout_fee,
      payout_feeTemp: this.comumService.fMoeda(parseFloat(this.EditDatapaymentFee.payout_fee.toString()).toFixed(2)) + ' - ' + this.EditDatapaymentFee.payout_days,
      payout_days: this.EditDatapaymentFee.payout_days, icon: this.comumService.iconRemove()
    });
    this.dataPaymentMethodAndTax = this.dataPaymentMethodAndTaxTemp.slice();
    this.resetFieldsPayment();
  }

  editPaymentMethod(e) {
    

    if (this.isNewContract || !this.EditData.id)
      if (e.column === 'icon') {
        let selectedRemove = this.dataPaymentMethodAndTax.filter(i => { return !(i.payment_method_id == e.row.payment_method_id && i.payment_brand_id == e.row.payment_brand_id) });
        this.dataPaymentMethodAndTaxTemp = selectedRemove.slice();
        this.dataPaymentMethodAndTax = selectedRemove.slice();
        this.comumService.alertWarning('Item removido com sucesso!');

      } else {
        this.editPayment = e.row;
        this.selectedPaymentMethodsValue = e.row.payment_method_id;
        this.selectedPaymentBrandsValue = e.row.payment_brand_id;
        this.EditDatapaymentFee.acquirer_fee = e.row.acquirer_fee;
        this.EditDatapaymentFee.acquirer_days = e.row.acquirer_days;
        this.EditDatapaymentFee.payout_fee = e.row.payout_fee;
        this.EditDatapaymentFee.payout_days = e.row.payout_days;
      }
  }

  openModal(content, data) {
    this.resetPayments();
    this.isNewContract = false;
    this.dataPaymentFee = [];
    this.selectedPaymentMethodsValue = '';
    this.selectedPaymentBrandsValue = '';
    this.isStore = this.title != 'Contrato'

    if (data) {

      this.isStore = false;
      //#region [Formas de Pagamento]

      if (data.row.balance_account.billing_contract)
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
        this.dataPaymentMethodAndTax = [];
        this.dataPaymentMethodAndTaxTemp = [];
      if (this.dataPaymentFee){
        this.dataPaymentFee.forEach((payment, i) => {
          let arr ={
            payment_method_id: payment.payment_method_id,
            pg: payment.payment_method.name,
            payment_brand_id: payment.payment_brand.id,
            brandName: payment.payment_brand.name,
            displayImage: '<img src="' + payment.payment_brand.display_image + '" alt="store Image">',
            acquirer_fee: payment.acquirer_fee,
            acquirer_feeTemp: this.comumService.fMoeda(payment.acquirer_fee.toFixed(2)) + ' - ' + payment.acquirer_days,
            acquirer_days: payment.acquirer_days,
            payout_fee: payment.payout_fee,
            payout_feeTemp: this.comumService.fMoeda(payment.payout_fee.toFixed(2)) + ' - ' + payment.payout_days,
            payout_days: payment.payout_days,
            icon: this.comumService.iconRemove()
          };
          this.dataPaymentMethodAndTax.push(arr);
          this.dataPaymentMethodAndTaxTemp.push(arr);
        });
        
      }

      ////#endregion


      if (this.title == 'Contrato') {
        this.dataService.jsonToModel(data.row, new AccountDetail(), this.EditData);
        this.setStateId(this.EditData.city.state.id, this.EditData.city.name);
      } else
        this.dataService.jsonToModel(data.row, new Store(), this.EditData);


      if (data.row.balance_account.billing_contract) {
        Object.keys(data.row.balance_account.billing_contract).map((objectKey, index) => {
          if (data.row.balance_account.billing_contract[objectKey].active)
            this.dataService.jsonToModel(data.row.balance_account.billing_contract[objectKey], new BillingContract(), this.billingData);
        });
      } else {
        this.billingData = new BillingContract();
      }

      this.billingData.bank_detail.unique_identifier = this.comumService.fCnpjCpf(this.billingData.bank_detail.unique_identifier);
      
      if (this.billingData.value.toString()!='')
        this.billingData.value = this.comumService.fMoeda(this.billingData.value.toFixed(2));

      //if(this.billingData.billing_acquirer_agreement.value)
      //  this.billingData.billing_acquirer_agreement.value = this.comumService.fMoeda(this.billingData.billing_acquirer_agreement.value.toFixed(2));

      this.EditData.contact_detail.phone_number = this.comumService.fPhone(this.EditData.contact_detail.phone_number);


      if (!this.EditData.display_image)
        this.EditData["display_image"] = this.comumService.noImgStoreAccount;

    } else {
      this.resetData();
    }

    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg", windowClass: "scrollable" });

    if (!this.EditData.id)
      this.comumService.focusFirst();

    this.comumService.setWindowHeight(590);
  }

  resetData() {

    this.billingData = new BillingContract();
    if (this.title == 'Contrato')
      this.EditData = new AccountDetail();
    else
      this.EditData = new Store();
    this.EditData.display_image = this.comumService.noImgStoreAccount;
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

  searchCnpj(e: any) {

    if ((this.comumService.isCPFValid(e.target.value) && e.target.value.replace(/[^0-9]/g, "").length === 11) || (this.comumService.isCNPJValid(e.target) && e.target.value.replace(/[^0-9]/g, "").length === 14)) {

      let uri: string;
      if (this.title == 'Contrato')
        uri = 'v1/accountdetails?unique_enterprise_number=' + e.target.value.replace(/[^0-9]/g, "")
      else
        uri = 'v1/stores?unique_enterprise_number=' + e.target.value.replace(/[^0-9]/g, "")

      this.dataService.getList(uri)
        .subscribe(val => {
          if (val.result.length > 0) {
            if (val.result[0].unique_enterprise_number.length > 11)
              this.comumService.alertError('CNPJ já consta em nosso sitema.');
            else
              this.comumService.alertError('CPF já consta em nosso sitema.');

            e.target.value = '';
            this.searchCnpj(e); //para apagar os valores
          } else {
            if (e.target.value.replace(/[^0-9]/g, "").length > 11)
              this.comumService.readCNPJ(e.target.value).subscribe(res => {
                this.respCNPJ(res.json());
              });
          }

        }, Error => {
          // if(e.target.value.replace(/[^0-9]/g, "").length > 11)
          //     this.comumService.readCNPJ(e.target.value).subscribe(res => {
          //       this.respCNPJ(res.json());
          //     });
          this.comumService.loading = false;
        });

    } else {
      this.EditData.unique_enterprise_number = "";
      this.EditData.company_name = "";
      this.EditData.trade_name = "";
    }
  }

  respCNPJ(jsonRes) {
    //console.log(jsonRes);
    if (jsonRes.fantasia)
      this.hasFantasyName = true
    else
      this.hasFantasyName = false

    this.EditData.trade_name = jsonRes.fantasia;
    this.EditData.company_name = jsonRes.nome;

    if (this.EditData.city) {
      this.EditData.postal_code = jsonRes.cep;
      this.onSearchCEP(jsonRes.cep);
    }

  }


  setStateId(id, cityName) {
    this.cityList = [];
    this.EditData.city.state.id = id;
    if (id) {
      this.comumService.loading = true;
      this.dataService.getList(`v1/cities?state_id=${id}`).subscribe(
        val => {
          this.comumService.loading = false;
          // fazendo combo de estados
          this.cityList = this.comumService.setSelect2(
            val.result,
            "id",
            "name",
            cityName || "Selecione"
          );
        },
        // onError
        e => {
          //console.log("onError: %s", e);
        }
      );
      if (!cityName)
        this.EditData.city.id = null;
    }
  }

  onSearchCEP(cep) {
    this.comumService.loading = true;
    if (cep.replace(/\D/g, "").length == 8) {
      this.comumService.readCEP(cep).subscribe(cep => {
        //console.log(cep);
        this.comumService.loading = false;
        if (!cep["_body"].erro) {

          this.EditData.address_1 =
            cep["_body"].logradouro + " - " + cep["_body"].bairro;

          if (!!this.stateList)
            this.stateList.forEach(i => {

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

        } else {
          //console.log(cep);
        }

      },
        // onError
        e => {
          //console.log("onError: %s", e)
        }
      );
    } else {
      this.comumService.loading = false;
      this.EditData.address_1 = '';
      this.EditData.city.state.id = null;
      this.EditData.city.id = null;
    }
  }


  setCityId(id) {
    if (id) this.EditData.city.id = id;
  }


  saveData() {

    //this.EditData.display_image = this.EditData['imgUrl'];

    this.comumService.loading = true;
    if (!this.validateFields()) {
      //this.EditData.display_image = typeof this.EditData['imgUrl'] === "undefined" || this.EditData['imgUrl'] === "" ? this.comumService.noImgStoreAccount : this.EditData['imgUrl'];
      this.comumService.loading = false;
      return false;
    }
    if (this.EditData.city)
      this.EditData.city_id = this.EditData.city.id;

    this.EditData.unique_enterprise_number = this.EditData.unique_enterprise_number.replace(/[^0-9]/g, "");
    this.EditData.contact_detail.phone_number = '+' + this.EditData.contact_detail.phone_number.replace(/[^0-9]/g, "");

    if (this.title == 'Contrato')
      this.EditData.postal_code = this.EditData.postal_code.replace(/[^0-9]/g, "");

    //let billingData_value = this.renderer.selectRootElement(".billingData_value");
    //let acquirer_value = this.renderer.selectRootElement(".acquirer_value");

    //if(!this.EditData.id || (this.EditData.id && !this.billingData.id)){
    if (this.isNewContract) {
      let h = new Object();

      this.billingData.bank_detail.bank_id = this.billingData.bank_detail.bank.id;
      if(!this.billingData.value)
      this.billingData.value = 0;
      this.billingData.value = parseFloat(this.comumService.fMoeda(this.billingData.value).toString().replace(',', '.'));
      //this.billingData.billing_acquirer_agreement.value = parseFloat(this.comumService.fMoeda(this.billingData.billing_acquirer_agreement.value.toString().replace(',','.')));      

      //if(this.billingData.billing_acquirer_agreement.value)
      //   this.billingData.billing_acquirer_agreement.value = parseFloat(this.comumService.fMoeda(this.billingData.billing_acquirer_agreement.value.toString()).replace(',','.'));
      // else
      //   this.billingData.billing_acquirer_agreement.value = 0.0;

      this.billingData.bank_detail.unique_identifier = this.billingData.bank_detail.unique_identifier.replace(/[^0-9]/g, "");
      this.billingData.id = "00000000-0000-0000-0000-000000000000";
      this.EditData.balance_account.billing_contract = { "00000000-0000-0000-0000-000000000000": this.billingData };

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

    if (this.hasCpf)
      this.EditData.trade_name = this.EditData.company_name;
    if (this.EditData.id == null) {
      let postPath = ''
      if (this.title == 'Contrato')
        postPath = 'v1/accountdetails'
      else
        postPath = 'v1/accountdetails/' + this.path.split('account_detail/')[1] + '/stores'

      //console.log(JSON.stringify(this.EditData));
      this.dataService.addEntity(this.EditData, postPath)
        .subscribe(val => {
          if (this.title == 'Contrato')
            this.authService.reloadAccounts();//RELOAD NA LISTA DE CONTRATOS DO HEADER CASO SEJA NOVO CONTRATO
          this.comumService.loading = false;
          this.comumService.modalReference.close();
        },
        Error => {
          this.comumService.errorModal('Ocorreu um Erro');
          console.log(Error);
        });
    } else {
      let id = this.EditData.id;
      this.EditData.id = null

      let putPath = ''
      if (this.title == 'Contrato')
        putPath = 'v1/accountdetails/' + id
      else
        putPath = 'v1/accountdetails/' + this.path.split('account_detail/')[1] + '/stores/' + id

      //console.log(JSON.stringify(this.EditData));
      this.dataService.update(this.EditData, putPath)
        .subscribe(val => {

          this.authService.reloadAccounts();//RELOAD NA LISTA DE CONTRATOS DO HEADER
          this.comumService.loading = false;
          this.comumService.modalReference.close();
        },
        Error => {
          this.comumService.errorModal('Ocorreu um Erro');
          console.log(Error);
        });
    }
  }

  // isImageFormatUrl(img_url){
  //   if(img_url.value.length > 0){

  //     let regex = /^http[^ \!@\$\^&\(\)\+\=]+(\.png|\.jpeg|\.jpg)$/;
  //     if(img_url.value !== this.comumService.noImgStoreAccount) {
  //        if(!img_url.value.includes('https:'))
  //           this.comumService.validField(0, "string", "Endereço da imagem nos formatos jpg, jpeg ou png");
  //           if((!img_url.value.includes('.jpeg?') && !img_url.value.includes('.jpg?') && !img_url.value.includes('.png?')))
  //             if(!regex.test(img_url.value))
  //               this.comumService.validField(0, "string", "Endereço da imagem nos formatos jpg, jpeg ou png");

  //         this.EditData.display_image = img_url.value
  //     }


  //     // let regex = /^http[^ \!@\$\^&\(\)\+\=]+(\.png|\.jpeg|\.jpg)$/;
  //     // if(img_url.value !== this.comumService.noImgStoreAccount){
  //     //   if((regex.test(img_url.value) || (img_url.value.includes('.jpeg?') || img_url.value.includes('.jpg?') || img_url.value.includes('.png?'))) && (img_url.value.includes('https:'))){
  //     //       this.EditData.display_image = img_url.value
  //     //   }else{
  //     //       this.comumService.validField(0, "string", "Endereço da imagem nos formatos jpg, jpeg ou png");
  //     //   }
  //     // }

  //    }
  // }

  validateFields() {
    let valid = [
      [this.EditData.unique_enterprise_number.replace(/[^0-9]/g, "").length < 11 ? '' : true, 'string', 'CPF corretamente!'],
      [this.EditData.unique_enterprise_number.replace(/[^0-9]/g, "").length < 14 && this.EditData.unique_enterprise_number.replace(/[^0-9]/g, "").length !== 11 ? '' : true, 'string', 'CNPJ corretamente!'],
      this.EditData.unique_enterprise_number.replace(/[^0-9]/g, "").length === 11 ? [this.EditData.company_name, 'string', 'Nome'] : '',
      this.hasCpf ? '' : [this.EditData.trade_name, 'string', 'Nome Fantasia'],
      [this.EditData.contact_detail.name, 'string', 'Nome do Contato'],
      [this.EditData.contact_detail.email, 'string', 'Email do Contato'],
      [this.EditData.contact_detail.phone_number, 'string', 'Telefone do Contato']
      //[this.EditData.display_image,'combo','Logo']
    ];
    if (this.title == 'Contrato') {
      valid.push([this.EditData.postal_code, 'string', 'CEP do Contato']);
      valid.push([this.EditData.address_1, 'string', 'Endereço do Contato']);
      valid.push([this.EditData.city.id, 'combo', 'Cidade do Contato']);
    }
    
    if (this.isNewContract) {
      //valid.push([this.billingData.value, 'string', 'Valor do Contrato']);//caso nao exista retorna vazio
      valid.push([this.billingData.contract_type, 'string', 'Tipo de Contrato']);
      valid.push([this.billingData.bank_detail.bank.id, 'combo', 'Banco']);
      valid.push([this.billingData.bank_detail.account_type, 'combo', 'Tipo de Conta']);
      valid.push([this.billingData.bank_detail.agency_number, 'string', 'Agência']);
      valid.push([this.billingData.bank_detail.account_number, 'string', 'Conta']);
      valid.push([this.dataPaymentMethodAndTax.length, "table", "Forma de Pagamento"]);
      //if(this.title == 'Contrato'){
      valid.push([this.billingData.billing_acquirer_agreement.payment_acquirer_id, 'combo', 'Adquirente']);
      valid.push([this.billingData.billing_acquirer_agreement.payment_acquirer_code, 'string', 'Código Adquirente']);
      //valid.push([this.billingData.billing_acquirer_agreement.value,'string','Valor Adquirente']);
      // }
    }

    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false
    }

    return true;
  }

  deleteData() {
    let title = ''
    let delPath = ''
    if (this.title == 'Contrato') {
      title = 'o contrato'
      delPath = 'v1/accountdetails/' + this.EditData.id;
    } else {
      title = 'a loja'
      delPath = 'v1/stores/' + this.EditData.id;
    }
    if (confirm('Você deseja mesmo excluir ' + title + ' ' + this.EditData.company_name)) {
      this.dataService.delete(delPath).subscribe(val => {
        this.authService.reloadAccounts();//RELOAD NA LISTA DE CONTRATOS DO HEADER
        this.comumService.modalReference.close();
      },
        Error => {
          this.comumService.errorModal('Ocorreu um Erro');
          //console.log(Error);
        });
    }
  }

  setBank(bank) {
    this.billingData.bank_detail.bank.id = bank;
  }

  setBankType(bankType) {
    this.billingData.bank_detail.account_type = bankType;
  }

  setAcquirer(acquirer) {
    this.billingData.billing_acquirer_agreement.payment_acquirer_id = acquirer;
  }

  newContract() {
    this.resetFieldsPayment();
    let isConfirm = true;
    if (this.billingData.id && !confirm('Deseja utilizar os dados do contrato ativo?')) {
      this.billingData = new BillingContract();
      this.resetPayments();

      isConfirm = false;
    }
    if (isConfirm && this.title != 'Contrato' && !this.billingData.id) {
      this.billingData = new BillingContract();
      this.dataPaymentFee = [];
      this.resetPayments();
    }
    this.isNewContract = !this.isNewContract;
  }

  OnBillingStore() {
    this.billingData.on_store_billing = !this.billingData.on_store_billing;
  }

  resetPayments() {
    
    let arr = [];
    this.paymentBrandsArray.forEach(b => {
      this.paymentMethodsArray.forEach(m => {  
        if (m.name.toLowerCase()[0]==b.type[0]||m.name.toLowerCase()[0]==b.type[1]) {
          if(m.name[0].toLowerCase()=='c'){
          let aFee=3.63;let aDay=30;let cFee=4;let cDay=32;
          }
          if(m.name[0].toLowerCase()=='d'){
            let aFee=2.63;let aDay=5;let cFee=3;let cDay=7;
            }
          arr.push({
            payment_method_id: m.id,
            pg: m.name,
            payment_brand_id: b.id,
            brandName: b.name,
            displayImage: '<img src="' + b.display_image + '" alt="store Image">',
            acquirer_fee: 2.63,
            acquirer_feeTemp: '2,63 - 30',
            acquirer_days: 30,
            payout_fee: 4,
            payout_feeTemp: '4,00 - 32',
            payout_days: 32,
            icon: this.comumService.iconRemove()
          });
        }
      });
    });
    this.dataPaymentMethodAndTax = arr;
    this.dataPaymentMethodAndTaxTemp = arr;
  }

}

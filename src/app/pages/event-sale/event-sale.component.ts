import { Component, OnInit, Renderer, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Http } from "@angular/http";

import { observable } from "rxjs/symbol/observable";
import { NgbModal, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage";
import {
  AngularFireDatabase,
  FirebaseListObservable
} from "angularfire2/database";
import { Select2OptionData } from "ng2-select2";

import { DataService } from "./../../services/data.service";
import { ComumService } from "../../services/comum.service";
import { Event } from "./../../models/event.model";

import * as moment from 'moment';

@Component({
  selector: 'app-event-sale',
  templateUrl: './event-sale.component.html',
  styleUrls: ['event-sale.component.scss'],
})
export class EventSaleComponent implements OnInit {

  displayMonths = 2;
  navigation = 'select';

  //region [Columns]
  public columnsDiscount: Array<any> = [
    {
      title: "Nome do Evento",
      name: "name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    { title: "Data Início", name: "start_date", sort: "desc" },
    { title: "Data Final", name: "end_date", sort: "desc" },
    { title: "Hora Iníco", name: "start_time", sort: "desc", className: ['hidden-xs'] },
    { title: "Hora Fim", name: "end_time", sort: "desc", className: ['hidden-xs'] }
  ];

  public columnsCategoryProduct: Array<any> = [
    {
      title: "Produto",
      name: "name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    { title: "Categoria", name: "categoryName", sort: false },
    { title: "Desconto", name: "discount" },
    { title: "Ação", name: "icon", sort: false }
  ];
  //endregion

  //region [propriedades]
  private ModelstartDate: NgbDateStruct;
  private ModelendDate: NgbDateStruct;
  private modalReference:any;
  private visibleDiscountIconPercent: boolean = false;
  private iconPercent: string = '%';
  private visibleDiscountIconMoeda: boolean = false;
  private iconMoeda: string = '$';
  private selectDiscountType: Array<Select2OptionData>;
  private dataDiscount: Array<any> = [];
  private selectEvent: Array<Select2OptionData>;
  private dataProduct: Array<any> = [];
  private selectProduct: Array<any> = [];
  private dataCategory: Array<any> = [];
  private selectCategory: Array<any> = [];
  private dataCategoryProduct: Array<any> = [];
  private tempDataCategoryProduct: Array<any> = [];
  private path: any;
  private EditData: Event = new Event();
  //endregion

  constructor(
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private router: ActivatedRoute,
    private renderer: Renderer,
    private DataService: DataService
  ) { }

  ngOnInit() {
    this.EditData["categoryIDSel"] = "0";

    this.comumService.storeid.subscribe(val => {
      this.loadDataEvent(val);
    });

    this.loadDataEvent(this.localStorage.get("storeid"));
    this.getDiscountType();
  };

  carregaDados(event: any){
    this.comumService.formatDateSemBarra(event.start);
    this.comumService.formatDateSemBarra(event.end);
    alert('Dados Carregados')
  }

  setFocus() {
    let inputDiscount = this.renderer.selectRootElement(
      "#discount-numberDiscount"
    );
    this.renderer.invokeElementMethod(inputDiscount, 'focus');
  }

  getDiscountType() {
    this.selectDiscountType = [];
  //   this.DataService.getList("v1/valuetypes").subscribe(val => {
  //      //fazendo combo de DiscountType
  //      this.selectDiscountType = this.comumService.setSelect2(
  //       val.result,
  //       "id",
  //       "name",
  //       "Selecione"
  //     );
  //   },
  //   // onError
  //   e => {this.comumService.alertError('Ocorreu um error: ' + e.status); this.comumService.loading = false; console.log("onError: %s", e);}
  // );
  };

  loadDataEvent(storeid) {
    this.path = this.localStorage.get("path");
    this.loadData(this.path, storeid);

    this.db.list(this.path + "/event/").subscribe(a => {
      this.dataDiscount = [];

      // Populando grid Eventos
      a.forEach(t => {
        let dataTempEvent = "";

        if (typeof t.start_date === "number"){
          t.start_date = moment.unix(t.start_date).format('DD/MM/YYYY');
        }
        if (typeof t.end_date === "number"){
          t.end_date = moment.unix(t.end_date).format('DD/MM/YYYY');
        }else if(typeof t["end_date"] === 'undefined'){
          t.end_date = '';
        }else{
          t.end_date = t.end_date;
        }

        dataTempEvent = t;
        this.dataDiscount.push(dataTempEvent);
      });

      // Populando combo de Eventos
      this.selectEvent = this.comumService.setSelect2(
        a,
        "id",
        "name",
        "Selecione"
      );

    },
      // Error
      e => {this.comumService.alertError('Ocorreu um error: ' + e.status); this.comumService.loading = false; console.log("onError: %s", e);},
      // Completed
      () => {}
    );
  }

  loadData(path, storeid) {

    this.db
      .list(path + "/store/" + storeid + "/product_category")
      .subscribe(a => {
        //console.log(a);
        this.dataCategory = a;
        this.selectCategory = [];
        this.selectProduct = [];
        this.selectProduct.push({ id: 0, text: "Selecione" });
        this.dataProduct = [];
        this.selectCategory.push({ id: 0, text: "Todos" });
        a.forEach(val => {
          let vl = val;
          this.selectCategory.push({ id: val.id, text: val.name });
          if (val.product_inventory) {
            Object.keys(val.product_inventory).map((objectKey, index) => {
              let prod = val.product_inventory[objectKey].product;
              prod["categoryID"] = val.id;
              prod["categoryName"] = val.name;
              this.dataProduct.push(prod); //fazendo grid de produtos
              this.selectProduct.push({
                id: prod.id,
                text: prod.name,
                category: val.id,
                categoryName: val.name
              });
            });
          }
        });
      });
  }

  setEventType(eventIDSel) {
    this.EditData["eventIDSel"] = eventIDSel;
  }

  setDiscountType(discountIDSel) {
    this.EditData["discountIDSel"] = discountIDSel;

    switch (discountIDSel) {
      case "":
        this.visibleDiscountIconPercent = false;
        this.visibleDiscountIconMoeda = false;
        this.EditData["discountValue"] = '';
        break;
      case "d341ad97-3aa5-e711-8f02-00155d003a02":
        this.visibleDiscountIconPercent = true;
        this.visibleDiscountIconMoeda = false;
        this.EditData["discountValue"] = this.comumService.fMoeda(
          this.EditData["discountValue"]
        );
        this.setFocus();
        break;
      case "d241ad97-3aa5-e711-8f02-00155d003a02":
        this.visibleDiscountIconMoeda = true;
        this.visibleDiscountIconPercent = false;
        this.EditData["discountValue"] = this.comumService.fMoeda(
          this.EditData["discountValue"]
        );
        this.setFocus();
        break;
    }
  }

  operatorDiscountType(obj) {
    let keySelect = this.EditData["discountIDSel"];
    switch (keySelect) {
      case "0":
        return null;
      case "d241ad97-3aa5-e711-8f02-00155d003a02":
        this.EditData["discountValue"] =  this.comumService.fMoeda(this.EditData["discountValue"]);
      case "d341ad97-3aa5-e711-8f02-00155d003a02":
        this.EditData["discountValue"] =  this.comumService.fMoeda(this.EditData["discountValue"]);
    }
  }

  //region [ Categoria ]
  setCategoryType(categoryId) {
    this.EditData["categoryIDSel"] = categoryId;
    this.selectProduct = [];
    this.selectProduct.push({ id: 0, text: "Selecione" });
    this.dataProduct.forEach(prod => {
      if (prod.categoryID == categoryId || categoryId == 0) {
        this.selectProduct.push({
          id: prod.id,
          text: prod.name,
          category: this.EditData["categoryIDSel"],
          categoryName: prod.categoryName
        });
      }
    });
  }

  addCategory(e) {
    if (this.EditData["discountIDSel"] == "" ||  !this.EditData["discountValue"]) {
      this.comumService.alertError("Selecione o tipo de desconto e Digite o desconto!","Oops!");
    } else {
      let exist = false;
      let allExist = true;
      this.selectProduct.forEach(prod => {
        exist = false;
        //console.log(this.EditData["categoryIDSel"]);
        if (prod.category == this.EditData["categoryIDSel"] || this.EditData["categoryIDSel"] == 0 || typeof this.EditData["categoryIDSel"] == "undefined") {
          this.dataCategoryProduct.forEach(catprod => {
            if (catprod.id == prod.id) {
              exist = true;
            }
          });
          if (!exist) {
            if (prod.id !== 0) {
              allExist = false;
              this.tempDataCategoryProduct.push(this.tempProduct(prod));
              this.dataCategoryProduct = [];
              this.tempDataCategoryProduct.forEach(prod => this.dataCategoryProduct.push(prod));
            }
          }
        }
      });
      if (!exist && (this.EditData["categoryIDSel"] == 0 || typeof this.EditData["categoryIDSel"] == "undefined")){
        this.comumService.alertWarning(
          `Você está incluido todos os produtos da categoria selecionada. Os itens que já foram adicionados serão ignorados`,
          "Atenção!", 5500
        );
      }else if (allExist) {
        this.EditData["categoryIDSel"] = 0;
        this.EditData["productIDSel"] = 0;
        this.comumService.alertError(
          "Todos os produtos nas categorias já foram adicionados",
          "Atenção!"
        );
      }
    }
  }
  //endregion

  //region [ Produtos ]
  setProductType(prodructId) {
    this.EditData["productIDSel"] = prodructId;
  }

  addProduct(e) {
    if (
      this.EditData["discountIDSel"] == "" ||
      !this.EditData["discountValue"]
    ) {
      this.comumService.alertError(
        "Selecione o tipo de desconto e Digite o desconto!",
        "Oops!"
      );
    } else {
      if (this.EditData["productIDSel"] == 0) {
        this.comumService.alertError("Selecione um produto!", "Oops!");
      } else {
        let exist = false;
        this.tempDataCategoryProduct.forEach(catprod => {
          if (catprod.id == this.EditData["productIDSel"]) {
            exist = true;
          }
        });

        if (!exist) {
          this.selectProduct.forEach(prod => {
            if (prod.id == this.EditData["productIDSel"]) {
              this.tempDataCategoryProduct.push(this.tempProduct(prod));
            }
          });
          this.dataCategoryProduct = [];
          this.tempDataCategoryProduct.forEach(prod =>
            this.dataCategoryProduct.push(prod)
          );
        } else {
          this.comumService.alertError("Este item já foi adicionado", "Opps!");
          this.EditData["productIDSel"] = 0;
        }
      }
    }
  }
  //endregion

  //region [ Open Modal ]
  openModal(content, data, i) {
    this.resetFields();

    if (data) {
      this.EditData["id"] = data.row.id;
      if(!!this.selectEvent)
      this.EditData["eventIDSel"] = this.selectEvent.find(
        ev => ev.id == data.row.id
      ).id;

      this.ModelstartDate = this.comumService.formDateView(data.row.start_date);
      if(data.row.end_date !== '')
        this.ModelendDate = this.comumService.formDateView(data.row.end_date);

      this.EditData["start_time"] = data.row.start_time;
      this.EditData["end_time"] = data.row.end_time;

      // Monta Grid de Produtos
      if(data.row.products)
      data.row.products.forEach(prod => {
        let tempProd = prod;
        let iconDiscount = tempProd["valueTypeID"] === "d341ad97-3aa5-e711-8f02-00155d003a02" ? this.iconPercent : this.iconMoeda;
        tempProd["categoryName"] = "";
        tempProd["categoryID"] = "";
        this.dataProduct.forEach(val => {
          if (val.id == prod.id) {
            tempProd["categoryName"] = val.categoryName;
            tempProd["categoryID"] = val.categoryID;
          }
        });
        tempProd["discount"] = iconDiscount + "  " + tempProd["value"];
        this.dataCategoryProduct.push(tempProd);
        this.tempDataCategoryProduct.push(tempProd);
      });

    }else{
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
    }
    this.modalReference = this.modalService.open(content, { backdrop: "static" });
    this.comumService.focusFirst();
  }
  //endregion

  //region [Salvar e Editar]
  saveData() {

    this.EditData.start_date = this.comumService.formDateApi(this.ModelstartDate);
    this.EditData.end_date = this.comumService.formDateApi(this.ModelendDate);

    if (this.validateFields()) {

      // EDITAR
      if (this.EditData["id"]){

        // if(this.EditData.end_date === "NaN-NaN-NaN")
        // this.EditData.end_date = null;

        this.dataDiscount.forEach(d => {
          if (d.id == this.EditData["id"]) {
            d.name = this.selectEvent.find(ev => ev.id == this.EditData["eventIDSel"]).text;
            d.startDateValue = this.EditData["start_date"];
            d.endDateValue = this.EditData["end_date"];
            d.startTimeValue = this.EditData["start_time"];
            d.endTimeValue = this.EditData["end_time"];
            d.products = this.dataCategoryProduct;
          }
        });

      // SALVAR
      }else {

      this.dataDiscount.forEach(d => {
        if (d.id == this.EditData["eventIDSel"]) {
          d.name = this.selectEvent.find(ev => ev.id == this.EditData["eventIDSel"]).text;
          d.startDateValue = this.EditData["start_date"];
          d.endDateValue = this.EditData["end_date"];
          d.startTimeValue = this.EditData["start_time"];
          d.endTimeValue = this.EditData["end_time"];
          d.products = this.dataCategoryProduct;
        }
      });

      }

      alert("Salvo com sucesso!");
      this.modalReference.close();
    }
  }
  //endregion

  //region [Resetar  Campos]
  private resetFields() {
    this.visibleDiscountIconPercent = false;
    this.visibleDiscountIconMoeda = false;
    this.tempDataCategoryProduct = [];
    this.dataCategoryProduct = [];
    this.EditData = new Event();
  }
  //endregion

  //region [ Validação ]
  private validateFields() {
    let valid = [
      [this.EditData['eventIDSel'] || 0, "combo", "Evento"],
      [this.validateStartDate(), "string", "Data Inicial"],
      [this.validateEndDate(), "string", "Data Final"],
      [this.validateStarTime(), "string", "Hora Início"],
      [this.validateEndTime(), "string", "Hora Fim"],

      [this.EditData["discountIDSel"] || 0, "combo", "Tipo de Desconto"],
      [this.EditData["discountValue"]==='0,00' ? 0 : this.EditData["discountValue"], "string", "Desconto"],
      [this.dataCategoryProduct.length, "combo", "Produto"]
    ];

    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false;
    }

    return true;
  }

  validateStartDate() {
    let inputStartDate = this.renderer.selectRootElement("#startDate");
    if(inputStartDate.value === '')
      return "";
    else return inputStartDate.value
  }

  validateEndDate() {
    let inputEndDate = this.renderer.selectRootElement("#endDate");
    if(inputEndDate.value === '')
      return "";
    else return inputEndDate.value
  }

  validateStarTime() {
    if (!this.EditData.start_time || this.EditData.start_time.replace(/[_,:]/g, "").length < 4)
      return "";
    else return this.EditData.start_time;
  }

  validateEndTime() {
    if (!this.EditData.end_time || this.EditData.end_time.replace(/[_,:]/g, "").length < 4)
      return "";
    else return this.EditData.end_time;
  }
  //endregion

  private tempProduct(objProduct: any) {
    //console.log(this.EditData["discountValue"]);
    let inputDiscountValue= this.renderer.selectRootElement("#discount-numberDiscount");
    this.EditData["discountValue"] = inputDiscountValue.value;
    let tempProd = objProduct;
    let iconDiscount = this.EditData["discountIDSel"] === "d341ad97-3aa5-e711-8f02-00155d003a02" ? this.iconPercent : this.iconMoeda;
    tempProd["value"] = this.EditData["discountValue"];
    tempProd["name"] = tempProd["text"];
    tempProd["valueTypeID"] = this.EditData["discountIDSel"];
    tempProd["discount"] = iconDiscount + "  " + this.EditData["discountValue"];
    tempProd["icon"] = this.comumService.iconRemove();

    return tempProd;
  }

  removeRowProduct(e) {
      if(e.column === 'icon') {
      let tempCategoryProduct = [];
      tempCategoryProduct = this.dataCategoryProduct;
      this.dataCategoryProduct = [];
      tempCategoryProduct.forEach((el, i, a) => {
        if (el.id == e.row.id) a.splice(i, 1);
      });
      tempCategoryProduct.forEach(dp => this.dataCategoryProduct.push(dp));
      this.tempDataCategoryProduct = this.dataCategoryProduct;

      //console.log("Item removido com sucesso!");
    }
  }

  deleteData() {
    if(confirm('Você deseja mesmo excluir o Evento '+this.EditData.name)){
  //   this.dataService.delete("v1/events/" + this.EditData.id).subscribe(val => {
  //     console.log(val);
       this.modalReference.close();
  //   },
  //   // Error
  //   e => {this.comumService.alertError('Ocorreu um error: ' + e.status); this.comumService.loading = false; console.log("onError: %s", e);},
  //   // Done
  //   () => this.comumService.loading = false
  // );
  }
}

}

import { ValueType } from './../../models/value-type.model';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Http, Response } from '@angular/http';


import { NgbModal, ModalDismissReasons, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage";
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { Select2OptionData } from "ng2-select2";
import { ActivatedRoute, Router } from "@angular/router";

import { ComumService } from "../../services/comum.service";
import { DataService } from "./../../services/data.service";
import { ProductCategory } from "./../../models/product-category.model";
import { Product } from "./../../models/product.model";

import { FileUpload } from '../../models/fileupload';

import * as firebase from 'firebase';

import * as  XLSX from 'ts-xlsx';
import { error } from "util";
import { TemplateRef } from '@angular/core/src/linker/template_ref';
import { ElementRef } from '@angular/core/src/linker/element_ref';
import { AfterViewChecked } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html"
})
export class ProductComponent implements OnInit, AfterViewChecked {
  @ViewChild('file')
  myInputVariable: any;

  @ViewChild('img')
  imgInput: any;

  @ViewChild('modalImg')
  modalImg: any;

  @ViewChild('fileInput')
  fileInput: any;

  @ViewChild('posCargaProdutos')
  modalAfterRef: any;

  public columnsProd: Array<any> = [
    {
      title: "Name",
      name: "name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    {
      title: "Categoria",
      name: "category_name",
      filtering: { filterString: "", placeholder: "Filtrar por categoria" }
    },
    { title: "Preço", name: "table_value", className: ['hidden-xs'] },
    { title: "Qtd", name: "current_amount", className: ['hidden-xs'] }
  ];

  public columnsCat: Array<any> = [
    {
      title: "Name",
      name: "name",
      sort: 'asc',
      filtering: { filterString: "", placeholder: "Filtrar por nome" }
    },
    { title: "Descrição", name: "description", className: ['hidden-xs'] }
  ];

  private path: any;
  private currentIdCategory: string; // Id usado para montar a url de adicionar e alterar API de producto.
  private storeid: string;
  private dataProd: Array<any> = [];
  private sendProd: Array<any> = [];
  private dataCat: Array<any> = [];
  private catList: Array<any> = [];
  private EditData: Product = new Product();
  private sendData: Product = new Product();
  private EditDataCategory: ProductCategory = new ProductCategory();
  private currentImg: any;
  private uploadTask: firebase.storage.UploadTask;
  private isKeepPaging: boolean;
  private modalProducts: any = [];
  private testImg;
  private errorInfo: any = [];

  private countError: number = 0;
  private bulkCount: number = 0;
  private bulkList: any = [];


  updateLines: any = [];
  createLines: any = [];

  //private tempImage:any;

  public categoryList: Array<Select2OptionData>;

  // public rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

  constructor(
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private localStorage: LocalStorageService,
    private comumService: ComumService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private http: Http,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {

    this.comumService.storeid.subscribe(val => {
      if (val != this.storeid)
        this.loadData();
    });

    this.comumService.path.subscribe(val => {
      this.comumService.getAccountType(val);
    });
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
  }

  loadProductsList(val) {
    this.dataCat.push(val); //fazendo grid de categorias
    this.catList.push({ id: val.id, text: val.name }); //fazendo combo de categorias para cadastro de produtos

    if (val.product) {
      Object.keys(val.product).map((objectKey, index) => {
        let prod;
        prod = val.product[objectKey]; //fazendo grid de produtos
        if (prod.display_image)
          prod['img'] = '<img (click)="img.click()" src="' + prod.display_image + '" alt="store Image">';
        else
          prod['img'] = '<img (click)="img.click()" src="' + this.comumService.noImg + '" alt="store Image">';
        prod["name"] = prod.name;
        prod["category_name"] = val.name;
        prod["category_id"] = val.id;
        prod["border"] = '<div title="' + this.isActiveTitle(prod.active) + '" class=table-' + prod.active + '></div>';
        prod["table_value"] = this.comumService.fMoeda(
          prod["value"].toFixed(2)
        );
        this.dataProd.push(prod);
      });
    }
  }

  loadData() {
    this.storeid = this.localStorage.get("storeid");
    // if(!this.storeid)
    //   this.router.navigate([ '/store' ]);
    this.path = this.localStorage.get("path");

    if (this.storeid == '0') { // listar os produtos de todas as lojas
      this.db
        .list(this.path + "/store/")
        .subscribe(t => {
          this.catList = [];
          this.dataProd = [];
          this.dataCat = [];
          t.forEach(all => {
            if (all.product_category) {
              Object.keys(all.product_category).map((key, index) => {
                this.loadProductsList(all.product_category[key]); //comentadas no deployyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
              });
            }
          });
        });
      this.categoryList = this.comumService.setSelect2(
        this.catList,
        "id",
        "text",
        "Selecione"
      );
    }
    else { // listar produtos da loja marcada
      this.db
        .list(this.path + "/store/" + this.storeid + "/product_category")
        .subscribe(a => {
          this.dataProd = [];
          this.dataCat = [];
          this.catList = [];
          a.forEach(val => {
            this.loadProductsList(val);//comentadas no deployyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
          });
        });
      this.categoryList = this.comumService.setSelect2(
        this.catList,
        "id",
        "text",
        "Selecione"
      );
    }
  }

  openModal(content, data, isProduct) {
    this.resetFieldsProduct();
    this.resetFieldsCategory();
    if (data) {
      if (isProduct) {

        //this.EditData['imgUrl'] =  data.row.display_image === this.comumService.noImg  ? '' : data.row.display_image;
        //data.row.display_image  = data.row.display_image === '' ? this.comumService.noImg : data.row.display_image;

        // if(typeof data.row.display_image === "undefined"){
        //   this.EditData['imgUrl'] = '';
        //   data.row.display_image  = this.comumService.noImg;
        //   }


        //this.tempImage =data.row.display_image;

        this.dataService.jsonToModel(data.row, new Product(), this.EditData);
        this.EditData.value = this.comumService.fMoeda(this.EditData.value.toFixed(2));
        if (this.EditData.cost_value)
          this.EditData.cost_value = this.comumService.fMoeda(this.EditData.cost_value.toFixed(2));
        this.currentIdCategory = data.row.category_id;
      } else {
        this.dataService.jsonToModel(
          data.row,
          new ProductCategory(),
          this.EditDataCategory
        );
      }
    } else {
      if (isProduct)
        this.EditData.display_image = this.comumService.noImg;

    }
    if (isProduct)
      this.comumService.modalReference = this.modalService.open(content, { backdrop: "static", size: "lg" });
    else
      this.comumService.modalReference = this.modalService.open(content, { backdrop: "static" });

    this.comumService.focusFirst();
  }

  uploadProductOrCategoryImage(evt) {
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
    if (this.currentImg) {

      this.dataService.jsonToModel(this.currentImg, new Product(), this.EditData);
      this.currentIdCategory = this.currentImg.category_id;
      //para passar o numero com duas casa decimais, ja que o mesmo é tratado no save com função fMoeda
      this.EditData.value = parseFloat(this.EditData.value.toFixed(2).toString().replace('.', ''));
      this.EditData.display_image =
        "data:image/jpg;base64," + btoa(binaryString);
      this.saveData(true);
      this.currentImg = undefined;
      this.imgInput.nativeElement.value = "";
    } else {
      this.EditData.display_image =
        "data:image/jpg;base64," + btoa(binaryString);
    }
  }

  isImg(produto, e, img) {
    if (e.column === 'img') {
      this.currentImg = e.row;
      img.click();
    } else {
      this.openModal(produto, e, true);
    }
  }


  setCategory(categoryId) {
    this.currentIdCategory = categoryId.value || null;
  }

  private resetFieldsProduct() {
    this.EditData = new Product();
  }

  private resetFieldsCategory() {
    this.currentIdCategory = "";
    this.EditDataCategory = new ProductCategory();
  }



  saveData(isProduct: Boolean) {

    if (isProduct) {
      //this.EditData.display_image = this.EditData['imgUrl'];
      if (!this.currentImg && !this.validateFields(isProduct)) {
        return false;
      }

      //remove espaços antes e depois
      this.EditData.name = this.EditData.name.replace(/^\s+|\s+$/g, '');
      this.dataService.jsonToModel(this.EditData, new Product(), this.sendData);
      this.comumService.loading = true;

      if (this.sendData.cost_value) {
        this.sendData.cost_value = parseFloat(
          this.comumService.fMoeda(this.sendData.cost_value).toString().replace(",", ".")
        );
      }
      this.sendData.value = parseFloat(
        this.comumService.fMoeda(this.sendData.value).toString().replace(",", ".")
      );
      this.sendData.product_category_id = this.currentIdCategory;
      if (this.sendData["id"]) { // Editar Produtos
        //this.saveImage(this.sendData["id"]);

        this.dataService.update(this.sendData, "v1/products/" + this.sendData["id"]).subscribe(val => {
          if (this.comumService.modalReference)
            this.comumService.modalReference.close();
          this.comumService.loading = false;
          this.isKeepPaging = true;
        },
          Error => {
            this.comumService.errorModal('Ocorreu um Erro');
            //console.log(Error);
          });
      } else { // adicionar produto

        if (this.validadeNameRepeat(isProduct))
          this.dataService.addEntity(this.sendData, "v1/products").subscribe(val => {
            //this.saveImage(val.result);

            this.comumService.loading = false;
            this.isKeepPaging = true;
            this.comumService.modalReference.close();
          },
            Error => {
              this.comumService.errorModal('Ocorreu um Erro');
              //console.log(Error);
            });

      }
    } else {
      if (!this.validateFields(isProduct))
        return false;

      //remove espaços antes e depois
      this.EditDataCategory.name = this.EditDataCategory.name.replace(/^\s+|\s+$/g, '');

      this.comumService.loading = true;
      if (!!this.EditDataCategory["id"]) { // Editar Categoria
        this.dataService
          .update(
          this.EditDataCategory,
          "v1/stores/" +
          this.storeid +
          "/productcategories/" +
          this.EditDataCategory["id"]
          )
          .subscribe(val => {
            this.comumService.loading = false;
            this.isKeepPaging = true;
            this.comumService.modalReference.close();
          },
          Error => {
            this.comumService.errorModal('Ocorreu um Erro');
            //console.log(Error);
          });
      } else { // Adicionar Categoria

        if (this.validadeNameRepeat())
          this.dataService
            .addEntity(
            this.EditDataCategory,
            "v1/stores/" + this.storeid + "/productcategories"
            )
            .subscribe(val => {
              this.comumService.loading = false;
              this.isKeepPaging = true;
              this.comumService.modalReference.close();
            },
            Error => {
              this.comumService.errorModal('Ocorreu um Erro');
              //console.log(Error);
            });
      }
    }

  }

  validadeNameRepeat(isprod: Boolean = false) {
    // valida se o nome já existe
    if (isprod) {
      if (this.dataProd.filter(x => { return x.name === this.EditData.name }).length > 0) {
        this.comumService.alertError(`O nome do produto já existe!`);
        this.comumService.loading = false;
        return this.comumService.shakeModal();
      }

    } else {
      if (this.dataCat.filter(x => { return x.name === this.EditDataCategory.name }).length > 0) {
        this.comumService.alertError(`O nome da categoria já existe!`);
        this.comumService.loading = false;
        return this.comumService.shakeModal();
      }

    }
    return true;
  }

  validateFields(isProduct: Boolean) {
    let valid = []
    if (isProduct) {
      valid = [
        [this.EditData.name, 'string', 'Nome'],
        [this.currentIdCategory, 'string', 'Categoria'],
        [this.EditData.value, 'string', 'Preço'],
        [this.EditData.description, 'string', 'Descrição']
      ];

    } else {
      valid = [
        [this.EditDataCategory.name, 'string', 'Nome']
      ];
    }

    for (var i in valid) {
      if (!this.comumService.validField(valid[i][0], valid[i][1], valid[i][2]))
        return false
    }
    return true;
  }

  deleteData(isProduct: Boolean) {
    this.comumService.loading = true;
    if (isProduct) {
      if (confirm('Você deseja mesmo excluir o produto ' + this.EditData.name)) {
        this.dataService.delete('v1/products/' + this.EditData.id).subscribe(val => {
          this.comumService.loading = false;
          this.isKeepPaging = true;
          this.comumService.modalReference.close();
        },
          Error => {
            this.comumService.errorModal('Ocorreu um Erro');
            //console.log(Error);
          });
      }
    } else {
      if (confirm('Você deseja mesmo excluir a categoria ' + this.EditDataCategory.name)) {
        this.dataService.delete('v1/productcategories/' + this.EditDataCategory.id).subscribe(val => {
          this.comumService.loading = false;
          this.isKeepPaging = true;
          this.comumService.modalReference.close();
        },
          Error => {
            this.comumService.errorModal('Ocorreu um Erro');
            //console.log(Error);
          });
      }
    }
  }
  uploadImg(e, event) {
    this.uploadProductOrCategoryImage(e);
  }



  importXlsx(event, content) {
    // this.dataService.getList("v1/products/").subscribe(val => {
    // },
    //   Error => {
    //   });
    this.errorInfo = []
    this.countError = 0;
    var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer 
    if (event.target.files && event.target.files[0]) {
      this.openModalBeforeProductLoading(content);
      var reader = new FileReader();
      reader.onload = (event) => {
        var data = event.target['result'];
        if (!rABS) data = new Uint8Array(data);
        const workbook: XLSX.IWorkBook = XLSX.read(data, { type: 'binary' });
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        let arr = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let ar = [];
        arr.forEach(row => {
          if (row[0] && row[1] && row[2])
            ar.push(row);
        });
        this.modalProducts = []; // zerando array que mostra produtos na tela para nova insercao de produtos
        this.setFieldsModal(ar);
        this.bulkList = ar; // array antigo de prods
        //this.onLoadProducts(ar, 0); vai ser chamado pelo setFieldsModal
      }
      reader.readAsBinaryString(event.target.files[0]);
    }
    this.fileInput.nativeElement.value = "";
  }

  openModalOnProductLoading(content) {
    this.comumService.modalReference = this.modalService.open(content, { backdrop: "static" });
    this.comumService.focusFirst();
  }
  openModalBeforeProductLoading(content) {
    this.comumService.modalReference = this.modalService.open(content, { size: 'lg', backdrop: "static", windowClass: "scrollable" });
    this.comumService.focusFirst();
  }
  openModalAfterProductLoading() {
    this.comumService.modalReference = this.modalService.open(this.modalAfterRef, { backdrop: "static", windowClass: "scrollable" });
    this.comumService.focusFirst();
  }

  setFieldsModal(arr) {
    let cont = 0;
    arr.forEach(row => {

      let modalProductsTemp = {
        active: true,
        name: row[0] ? row[0].replace(/"/g, '') : null,
        category_name: row[1] ? row[1].replace(/"/g, '') : null,
        value: row[2] ? parseFloat(row[2].replace(/"/g, '')) : null,
        cost_value: row[3] ? parseFloat(row[3].replace(/"/g, '')) : null,
        description: row[4] ? row[4].replace(/"/g, '') : null,
        current_amount: row[5] ? parseFloat(row[5].replace(/"/g, '')) : null,
        minimum_amount: row[6] ? parseFloat(row[6].replace(/"/g, '')) : null,
        product_category_id: '',
        hasImg: false,
        id: '',
        display_image: this.comumService.noImg
      };


      this.modalProducts.push(modalProductsTemp);

      cont++;
    });
  }

  uploadSingleImg(p, file) {
    this.EditData = p;
    file.click();
  }
  uploadDisplayImage(evt) {

    this.comumService.loading = true;
    var files = evt.target.files;
    var file = files[0];
    if (files && file) {
      var reader = new FileReader();
      reader.onload = this._handleReaderLoadedModal.bind(this);
      reader.readAsBinaryString(file);
    }
  }
  _handleReaderLoadedModal(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.testImg = "data:image/jpg;base64," + btoa(binaryString);
    this.EditData.display_image = "data:image/jpg;base64," + btoa(binaryString);
    this.EditData['hasImg'] = true;
    this.modalImg.nativeElement.value = "";
    this.comumService.loading = false;
  }

  doBulkLoad(modal) {
    if (this.storeid != '0') { // caso tenha alguma loja marcada no select de lojas;
      this.onLoadProducts(0);
      this.comumService.modalReference.close();
      this.openModalOnProductLoading(modal);
    }
    else { // caso a opção todas as lojas esteja marcada
      this.comumService.alertError('É necessário selecionar uma loja para adicionar os produtos.');
      this.comumService.modalReference.close();
    }
  }

  onLoadProducts(pos) {
    this.bulkCount = pos;
    if (this.modalProducts[pos]) {
      let hasCat = false;
      this.dataCat.forEach(cat => {
        //compara nome da categoria do retorno com nome da categoria do objeto de categoria
        if ((this.modalProducts[pos].category_name.replace(/"/g, '').toLowerCase() == cat.name.toLowerCase()) && (cat.store_id == this.storeid)) {
          hasCat = true;
          this.modalProducts[pos].product_category_id = cat.id;
          this.doImport(this.modalProducts[pos], this.modalProducts, pos);
        }
      });

      if (!hasCat) {
        this.EditDataCategory.name = this.modalProducts[pos].category_name;
        this.dataService
          .addEntity(
          this.EditDataCategory,
          "v1/stores/" + this.storeid + "/productcategories"
          )
          .subscribe(val => {
            this.modalProducts[pos].product_category_id = val.result;
            this.doImport(this.modalProducts[pos], this.modalProducts, pos);
          },
          Error => {
            console.log(Error);
          });
      }
    }
  }


  doImport(item, ar, pos) {
    if (item.product_category_id != '') {
      let hasProd = false;
      this.dataProd.forEach(prod => {
        if (prod.name == item.name) {
          hasProd = true;
          item.id = prod.id;
          if (!item['hasImg'])
            item.display_image = prod.display_image;
          this.doUpdate(item, ar, pos);
        }
      });
      if (!hasProd)
        this.doCreate(item, ar, pos);
    }
  }


  doCreate(item, ar, pos) {
    this.dataService.addEntity(item, "v1/products").subscribe(val => {
      this.bulkResponse(ar, pos);
    },
      Error => {
        console.log(Error);
        this.countError += 1;
        this.errorInfo.push({ name: item.name, category_name: item.category_name, error: Error, position: pos + 1 });
        this.bulkResponse(ar, pos);
      });
  }

  doUpdate(item, ar, pos) {
    if (item.product_category_id != '') {
      this.dataService.update(item, "v1/products/" + item["id"]).subscribe(val => {
        this.bulkResponse(ar, pos);
      },
        Error => {
          console.log(Error);
          this.countError += 1;
          this.errorInfo.push({ name: item.name, category_name: item.category_name, error: Error, position: pos + 1 });
          this.bulkResponse(ar, pos);
        });
    }
  }

  bulkResponse(ar, pos) {
    let nextpos = parseFloat(pos) + 1;
    if (ar[nextpos])
      this.onLoadProducts(nextpos);
    else {
      this.comumService.modalReference.close();
      if (this.countError == 0)
        this.comumService.alertOk('Carga realizada com sucesso!');
      else if (this.countError == ar.length) {
        this.comumService.alertError('Não foi possível realizar o cadastro de nenhum dos itens.');
        this.openModalAfterProductLoading();
      }
      else {
        this.comumService.alertWarning('Carga realizada com sucesso, porém ' + this.countError + ' registros não foram inseridos.');
        this.openModalAfterProductLoading();
      }
    }
  }

  isActiveTitle(active) {
    if (active)
      return 'Produto Ativo'
    else
      return 'Produto Inativo'
  }

}
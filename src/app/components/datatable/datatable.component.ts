import { Component, OnInit, Input, Output, EventEmitter,ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Rx';

import { ComumService } from '../../services/comum.service';
import { LocalStorageService } from 'angular-2-local-storage';

import { AfterViewChecked } from "@angular/core/src/metadata/lifecycle_hooks";

@Component({
  selector: 'app-datatable',
  template: `
   <div class="dataTables_wrapper dataTables_wrapper form-inline dt-bootstrap no-footer">
        <div class="row" *ngIf="filter">
            <div class="col-sm-4 col-xs-12">
                <div class="dataTables_length pull-left" id="demo-dt-basic_length">
              <!--
                <label><span class="hidden-xs">mostrar</span>
                  <select name="number_length" [(ngModel)]="itemsPerPage" (ngModelChange)="OnChangeItemsPerPage()" class="form-control input-sm rounded-input">
                      <option *ngFor="let level of levels" [ngValue]="level.num">{{level.name}}</option>
                  </select>
                </label>
                -->
                </div>
                <div class="searchbox">
                    <div class="input-group custom-search-form">
                        <input type="text" *ngIf="config.filtering" placeholder="Pesquisar" class="form-control datatableFilter" [ngTableFiltering]="config.filtering" (tableChanged)="onChangeTable(config)" placeholder="Pesquisar..">
                        <span class="input-group-btn">
                            <button class="text-muted" type="button"><i class="demo-pli-magnifi-glass"></i></button>
                        </span>
                    </div>
                </div>

                 <div style="display:table-cell;" *ngIf="isViewLineHeader">
                    <!-- <h4>{{textHeader}}</h4> -->

                    <select name="number_length" [(ngModel)]="itemTextHeader" (ngModelChange)="OnChangeTextHeader()" class="form-control input-sm selectEventTextHeader" disabled>
                      <option *ngFor="let textHeader of textHeaderList" [ngValue]="textHeader.id">{{textHeader.name}}</option>
                    </select>

                 </div>


            </div>
        </div>

        <!--FUNCIONAMENTO ANTIGO BUG NO iOS
          <ng-table [config]="config" [rows]="rows" [columns]="columns" (cellClicked)="clickEmmiter($event)" (tableChanged)="onChangeTable(config)">
          </ng-table>
        NÃO REATIVAR-->

        <div class="table-responsive w-100">
          <table class='table table-striped margin-top-20' (cellClicked)="clickEmmiter($event)"> <!-- BUG iOS(tableChanged)="onChangeTable(config)" BUG iOS-->
            <tr>
              <th *ngFor='let c of columns'>
                {{c.title}}
              </th>
            </tr>
            <tr *ngFor="let row of rowData">
              <td *ngFor="let r of row" (click)="clickEmmiter(r)" class="{{r.class}}">
                <div [innerHTML]="r.table"></div>
              </td>
            </tr>
          </table>
        </div>

        <div class="row text-center-xs">
            <div class="col-sm-5">
                <div class="dataTables_info" id="demo-dt-basic_info" role="status" aria-live="polite" *ngIf="config.paging">Mostrando {{page}} de {{numPages}} paginas <!--- Total de {{filteredData.length}} registros --></div>
            </div>
            <div class="col-sm-7 margin-top-5-xs">
                <pagination *ngIf="config.paging" class="pagination-sm float-inherit-xs" (pageChanged)="onChangeTable(config, $event)" (numPages)="numPages = $event"
                [totalItems]="length"
                [itemsPerPage]="itemsPerPage"
                [maxSize]="maxSize"
                [boundaryLinks]="true"
                [rotate]="false"  
                firstText="{{this.first}}" previousText="{{this.previous}}" nextText="{{this.next}}" lastText="{{this.last}}">
                </pagination>
            </div>
        </div>
    </div>
  `
})
export class DatatableComponent implements OnInit,AfterViewChecked {


  @Input('data') data:Array<any>;
  @Input('columns')columns:Array<any>;
  @Input('pagination')pagination:boolean = true;
  @Input('filter')filter:boolean = true; 
  @Input() keepPaging:boolean; 
  @Output() emmitClick :EventEmitter<any> = new EventEmitter();


  constructor( private location: Location, private localStorage: LocalStorageService, private comumService: ComumService,private ref: ChangeDetectorRef) {
  }

  
  private isViewLineHeader: boolean = false;
  
  private textHeaderList:Array<any> = [];  
  private totalItem:string;
  private totalFooter: string;
  public page:number = 1;
  private itemsPerPage:number = 20;
  private itemTextHeader: number = 1;
  public maxSize:number = 5;
  public numPages:number = 1;
  public length:number = 0;
  public rows:Array<any> = [];
  public rowData:Array<any> = [];
  public config:any ;
  private previous = "Anterior";
  private next = "Próxima";
  private first = "Primeira";
  private last = "Última";
  private filteredData:Array<any> = [];  

  private levels:Array<Object> = [

          {num: 10, name: "10"},
          {num: 25, name: "25"},
          {num: 50, name: "50"},
          {num: 100, name: "100"}
  ];

  ngOnInit() {
    if($(window).width() < 800)
    {
      this.previous = "<";
      this.next = ">";
      this.first = "<<";
      this.last = ">>";
    }
  }

  ngOnDestroy(){
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges(); // bugfix ExpressionChangedAfterItHasBeenCheckedError
  }

  OnChangeItemsPerPage(){
    this.onChangeTable(this.config);
  }

  OnChangeTextHeader(){
    //console.log(this.itemTextHeader)
  }

  ngOnChanges(){
    this.config = {
      paging: this.pagination ,
      sorting: {columns: this.columns},
      filtering: {filterString: ''},
      className: ['table-striped', 'table-bordered']
    }
    this.onChangeTable(this.config);

  }

  clickEmmiter(event){
      this.emmitClick.emit(event);
  }

  public changePage(page:any, data:Array<any> = this.data):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data:any, config:any):any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName:string = void 0;
    let sort:string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && typeof columns[i].sort !== "undefined" && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    let dataSort = data.sort((previous:any, current:any) => {
      
      try {

        if(sort === 'asc'){
          return previous[columnName].localeCompare(current[columnName], this.comumService.userLang, {numeric: true});
        }else if(sort === 'desc'){
          return current[columnName].localeCompare(previous[columnName], this.comumService.userLang, {numeric: true});
        }

      } catch (e) {

        if(e.name === 'RangeError')
          console.log(e);

        if (previous[columnName] > current[columnName]) {
            return sort === 'desc' ? -1 : 1;
        } else if (previous[columnName] < current[columnName]) {
            return sort === 'asc' ? -1 : 1;
        }

      }
      return 0;
    });
    return dataSort;
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data;
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
          // return item[column.name].toLowerCase().match(column.filtering.filterString.toLowerCase());
          return item[column.name].toString().toLowerCase().match(column.filtering.filterString.toLowerCase());
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item:any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray:Array<any> = [];
    filteredData.forEach((item:any) => {
      let flag = false;
      this.columns.forEach((column:any) => {
        if (item[column.name].toString().toLowerCase().match(this.config.filtering.filterString.toLowerCase())) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config:any, page?:any):any {
       
    let sortColuns = '';
    if(config.sorting.columns)
      config.sorting.columns.forEach(element => {
        if(element.sort)
          sortColuns = sortColuns + element.sort;
      });

      if(sortColuns != this.comumService.currentPage['sort']){
        page = {page: this.page, itemsPerPage: this.itemsPerPage}
        this.comumService.currentPage['sort'] = sortColuns;
      }else{
        if(page){
          this.comumService.currentPage['numPage'] = page.page;
          this.comumService.currentPage['urlPage'] = this.location.path();      
          this.comumService.currentPage['path'] = this.localStorage.get("path");
        }else
          page = {page: this.page, itemsPerPage: this.itemsPerPage}

        if(this.keepPaging && this.comumService.currentPage['urlPage'] && this.location.path() == this.comumService.currentPage['urlPage'] && this.comumService.currentPage['path'] == this.localStorage.get("path")){
          if(this.comumService.currentPage['numPage']){
            page.page = this.comumService.currentPage['numPage'];    
          }else{
            page = {page: this.page, itemsPerPage: this.itemsPerPage}      
            this.comumService.currentPage['numPage'] = 0;
          }
        }else if(this.comumService.currentPage['urlPage'] && (this.location.path() != this.comumService.currentPage['urlPage'] || this.comumService.currentPage['path'] != this.localStorage.get("path"))){
          this.keepPaging = false;
          this.comumService.currentPage = {}
        }
      }

    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    this.filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(this.filteredData, this.config);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;

    this.rowData = [];
    let rowDataAux = [];

    this.rows.forEach(rw => {
      rowDataAux = [];
      this.columns.forEach(cl => {
        rowDataAux.push({
          table: rw[cl.name].toString(), 
          class: cl.className, 
          row: rw});
      });
      this.rowData.push(rowDataAux);
    });
    this.length = sortedData.length;
    this.comumService.hiddenColumn();
  }

  public onCellClick(data: any): any {
  }

}

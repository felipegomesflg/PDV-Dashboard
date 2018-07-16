import { Subscription } from 'rxjs/Rx';
import { ComumService } from './../../services/comum.service';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {NgbDateStruct, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';


import * as moment from 'moment';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

@Component({
  selector: 'app-datepicker-range',
  templateUrl: 'datepicker-range.component.html',
  styles: [`
   .dropdown-menu {
     left: initial !important;
   }
    
  `]
})

export class DatepickerRangeComponent implements OnInit  {
  
  @Input() 
  startDate: any;

  @Input() 
  endDate: any;

  @Input() 
  disabled: any;

  @Input() 
  datepikerConfigPositionRigth: boolean = false;  

  @Output() 
  changeDateRange: EventEmitter<any> = new EventEmitter();

  hoveredDate: NgbDateStruct;
    
  private fromDate: NgbDateStruct;
  private toDate: NgbDateStruct;
  private startCalendar: any;
  private ModelStartDate: any;
  private ModelEndDate: any;
  private ModelDate:any;

  private isToggleDatePicker: boolean = false;

  constructor(private calendar: NgbCalendar, private commun: ComumService) {    
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    //this.ModelStartDate = this.fromDate = calendar.getPrev(calendar.getToday(), 'd', 8);
    //this.ModelEndDate = this.toDate = calendar.getPrev(calendar.getToday(), 'd', 1);
    // this.startCalendar = { year: this.fromDate.year, month: this.fromDate.month };
    // this.callChangeData();
  }

  // constructor(calendar: NgbCalendar, private commun: ComumService) {
  //   this.fromDate = calendar.getToday();
  //   this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  //  }


  ngOnInit() {    
    if(this.startDate && this.endDate) {
      this.fromDate = this.convertTimestamp(this.startDate);
      this.toDate = this.convertTimestamp(this.endDate);
    } else {
      this.fromDate = this.calendar.getToday();
      this.toDate = this.calendar.getToday();
    }
    //this.ModelDate = this.fromDate;
    this.startCalendar = { year: this.fromDate.year, month: this.fromDate.month };
    this.callChangeData();      
  }
  

  convertTimestamp(ts) {
    let obj = {'year':null,'month':null,'day':null};
    let dt = moment.unix(ts).format('DD/MM/YYYY').split('/');
      obj['day'] = parseFloat(dt[0]);
      obj['month'] = parseFloat(dt[1]);
      obj['year'] = parseFloat(dt[2]);
      return obj;
  }


  openDatePickerRange() {
    if(this.disabled)
      return false;
    this.isToggleDatePicker = !this.isToggleDatePicker;
    this.startCalendar = { year: this.fromDate.year, month: this.fromDate.month };
  }


  callChangeData() {
    this.ModelDate = this.commun.formDateModelToView(this.fromDate) + ' - ' + this.commun.formDateModelToView(this.toDate);
    this.changeDateRange.emit({ start: this.commun.formDateApi(this.fromDate) , end: this.commun.formDateApi(this.toDate) });
  }


  datePickerToggle() {
    
    this.isToggleDatePicker = !this.isToggleDatePicker;
  }


  openDatePicker(d) {
    this.isToggleDatePicker = !this.isToggleDatePicker;
  }


  onDateChangeModel(Modeldate: any, dp: any) {
    if(Modeldate.length === 10) {
    //console.log(this.commun.isDateComparison(dp, dp));
    }
  }


  onDateBlurModel(Modeldate: any, dp: any) {
    //console.log(this.commun.isDataValid(dp))
    dp._elRef.nativeElement.value = dp._elRef.nativeElement.value + ' até ' // this.commun.formDateModelToView(this.fromDate) + ' até ' //+ this.commun.formDateModelToView(this.toDate)
  }


  onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date; //this.validStartDate(date);
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;  //this.validStartDate(date);
    }
    
    if (this.fromDate !== null && this.toDate !== null) {
      this.isToggleDatePicker = !this.isToggleDatePicker;
      this.callChangeData();
    }
  }


  // private validStartDate(date:any){
  //   if(this.commun.formatDateSemBarra(this.commun.formDateApi(this.commun.today)) > this.commun.formatDateSemBarra(this.commun.formDateApi(date))){
  //     this.commun.validField(0, "startDate", "Data Inicial");
  //     this.fromDate = null; this.ModelStartDate = null;
  //   }else{
  //     this.fromDate = date; this.ModelStartDate = date;}
  // }


  ngModelChangeDatePicker(dEnd: any, d: any) {
    this.commun.isDateComparison(dEnd, d, 'range');

    let date1 = dEnd._elRef.nativeElement.value;
    let date2 = d._elRef.nativeElement.value;
    if(date1.replace(/[-,\/]/g, "").length === 8 && date2.replace(/[-,\/]/g, "").length === 8) {
      switch (dEnd._elRef.nativeElement.id) {
        case 'startDate': this.fromDate  = this.commun.formDateView(this.commun.formatDateIncludeBarra(date1))
          break;
        case 'endDate':  this.toDate = this.commun.formDateView(this.commun.formatDateIncludeBarra(date1))
          break;
        }
        this.callChangeData();
      }
  }


  ngModelBlurDatePicker(d:any) {
    this.commun.isDataValid(d)

    let date = d._elRef.nativeElement.value;
    if(date.replace(/[-,\/]/g, "").length === 8) {
      switch (d._elRef.nativeElement.id) {
        case 'startDate': this.fromDate  = this.commun.formDateView(this.commun.formatDateIncludeBarra(date))
          break;
        case 'endDate':  this.toDate = this.commun.formDateView(this.commun.formatDateIncludeBarra(date))
          break;
        }
        //this.callChangeData();
      }
  }


  closeDateRange() {
    this.isToggleDatePicker = !this.isToggleDatePicker;
  }


  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

  }
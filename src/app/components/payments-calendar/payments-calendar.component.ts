import { Component, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter,forwardRef } from '@angular/core';
import { CalendarEvent,
  CalendarDateFormatter,
  DAYS_OF_WEEK,DateFormatterParams ,CalendarMonthViewDay } from 'angular-calendar';

  import {
    getSeconds,
    getMinutes,
    getHours,
    getDate,
    getMonth,
    getYear,
    setSeconds,
    setMinutes,
    setHours,
    setDate,
    setMonth,
    setYear,
    startOfDay,
    endOfDay,
    subDays,
    addDays,
    endOfMonth,
    isSameDay,
    isSameMonth,
    addHours,
    getISOWeek 
  } from 'date-fns';

import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';

import {ComumService} from '../../services/comum.service';

export const DATE_TIME_PICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DateTimePickerComponent),
  multi: true
};

const colors: any = {
  late: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  done: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  pending: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-payments-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-calendar.component.html',
  styleUrls: ['./payments-calendar.component.scss'],
  providers: [CalendarDateFormatter]
})
export class PaymentsCalendarComponent {
 view: string = 'month';

 locale: string = 'pt';
 salesDetail :any[] = [];

 selectedMonthViewDay: CalendarMonthViewDay;
  @Input() selectedDay: any;
  viewDate: Date = new Date();

  events: any[] = [
    {
      start: moment.unix(1513735200),
      title: 'R$ 5159,15',
      subtitle:'Atrasado',
      color: 'red',
      values:{
        'date':1513735200,
        'sales':'59,15',
        'debit':'500,00',
        'credit':'700,00',
        'anticipation':'400,00',
        'chargeback':'0,00',
        'void':'0,00',
        'other':'3500,00',
        'balance':'5159,15',
        'status':'Depositado'
      }
    },
    {
      start: moment.unix(1513821600),
      title: 'R$ 65,15',
      subtitle:'Recebido',
      color: 'blue',
      values:{
        'date':1513821600,
        'sales':'0,00',
        'debit':'0,00',
        'credit':'0,00',
        'anticipation':'0,00',
        'chargeback':'0,00',
        'void':'0,00',
        'other':'65,15',
        'balance':'65,15',
        'status':'Depositado'
      }
    },
    {
      start: moment.unix(1514426400),
      title: 'R$ 1159,15',
      subtitle:'A Receber',
      color: 'yellow',
      values:{
        'date':1514426400,
        'sales':'59,50',
        'debit':'30,15',
        'credit':'40,50',
        'anticipation':'100,00',
        'chargeback':'0,00',
        'void':'30,00',
        'other':'1169,00',
        'balance':'1159,15',
        'status':'Depositado'
      }
    }
  ];

  constructor(private comumService:ComumService) {}

  dayClicked(day: CalendarMonthViewDay): void {
    this.salesDetail = [];
    this.selectedDay = '';
    if (this.selectedMonthViewDay) {
      delete this.selectedMonthViewDay.cssClass;
    }
    if(day.events.length>0){
      day.events.forEach(val=>{
        this.selectedDay = val['values'];
      })
    }
    day.cssClass = 'cal-day-selected';
    this.selectedMonthViewDay = day;
  }
    beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
      
      
    body.forEach(day => {
      if (
        this.selectedDay &&
        day.date.getTime() === parseFloat(this.selectedDay.date)*1000
      ) {
        day.cssClass = 'cal-day-selected';
        this.selectedMonthViewDay = day;
      }
    });
  }

   detailSale(date,target){
     
      this.salesDetail = [{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      },{
        'category':'Venda',
        'date':'09:16 26/12/2007',
        'type':'Stone',
        'installments':'1',
        'grossSale':'215,05',
        'netValue':'210,00',
        'status':'A Receber<br>21/12/2017'
      }
    ]
    setTimeout(()=> {
      target.scrollIntoView({behavior:"smooth",block: "start"});
    }, 50);
    
  }

}





//#########################################################################################
//#################################     CALENDAR UTIL   ###################################
//#########################################################################################

@Component({
  selector: 'mwl-demo-utils-calendar-header',
  template: `
    <div class="row text-center">
     <div class="col-md-6 text-left">
        <h3>{{ viewDate | calendarDate:(view + 'ViewTitle'):locale }}</h3>
      </div>
      <div class="col-md-6 text-right">
        <div class="btn-group">
          <div
            class="btn btn-primary"
            mwlCalendarPreviousView
            [view]="view"
            [(viewDate)]="viewDate"
            (viewDateChange)="viewDateChange.next(viewDate)">
            Anterior
          </div>
          <div
            class="btn btn-outline-secondary"
            mwlCalendarToday
            [(viewDate)]="viewDate"
            (viewDateChange)="viewDateChange.next(viewDate)">
            Hoje
          </div>
          <div
            class="btn btn-primary"
            mwlCalendarNextView
            [view]="view"
            [(viewDate)]="viewDate"
            (viewDateChange)="viewDateChange.next(viewDate)">
            Próximo
          </div>
        </div>
      </div>
     
     <!-- <div class="col-md-4">
        <div class="btn-group">
          <div
            class="btn btn-primary"
            (click)="viewChange.emit('month')"
            [class.active]="view === 'month'">
            Mensal
          </div>
          <div
            class="btn btn-primary"
            (click)="viewChange.emit('week')"
            [class.active]="view === 'week'">
            Semanal
          </div>
          <div
            class="btn btn-primary"
            (click)="viewChange.emit('day')"
            [class.active]="view === 'day'">
            Diário
          </div>
        </div>
      </div>
      -->
    </div>
    <br>
  `
})
export class CalendarHeaderComponent {
  @Input() view: string;

  @Input() viewDate: Date;

  @Input() locale: string = 'fr';

  @Output() viewChange: EventEmitter<string> = new EventEmitter();

  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();
}


@Component({
  selector: 'mwl-demo-utils-date-time-picker',
  template: `
    <form class="form-inline">
      <div class="form-group">
        <div class="input-group">
          <input
            readonly
            class="form-control"
            [placeholder]="placeholder"
            name="date"
            [(ngModel)]="dateStruct"
            (ngModelChange)="updateDate()"
            ngbDatepicker
            #datePicker="ngbDatepicker">
            <div class="input-group-addon" (click)="datePicker.toggle()" >
              <i class="fa fa-calendar"></i>
            </div>
        </div>
      </div>
    </form>
    <ngb-timepicker
      [(ngModel)]="timeStruct"
      (ngModelChange)="updateTime()"
      [meridian]="true">
    </ngb-timepicker>
  `,
  styles: [
    `
    .form-group {
      width: 100%;
    }
  `
  ],
  providers: [DATE_TIME_PICKER_CONTROL_VALUE_ACCESSOR]
})
export class DateTimePickerComponent implements ControlValueAccessor {
  @Input() placeholder: string;

  date: Date;

  dateStruct: NgbDateStruct;

  timeStruct: NgbTimeStruct;

  datePicker: any;

  private onChangeCallback: (date: Date) => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(date: Date): void {
    this.date = date;
    this.dateStruct = {
      day: getDate(date),
      month: getMonth(date) + 1,
      year: getYear(date)
    };
    this.timeStruct = {
      second: getSeconds(date),
      minute: getMinutes(date),
      hour: getHours(date)
    };
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {}

  updateDate(): void {
    const newDate: Date = setYear(
      setMonth(
        setDate(this.date, this.dateStruct.day),
        this.dateStruct.month - 1
      ),
      this.dateStruct.year
    );
    this.onChangeCallback(newDate);
  }

  updateTime(): void {
    const newDate: Date = setHours(
      setMinutes(
        setSeconds(this.date, this.timeStruct.second),
        this.timeStruct.minute
      ),
      this.timeStruct.hour
    );
    this.onChangeCallback(newDate);
  }
}




export class CustomDateFormatter extends CalendarDateFormatter {
  public weekViewTitle({ date, locale }: DateFormatterParams): string {
    const year: string = new Intl.DateTimeFormat(locale, {
      year: 'numeric'
    }).format(date);
    const weekNumber: number = getISOWeek(date);
    return `Semaine ${weekNumber} en ${year}`;
  }
}
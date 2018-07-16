import { Injectable } from "@angular/core";
import { NgbDatepickerI18n } from "@ng-bootstrap/ng-bootstrap";
import { ComumService } from "../services/comum.service";
import { weekdays } from "moment";

// const I18N_VALUES = {
//   en_US: {
//     weekdays_short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     months_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     months_full: ['January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December']
//   },
//   pt_BR: {
//     weekdays_short: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
//     months_short: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
//     months_full: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
//   }
// }

const WEEKDAYS_SHORT =
['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS_SHORT =
['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTHS_FULL =
['January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December'];

const WEEKDAYS_SHORT_PT_BR =
['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const MONTHS_SHORT_PT_BR =
['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const MONTHS_FULL_PT_BR =
['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

@Injectable()
export class DatePickerPtBr extends NgbDatepickerI18n {

  userLang = navigator.language;

  getWeekdayShortName(weekday: number) {
    if(this.userLang == "pt-BR")
      return WEEKDAYS_SHORT_PT_BR[weekday - 1];
    else
      return WEEKDAYS_SHORT[weekday - 1];
  }

  getMonthShortName(month: number) {
    if(this.userLang == "pt-BR")
      return MONTHS_SHORT_PT_BR[month - 1];
    else
      return MONTHS_SHORT[month - 1];                     
  }

  getMonthFullName(month: number) {
    if(this.userLang == "pt-BR")
      return MONTHS_FULL_PT_BR[month - 1];
    else
      return MONTHS_FULL[month - 1];
  }

}
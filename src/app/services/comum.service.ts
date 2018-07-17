import { version } from 'punycode';
import { Injectable, EventEmitter } from "@angular/core";
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Http, Jsonp } from "@angular/http";
import { NgbDateStruct, NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import { Subject } from 'rxjs/Subject';

import { LocalStorageService } from 'angular-2-local-storage'
import { DatePickerFormatter } from '../services/datepicker.formatter.service';
import { AngularFireAuth } from "angularfire2/auth";
import { Intercom } from 'ng-intercom';

import { isDev } from "../app.environment";

import * as moment from 'moment';
import * as $ from 'jquery'

@Injectable()
export class ComumService {
    
    path = new Subject();
    pathArray = new Subject();
    storeid = new Subject();
    loading: boolean = false;
    isMenu: boolean = false;
    public currentPage: any = {};
    public accountDetailAndType: any;
    public accountTypeId: any;
    modalReference: any;
    globalLoading: boolean = true;
    public today;

    public activeResource:any;
    public lang:any =  window.navigator.language.toLowerCase()

//export var lang =  'en-us';
    dateFormat:any;
    


    public currentStore;
    public maskCNPJ = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    public maskCEP = [/[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
    public maskSKU = [/[1-9]/, /[1-9]/, /[1-9]/, /[1-9]/, /[1-9]/, /[1-9]/];
    public maskCPF = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    public maskPinCode = [/\d/, '.', /\d/, '.', /\d/, '.', /\d/, '.', /\d/, '.', /\d/];
    public maskPhone(number: string) {
        if (number[9] != '2' && number[9] != '3') {
            return ['+', 5, 5, ' ', '(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        } else {
            return ['+', 5, 5, ' ', '(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
        }
    }
    public maskDate = [/[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, '/', /\d/, /\d/, /\d/, /\d/];
    public maskTime(number: string) {
        switch (number[0]) {
            case '0': return [/[0]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
            case '1': return [/[0-1]/, /[0-9]/, ':', /[0-5]/, /[0-9]/];
            default: return [/[0-2]/, /[0-3]/, ':', /[0-5]/, /[0-9]/];
        }
    }
    public maskOnlyNumber = [/^\d+$/, /\d/];
    public noImg = 'https://fuelonline.com/wp-content/themes/superfine/assets/images/blog/no-img.jpg';
    public noImgStoreAccount = 'https://cdn.dribbble.com/users/683081/screenshots/2728654/exfuse_app_main_nocontent.png';//'http://www.clker.com/cliparts/d/L/P/X/z/i/no-image-icon-md.png';

    // public isFormatImg(imgUrl){
    //    var regex = /^http[^ \!@\$\^&\(\)\+\=]+(\.png|\.jpeg|\.jpg)$/;

    //     var test = [
    //         imgUrl.value
    //     ]

    //     for (var i = 0; i< test.length; i++){
    //       if(regex.test(test[i]) && imgUrl.value.includes('https:'))
    //         return imgUrl.value;
    //       this.validField(0, "string", "Endereço da imagem nos formatos jpg, jpeg ou png");
    //     }

    // }

    menuToggle = new EventEmitter<boolean>();
    displayImage = new EventEmitter<string>();
    constructor(
        public toastr: ToastsManager,
        public af: AngularFireAuth,
        public localStorage: LocalStorageService,
        private jsonp: Jsonp,
        private calendar: NgbCalendar,
        public intercom: Intercom) {

        if(this.lang=='pt-br')
            this.dateFormat = 'DD/MM/YYYY'
        else
            this.dateFormat = 'MM/DD/YYYY'

        this.today = calendar.getToday();
    }

    userLang = navigator.language;

    sep = this.userLang == "pt-BR" ? ',' : '.';

    //VALIDAÇÃO/FORMATAÇÃO
    fMoeda(v) {
        //let separador = this.sep;
        if (v == null)
            return "";
        var neg = false;
        if (typeof v != 'string')
            v = v.toString();
        if (v.indexOf('-') > -1)
            neg = true;
        v = String(v).replace(/\D/g, "")
        v = new String(Number(v));
        var len = v.length;
        if (1 == len)
            v = v.replace(/(\d)/, "0,0$1");
        else if (2 == len)
            v = v.replace(/(\d)/, "0,$1");
        else if (len > 2)
            v = v.replace(/(\d{2})$/, ",$1");
        if (neg)
            v = '-' + v;
        return v;
    }

    fMoedaReal(val) {
        let v = val.replace(/\D/g, "");
        v = new String(Number(v));
        var len = v.length;
        if (1 == len)
            v = v.replace(/(\d)/, "0,0$1");
        else if (2 == len)
            v = v.replace(/(\d)/, "0,$1");
        else if (len > 2 && len <= 5)
            v = v.replace(/(\d{2})$/, ",$1");
        else if (len > 5)
            v = v.replace(/(\d{2})$/, ",$1").replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
        return v;
    }

    fMoedaRealKeyup(val, event) {
        if (event.keyCode !== 8 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 46) {
            let v = val.replace(/\D/g, "");
            v = new String(Number(v));
            var len = v.length;
            if (1 == len)
                v = v.replace(/(\d)/, "0,0$1");
            else if (2 == len)
                v = v.replace(/(\d)/, "0,$1");
            else if (len > 2 && len <= 5)
                v = v.replace(/(\d{2})$/, ",$1");
            else if (len > 5)
                v = v.replace(/(\d{2})$/, ",$1").replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            return v;
        }
        return val;
    }

    fMoedaRealBlur(v) {
        if (v.value.slice(-1) === ',')
            return v.value = v.value + '00';
        v.value = v.value.replace(/[^0-9\,]+/g, "");
        let len = v.value.length;
        if (2 == len)
            return v.value = v.value.replace(/(\d)/, "0,$1");
        if (v.value.indexOf(',') < 0)
            return v.value = v.value.replace(/(\d{2})$/, ",$1").replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
        return v.value = v.value.replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
    }

    fData(v) {
        v = v.replace(/\D/g, "")
        v = v.replace(/(\d{2})(\d)/, "$1/$2")
        v = v.replace(/(\d{2})(\d)/, "$1/$2")
        return v;
    }

    keyupTax(e) {
        if (e.value[0].replace(/\D/g, "") !== '')
            if (e.value.charAt(e.value.length - 1) != ".")
                e.value = parseFloat(e.value);
    }

    blurTax(e) {
        if (e.value[0].replace(/\D/g, "") !== '')
            e.value = parseFloat(e.value);
    }

    fNum(v) {
        v = v.replace(/\D/g, "");
        return parseFloat(v);
    }
    fCep(v) {
        v = v.replace(/\D/g, "")
        v = v.replace(/^(\d{5})(\d{3})/, "$1-$2");
        return v;
    }

    fCnpj(v) {
        v = v.replace(/\D/g, "")
        v = v.replace(/^(\d{2})(\d)/, "$1.$2")
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2")
        v = v.replace(/(\d{4})(\d)/, "$1-$2")
        return v;
    }

    fCpf(v) {
        v = v.replace(/\D/g, "")
        v = v.replace(/(\d{3})(\d)/, "$1.$2")
        v = v.replace(/(\d{3})(\d)/, "$1.$2")
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        return v;
    }

    fPinCode(v) {
        v = v.replace(/\D/g, "")
        if (v.length != 6)
            return '';

        return v;
    }

    fCnpjCpf(v) {
        v = v.replace(/\D/g, "")
        if (v.length == 11) {
            let numeros, digitos, soma, i, resultado, digitos_iguais;
            digitos_iguais = 1;
            for (let i = 0; i < v - 1; i++)
                if (v.charAt(i) != v.charAt(i + 1)) {
                    digitos_iguais = 0;
                    break;
                }
            if (!digitos_iguais) {
                numeros = v.substring(0, 9);
                digitos = v.substring(9);
                soma = 0;
                for (i = 10; i > 1; i--)
                    soma += numeros.charAt(10 - i) * i;
                resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                if (resultado != digitos.charAt(0)) { return ''; }
                numeros = v.substring(0, 10);
                soma = 0;
                for (i = 11; i > 1; i--)
                    soma += numeros.charAt(11 - i) * i;
                resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                if (resultado != digitos.charAt(1)) { return ''; }
            } else
                return ''

            v = v.replace(/(\d{3})(\d)/, "$1.$2")
            v = v.replace(/(\d{3})(\d)/, "$1.$2")
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            return v;
        } else if (v.length == 14) {
            if (v == "00000000000000" ||
                v == "11111111111111" ||
                v == "22222222222222" ||
                v == "33333333333333" ||
                v == "44444444444444" ||
                v == "55555555555555" ||
                v == "66666666666666" ||
                v == "77777777777777" ||
                v == "88888888888888" ||
                v == "99999999999999")
                v = '';
            let tamanho = v.length - 2;
            let numeros = v.substring(0, tamanho);
            let digitos = v.substring(tamanho);
            let soma = 0;
            let pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) v = '';
            tamanho = tamanho + 1;
            numeros = v.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) v = '';
            v = v.replace(/^(\d{2})(\d)/, "$1.$2")
            v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            v = v.replace(/\.(\d{3})(\d)/, ".$1/$2")
            v = v.replace(/(\d{4})(\d)/, "$1-$2")
            return v;
        } else {

            return '';
        }
    }

    fPhone(v) {
        v = v.replace(/\D/g, "")
        v = v.replace(/^(\d\d)(\d)/g, "+$1 $2")
        v = v.replace(/(\d{2})(\d)/, "($1) $2")
        if (v[9] != '2' && v[9] != '3') {
            v = v.replace(/(\d{5})(\d)/, "$1-$2")
        } else {
            v = v.replace(/(\d{4})(\d)/, "$1-$2")
        }
        return v;
    }

    isNum(str) {
        return str = str.replace(/[^\d,]+/g, "");
    }

    fmask = function (tp, obj, msg = undefined, ev = undefined) {
        if (!obj.value)
            return false;
        var ret = tp(obj.value, ev);
        if (ret == '' && msg) {
            this.alertError(msg);
        }
        obj.value = ret;
    }

    isDataValid(obj, objNeighbor = undefined) {
        var validformat = /^\d{2}\/\d{2}\/\d{4}$/ //Basic check for format validity
        var dayfield = obj._elRef.nativeElement.value.split("/")[0]
        var monthfield = obj._elRef.nativeElement.value.split("/")[1]
        var yearfield = obj._elRef.nativeElement.value.split("/")[2]
        var dayobj = new Date(yearfield, monthfield - 1, dayfield)
        if ((dayobj.getMonth() + 1 != monthfield) || (dayobj.getDate() != dayfield) || (dayobj.getFullYear() != yearfield) || parseInt(yearfield) > 2500 || parseInt(yearfield) < 1800) { obj._elRef.nativeElement.value = ''; obj._model = null; return false; }
        if (objNeighbor)
            this.isDateComparison(obj, objNeighbor)
    }

    isDateComparison(obj, objNeighbor, range: string = '') {
        let date1 = obj._elRef.nativeElement.value;
        let date2 = objNeighbor._elRef.nativeElement.value;
        let dateToday = this.formatDateSemBarra(this.formDateApi(this.today));
        if (date1.replace(/[-,\/]/g, "").length === 8 || date2.replace(/[-,\/]/g, "").length === 8) {
            if (date1.replace(/[-,\/]/g, "").length === 8 && date2.replace(/[-,\/]/g, "").length === 8) {
                date1 = this.formatDate(date1);
                date2 = this.formatDate(date2);
                switch (obj._elRef.nativeElement.id) {
                    case 'startDate':
                        if (date1 > date2) { objNeighbor._elRef.nativeElement.value = this.formatDateIncludeBarra(obj._elRef.nativeElement.value); return false; }
                        break;
                    case 'endDate':
                        if (date2 > date1) { obj._elRef.nativeElement.value = ''; obj._model = null; this.validField(0, obj._elRef.nativeElement.id, "Data Final"); return false; };
                        break;
                }
            }

            if (range !== 'range')
                if (typeof date1 === "object" && typeof date2 === "object") {
                    switch (obj._elRef.nativeElement.id) {
                        case 'startDate':
                            if (typeof date1 === "object" && date1 < dateToday) { obj._elRef.nativeElement.value = ''; obj._model = null; this.validField(0, obj._elRef.nativeElement.id, "Data Inicial"); return false; };
                            break;
                        case 'endDate':
                            if (typeof date2 === "object" && date2 < dateToday) { obj._elRef.nativeElement.value = ''; obj._model = null; this.validField(1, obj._elRef.nativeElement.id, "Data Final"); return false; };
                            break;
                    }
                } else {

                    if (typeof date1 === "string" && date1 !== "" && date1.replace(/[-,\/]/g, "").length === 8) {
                        date1 = this.formatDate(date1);
                        switch (obj._elRef.nativeElement.id) {
                            case 'startDate':
                                if (date1 < dateToday) { obj._elRef.nativeElement.value = ''; obj._model = null; this.validField(0, obj._elRef.nativeElement.id, "Data Inicial"); return false; };
                                break;
                            case 'endDate':
                                if (date1 < dateToday) { obj._elRef.nativeElement.value = ''; obj._model = null; this.validField(1, obj._elRef.nativeElement.id, "Data Final"); return false; };
                                break;
                        }
                    } else if (typeof date1 === "string" && date1 === "") { return false; }
                }
        }
        return true;
    }

    public formatDateIncludeBarra(date) {
        if (date.indexOf('/') === -1)
            return date.replace(/(\d\d)(\d\d)(\d\d\d\d)/, '$1/$2/$3');
        return date;
    }

    public fixDateFormat(input_date) {
        let myDate: any;
        if (input_date.indexOf('-') > -1)
            myDate = input_date.split('-');
        if (input_date.indexOf('/') > -1)
            myDate = input_date.split('/');
        let Year: any = myDate[0];
        let myDay: any = myDate[2]
        let myMonth: any = myDate[1]
        // myDay = (myDay < 10) ? ("0" + myDay) : myDay;
        // myMonth = (myMonth < 10) ? ("0" + myMonth) : myMonth;
        return Year + "-" + myMonth + "-" + myDay;
    }

    public formatDate(date) {
        if (date.indexOf('/') === -1)
            date = date.replace(/(\d\d)(\d\d)(\d\d\d\d)/, '$1/$2/$3');
        let from = date.split("/");
        return new Date(from[1]
            .concat("/")
            .concat(from[0])
            .concat("/")
            .concat(from[2]));
    };

    public formatDateSemBarra(date) {
        if (date.indexOf('-') === -1)
            date = date.replace(/(\d\d)(\d\d)(\d\d\d\d)/, '$1/$2/$3');
        let from = date.split("-");
        return new Date(from[0]
            .concat("/")
            .concat(from[1])
            .concat("/")
            .concat(from[2]));
    };

    formDatetoMoment(strData) {

        let from = strData.split("/");
        return from[2]
            .concat("-")
            .concat(from[1])
            .concat("-")
            .concat(from[0]);

    }

    setWindowHeight(height) {
        $('.modal-body .panel-body .panel:last-child').css('min-height', height + 'px');
    }

    isCNPJValid(obj) {
        let cnpj = obj.value;
        cnpj = cnpj.replace(/[^\d]+/g, '');
        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false

        return true;

    }

    isCPFValid(obj) {//chamado pelo fmask para validar o cpf
        let cpf = obj.replace(/\D/g, "");
        var numeros, digitos, soma, i, resultado, digitos_iguais;
        digitos_iguais = 1;
        if (cpf.length < 11)
            return '';
        for (i = 0; i < cpf.length - 1; i++)
            if (cpf.charAt(i) != cpf.charAt(i + 1)) {
                digitos_iguais = 0;
                break;
            }
        if (!digitos_iguais) {
            numeros = cpf.substring(0, 9);
            digitos = cpf.substring(9);
            soma = 0;
            for (i = 10; i > 1; i--)
                soma += numeros.charAt(10 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) { return ''; }
            numeros = cpf.substring(0, 10);
            soma = 0;
            for (i = 11; i > 1; i--)
                soma += numeros.charAt(11 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) { return ''; }
        } else
            return '';

        return obj;
    }

    isEmail(obj) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(obj))
            return ''
        else
            return obj;
    }

    formDateView(strData) {
        let from = strData.split("/");
        return {
            year: parseInt(from[2]),
            month: parseInt(from[1]),
            day: parseInt(from[0])
        };
    }

    formDateApi(strData) {
        let temp = [];
        if (strData) {
            temp['day'] = strData.day >= 10 ? strData.day.toString() : "0" + strData.day.toString();
            temp['month'] = strData.month >= 10 ? strData.month.toString() : "0" + strData.month.toString();
            let first = this.userLang.toLowerCase() == 'en-us' ? temp['month'] : temp['day'];
            let second = this.userLang.toLowerCase() == 'en-us' ? temp['day'] : temp['month'];
            return strData.year.toString()
                .concat("-")
                .concat(temp['month'])
                .concat("-")
                .concat(temp['day']);
        } else { return null; }
    }

    formDateModelToView(strData) {
        let temp = [];
        if (strData) {
            temp['day'] = strData.day >= 10 ? strData.day.toString() : "0" + strData.day.toString();
            temp['month'] = strData.month >= 10 ? strData.month.toString() : "0" + strData.month.toString();
            let first = this.userLang.toLowerCase() == 'en-us' ? temp['month'] : temp['day'];
            let second = this.userLang.toLowerCase() == 'en-us' ? temp['day'] : temp['month'];
            return first
                .concat("/")
                .concat(second)
                .concat("/")
                .concat(strData.year.toString());
        } else { return null; }
    }

    formDateModelToUnix(strData) {
        let temp = [];
        if (strData) {
            temp['day'] = strData.day >= 10 ? strData.day.toString() : "0" + strData.day.toString();
            temp['month'] = strData.month >= 10 ? strData.month.toString() : "0" + strData.month.toString();
            let first = this.userLang.toLowerCase() == 'en-us' ? temp['month'] : temp['day'];
            let second = this.userLang.toLowerCase() == 'en-us' ? temp['day'] : temp['month'];
            return moment(strData.year.toString()
                .concat("-")
                .concat(temp['month'])
                .concat("-")
                .concat(temp['day'])).unix();
        } else { return null; }
    }

    booleantoIco(opt: boolean) {
        let res = 'fa fa-window-close-o status inactive';
        if (opt)
            res = 'fa fa-check-square-o status active'

        return '<i class="' + res + '">'
    }

    iconRemove() {
        return '<i class="demo-pli-cross icon-lg icon-remove"></i>';
    }

    //TRANSFORMAR PARA SELECT2
    setSelect2(obj, id, text, zero, multiple = false, sort = true) {
        let ar = []
        if (sort)
            obj.sort((a, b) => { return (a[text] > b[text]) ? 1 : ((b[text] > a[text]) ? -1 : 0); });
        if (zero && !multiple)
            ar.push({ id: '', text: zero })
        for (var i = 0; i < obj.length; i++) {
            if ((i == 0) || (i > 0 && obj[i - 1][text] != obj[i][text])) {
                if (id)
                    ar.push({ id: obj[i][id], text: obj[i][text], additional: obj[i] })
                else
                    ar.push({ id: obj[i], text: obj[i][text], additional: obj[i] })
            }
        }
        return ar;
    }

    readCNPJ(id) {
        return this.jsonp.request("https://www.receitaws.com.br/v1/cnpj/" + id.replace(/[^\d]+/g, "") +
            "?callback=JSONP_CALLBACK",
            { method: "Get" })
    }

    readCEP(id) {
        return this.jsonp.request("https://viacep.com.br/ws/" + id.replace(/[^\d]+/g, "") +
            "/json/?callback=JSONP_CALLBACK",
            { method: "Get" })
    }

    validField(field, type, msg) {
        switch (type) {
            case 'string':
                if (field == '' || field == 0 || field == null) {
                    this.alertError('Digite o campo ' + msg);
                    return this.shakeModal();
                }
                break;
            case 'combo':
                if (field == 0) {
                    this.alertError('Selecione um valor nas lista de ' + msg);
                    return this.shakeModal();
                }
                break;
            case 'table':
                if (field == 0) {
                    this.alertError('Inclua pelo menos uma ' + msg);
                    return this.shakeModal();
                }
                break;
            case 'startDate':
                if (field == 0) {
                    this.alertError(msg + ' não pode ser inferior a data de hoje!');
                    return this.shakeModal();
                }
            case 'endDate':
                if (field == 0) {
                    this.alertError(msg + ' não pode ser inferior que Data inicio!');
                    return this.shakeModal();
                } else {
                    this.alertError(msg + ' não pode ser inferior a data de hoje!');
                    return this.shakeModal();
                }
        }
        return true;

    }

    shakeModal() {
        $('.modal-dialog').addClass('animated shake');
        setTimeout(() => {
            $('.modal-dialog').removeClass('animated shake');
        }, 500);
        return false;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    distinctSumValues(arr, key, value) { //unifica um objeto somando um dos campos
        let cont = 1;
        var map = arr.reduce(function (map, type) {
            var name = type[key]
            var price = +type[value]
            map[name] = (map[name] || 0) + price
            return map
        }, {})

        return Object.keys(map).map(function (name) {
            return {
                brand: name,
                value: map[name]
            }
        })
    }

    sumValues(arr, key) { //soma valores de um objeto
        let temp = 0;
        arr.forEach(element => {
            temp += element[key];
        });
        return temp;
    }
    
    getFieldFromArray(arr,key,cond,value){
        let ret = '';
        arr.forEach(element => {
            if(element[key]==cond)
                ret = element[value];
            
        });
        return ret;

    }

    //GERAL

    toggleMenu() {
        this.menuToggle.emit();
        this.isMenu = !this.isMenu;
    }
    
    alertError(msg, title = '', time = 5000) {
        this.af.authState.take(1).subscribe(af => {
            if (af)
                this.toastr.error(msg, title, { showCloseButton: true, toastLife: time, positionClass: "toast-top-center" });
        });
    }
    alertWarning(msg, title = '', time = 5000) {
        this.toastr.warning(msg, title, { showCloseButton: true, toastLife: time });
    }

    alertInfo(msg, title = '', time = 5000) {
        this.toastr.info(msg, title, { showCloseButton: true, toastLife: time });
    }

    alertOk(msg, title = '', time = 5000) {
        this.toastr.success(msg, title, { showCloseButton: true, toastLife: time });
    }

    confirm(msg) {
        if (confirm(msg))
            return true;
        else
            return false
    }

    errorModal(er) {
        this.loading = false;
        this.alertError(er);
        if (this.modalReference)
            this.modalReference.close();
    }

    formDateViewDataTable(strData) {
        if (strData.indexOf("T") !== -1) {
            let from = strData.substring(0, strData.indexOf("T")).split("-");
            return from[2]
                .concat("/")
                .concat(from[1])
                .concat("/")
                .concat(from[0]);
        } else {
            return strData;
        }
    }

    getAccountType(path = undefined) {
        let getPath: any;
        let getPathArray: any;
        if (path)
            getPath = path;
        else
            getPath = this.localStorage.get('path');

        getPathArray = this.localStorage.get('pathArray');

        getPathArray.forEach(el => {
            if (el.firebase_path == getPath)
                this.accountTypeId = el.account_type.id;
        });
        //let accountDetailCurrent = getPath.split('account_detail/')[1];

        // if (this.accountDetailAndType)
        //     this.accountDetailAndType.forEach(el => {
        //         if (accountDetailCurrent === el.account_detail_id)
        //             this.accountTypeId = el['account_type'].id;
        //     });
    }

    hiddenColumn() {
        let pos = [];
        setTimeout(() => { //timeout de 1 porque por algum motivo so funciona com timeout,mesmo que minimo.
            let cont = 0;
            $('.dataTable').each(function (this) {
                pos = [];
                cont = 0;
                $(this).find('thead tr th').each(function () {
                    if ($(this).hasClass('hidden-xs'))
                        pos.push(cont);
                    cont++;
                });
                $(this).find('tbody tr').each(function () {
                    pos.forEach(element => {
                        $($(this).find('td')[element]).addClass('hidden-xs');
                    });
                })
            })
        }, 1)
    }

    dayOfWeek(day) {
        return moment.unix(day).locale('pt').format('dddd');
    }
    dayMonth(day) {
        return moment.unix(day).format("DD/MM");
    }

    formatTimeStamp(date) {
        return moment.unix(date).locale('pt').format('DD/MM/YYYY HH:mm:ss');
    }

    formatTimeStampOnlyDate(date) {
        return moment.unix(date).locale('pt').format('DD/MM/YYYY');
    }

    // PATHARRAY
    set pathArrayGet(value) {
        this.localStorage.set('pathArray', value);
        this.pathArray.next(value);
    }


    get pathArrayGet() {
        return this.localStorage.get('pathArray');
    }
    // PATH
    set pathGet(value) {
        this.localStorage.set('path', value);
        this.path.next(value);
    }

    get pathGet() {
        return this.localStorage.get('path');
    }
    //STORE
    set storeGet(value) {
        this.localStorage.set('storeid', value);
        this.storeid.next(value);
        //console.log(this.storeid);
    }

    get storeGet() {
        return this.localStorage.get('storeid');
    }
    //VERSION
    setVersion(version: string) {
        this.localStorage.set('version', version);
    }
    getVersion() {
        return this.localStorage.get('version');
    }

    focusFirst() {
        setTimeout(() => {
            $('.modal-dialog .modal-body input[type=text]:first').focus();
        }, 500);
    }

    getBrandIco(brand) {
        if (brand) {
            switch (brand.toLowerCase()) {
                case 'mastercard':
                    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAqFBMVEUAAAD////e3t7e3t7d3d3d3d3g4ODd3d3h4eH09PT8/Pz////9/f3/+/v/trb/cnL/RUX/Ly///vv/6rf/1XP/yEf/wjH/urr/Q0P/JCT/67v/x0T+vib//v7/iYn/JST/dyX/3Ir///7/RyX+kSX/JyT/NyT+OiT+uib/WCX/hyX+OyT/KyT+KyT/tyb/pyb/SCX+WyX/RyT+jCX/qCX/VSX/TiX+cSW5lxLTAAAACXRSTlMAAWXI8/8Zvf5S89/JAAABE0lEQVR4AezBwQHAQAQEwIU9cP3Xm5Qg/8xg5ydqzgU3FbxOcC0OIMGsnoWuZAiUeWfpJhXGmrWiwdmz1nSQ8wH5kEpXaQgCARSF3+mcthW7a/8rs+N+TlhHaX76TxBGcZKmSRyFvp/lRUlIWeSZHVDGbzEqpLolhQXU6vxRo6mgVtsIYH+O+5+FCVDYv3MedUEIHYSMP+pV53F/8AQy00DEnw2VVq6BGMBIB4UGEgDVdTIGUGogBTC5TqYAiBPMlBZxXtJcB6XzphfXydJ50xGA1XWyBpC7X9xGYfqL0z6N7SsQ7z6+Hed7/PiOI5y8zVDUK5GYgSjKorQvNUguyEguKkkujEku7kmtUMipsgiDUQAAvJplFnJhmQ8AAAAASUVORK5CYII='
                case 'visa':
                    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAJFBMVEUAAAB2p85BgbgWZagAVp8QYaX////7qyr8sz39wWH/0478sDgmikj0AAAADHRSTlMANN/8//3///zfNP2G+1OJAAAATUlEQVR4AWMYJoCRgVFJEUP03b0PTAwimOIMQo4MTAz82Az6CJQQwGoDPgnsYJBKsDAoYRUfev4QHA7+ICvBiWCTACXqeGyp/RnDcAEAV1UHEN+u2zMAAAAASUVORK5CYII='
                case 'elo':
                    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADkElEQVR4Ae2QA4xsSRSGN7a5tp/dvGwbd3pt77Ntm8HaNp/fm5lgbXuDtRGs/q3qzO10vdOqHs/ck3yp6lP35PxfH+WUXU455ZRTTlmWdYKVP+9hK1/4Op9rQV+CZ+LZeMYa4Qs/5bIt6MvwjBUluB0Z6KPwrEQgny18018EeFYiwB/6E0Qgm8mzBwv2yanWq9bvyXkikEnn0RXksnk8d+cofHb4dPz82on49fUT8GX7aTh4/3BsXKIin8t1wZ4uFaC8t/dM4KNjKvL9yydj0zK1bwlELr5B+H3zBm9VAZvdd43sWoF0KotmUCauwrmbWmFeObvUu/ziOP79kIQm3L9rHJrd2yUCoYsn4tzNbUWGbDqE0KWTSm+r5qmYOTGIqTeEsGW5Hy8+MaSixNblvq4TSCUzOPK0IX12jlr+WEmAM3TdXiQzLVXnF83U8efbxwsCv795Ai4opCC7nwgkExnIELD//TJ8k9bVnVs0Q8ff7x8rSNy6aQJk9xOBRDxdfCg/RcS+e/oOIfyoJQ8imcw2NH/4gaGCwNvPnwnZ/VSg+JAiQ9X6o5c8IAgo1y5peH7WRINJDMHNGyZg7hQDVi4J2f1EIB5LQobhq58RBMwLb+T9HoMIxFhThhGrnhIEjIsm8n6PQQSi0QRKRDqIUuz+6EX3CQK+65Y2PD8zZGCvNhq3GC4sDqq4NByG7H4iEAnHIYNr8kZBYMSKxxCOphqafUIbg0/855R4mv2W3U8EwqEoZNCtKwQBzvipW+vOLTL9QnjOCsMH2f1EIBSMwIZ/UO3Ose+jFt4rCAxb/SyCkSSd5ydjOQv/gf9cIfyr/qGIBcKQ3U8EgoEwguyBnfwD+y6coY67/VvPXIQhmw4Xww9dvxda9pLS/GrDi7mGH7NNFZt1Fw6rI8g//5FyLqaZqr1Daj8RCLBmM3gvnY4hGw5AKVxT6l1gmiRsJZbqXjS7lwiYRgjNosUs4fdGzVUz+McM/k1ndhIBQw/C0ANlBDn0t3gnJ+ewMrxq+H3s7VpNIXOy+4mAphrQNbMIuUv0TMY6ZTweUUYVwx5gPM7uW1nvSlWpOi+7nwioil584Gcd+Hfk3tPzRMDv09CPqCSgf+vzqugP8KxEQPGpj3s9CvoDPCsRUFX1JK/H/7Pb5QXH4/bZpw3p85O8dfM8z8izEgFbwu3yPcE+/M41wYO+BM/Es5WHd8opp5xyyqn/AWw3olV/2mNdAAAAAElFTkSuQmCC'
                case 'eventfly':
                    return 'https://lh3.googleusercontent.com/o_yfUvPIlOWQ5zZR0ZD4X2IwZSUgqSTp5orb7J1oVzL5tZq2sxffcfMe_XvIgucrLNU=s180-rw'
            }
        }
        return 'img/icon.png'
    }

}

export function datePickerFormatterServiceFactory() {
    return new DatePickerFormatter("DD/MM/YYYY");
};

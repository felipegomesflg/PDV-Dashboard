import { Injectable } from "@angular/core";
import { Http, Response,RequestOptions,Headers,URLSearchParams,ResponseContentType } from "@angular/http";
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { ComumService } from "./comum.service";
import { AcquirerService } from "./acquirer.service";
import * as firebase from 'firebase'; 
import * as FileSaver from 'file-saver';
@Injectable()
export class pdfSenderService {
    constructor(
        private db: AngularFireDatabase,
        private comumService: ComumService, 
        private acquirer:AcquirerService,
        private http: Http){
        
    }

    b64toBlob(b64Data, contentType, sliceSize=undefined) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
      
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
      
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);
      
          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          var byteArray = new Uint8Array(byteNumbers);
      
          byteArrays.push(byteArray);
        }
      
        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }

    salesReport(path,id){
        let creditPayment = [];
        let creditPaymentTotal = 0;
        let creditPaymentList = '';
        let debitPayment = [];
        let debitPaymentTotal = 0;
        let debitPaymentList = '';
        let otherPayment = [];
        let otherPaymentTotal = 0;
        let otherPaymentList = '';
        let totalSale= 0;
        let emailBody ='';
        let prods ='';
        this.comumService.loading = true;
        this.db.list(path.split('/account_detail')[0] + "/event/"+id+"/sale").subscribe(a => {   
            a.forEach(element => {
                this.acquirer.deParaAcquirer(path+'/event/'+id+'/balance_account/billing_contract/',element.brand, element.payment_method);
                totalSale = totalSale + element.sale_total; 
                switch(element.payment_method.toLowerCase()){
                case 'cartão de crédito': creditPayment.push(element);break;
                case 'cartão de débito': debitPayment.push(element);break;
                default : otherPayment.push(element);break;
                }
                    
                prods+= `
                <li>
            		<ul class="body">
                        <li >`+this.comumService.formatTimeStamp(element.created_at)+`</li>
                        <li >`+element.payment_method+`</li>
                        <li >`+element.brand+`</li>
                        <li >`+this.comumService.fMoeda(element.sale_total.toFixed(2))+`</li>
            		</ul>
            	</li>
                `
            });
            creditPayment = this.comumService.distinctSumValues(creditPayment,'brand','sale_total');
            debitPayment = this.comumService.distinctSumValues(debitPayment,'brand','sale_total');
            otherPayment = this.comumService.distinctSumValues(otherPayment,'brand','sale_total');

            creditPayment.forEach(pay => {
                creditPaymentList+= `<li >`+pay.brand+` <span>`+this.comumService.fMoeda(pay.value.toFixed(2));+`</span></li>`
            });
            debitPayment.forEach(pay => {
                debitPaymentList+= `<li >`+pay.brand+` <span>`+this.comumService.fMoeda(pay.value.toFixed(2));+`</span></li>`
            });
            otherPayment.forEach(pay => {
                otherPaymentList+= `<li >`+pay.brand+` <span>`+this.comumService.fMoeda(pay.value.toFixed(2));+`</span></li>`
            });
            creditPaymentTotal = this.comumService.fMoeda(this.comumService.sumValues(creditPayment,'value').toFixed(2));
            debitPaymentTotal = this.comumService.fMoeda(this.comumService.sumValues(debitPayment,'value').toFixed(2));
            otherPaymentTotal = this.comumService.fMoeda(this.comumService.sumValues(otherPayment,'value').toFixed(2));
            
            //this.sumValues(creditPayment,debitPayment,othersPayment);
            totalSale = this.comumService.fMoeda(totalSale.toFixed(2));
            emailBody = `
            <html>
            <meta charset="UTF-8">
            <head>
            <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body{
            color:#333;
            font-size:12px;
            }
            .pannel{
            	width:32%;
            	height:250px;
            	float:left;
            	margin-left:1%;
            	margin-top:20px;
            	margin-bottom:20px;
                border: 1px solid #e7ecf3;
            	border-bottom: 1px solid rgba(0, 0, 0, 0.17);
            	box-shadow: 0 1px 1px rgba(0,0,0,.05);
            }
            .pannel .title{
            	    box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.2);
            		padding:20px;
            }
            .pannel span, .legend span{
            float:right;
            }
            .pannel ul{
				margin-top:10px;
				font-size:10px;
			}
			.pannel ul li{
				width:100%;
			}
            .legend{
            float:left;
            	width:98%;
            	margin-left:1%;
            	margin-bottom:20px;
                border: 1px solid #e7ecf3;
            	border-bottom: 1px solid rgba(0, 0, 0, 0.17);
            	box-shadow: 0 1px 1px rgba(0,0,0,.05);
            	padding:20px;
            }
            
            .sale{
            	float:left;
            	width:32%;
            	margin-left:1%;
            	margin-bottom:10px;
            	text-align:center;
            	padding:10px;
            }
            .sale h4{
            	font-weight:normal;
            	font-size:1em;
            	margin-bottom:10px;
            	text-transform:uppercase;
            }
            .sale h2{
            	font-size:20px;
            	font-weight:bold;
            }
            ul{
            margin:0;
            padding:0;}
            	ul li{
            	list-style:none;
            	}
            	
            	ul{
            		width:98%;
            		display:table;
            		margin-left:1%;
            	}
            	ul.header{
            		border-left:1px solid #ddd;
            		font-weight:bold;
            	}
            	ul li{
            		float:left;
            		padding:10px;
            		padding-left:20px;
            		
            	}
            	ul.header li{
            		border:1px solid #ddd;
            		border-left:0;
            		color:#333;
            	}
            	
            	.prods>li{width:100%; padding:0;border-bottom:1px solid #ddd; color:#666;font-size:10px;}
            	.prods>li:nth-child(even) {background: #fefefe; }
            	
            	ul.header li:nth-of-type(1),ul.body li:nth-of-type(1){width:25%;}
            	ul.header li:nth-of-type(2),ul.body li:nth-of-type(2){width:25%;}
            	ul.header li:nth-of-type(3),ul.body li:nth-of-type(3){width:25%;}
            	ul.header li:nth-of-type(4),ul.body li:nth-of-type(4){width:25%;}
            </style>
            </head>
            <body>
            	<div class="pannel">
            		<div class="title">
            			Crédito
            			<span> R$ `+creditPaymentTotal+`</span>
            		</div>
                    <div class="body">
                    <ul>
                       `+creditPaymentList+`
                    </ul>
            		</div>
            	</div>
            	<div class="pannel">
            		<div class="title">
            			Débito
            			<span> R$ `+debitPaymentTotal+`</span>
            		</div>
                    <div class="body">
                    <ul>
                       `+debitPaymentList+`
                    </ul>
            		</div>
            	</div>
            	<div class="pannel">
            		<div class="title">
            			Outros
            			<span> R$ `+otherPaymentTotal+`</span>
            		</div>
                    <div class="body">
                    <ul>
                       `+otherPaymentList+`
                    </ul>
            		</div>
            	</div>
            	<div class="legend">
            		Total Vendido
            		<span> R$ `+totalSale+`</span>
            	</div>
            	
                <ul class="header">
	
                    <li >Data</li>
                    <li >Forma Pgto.</li>
                    <li> Bandeira</li>
                    <li >Valor Total</li>
            
                </ul>	
            	<ul class="prods">
            	
            	`+prods+`
            	    
            	</ul>
            	
            	
            				
            </body>
            </html>
            `
            
            // let headers = new Headers();
            // headers.append('Access-Control-Allow-Methods', '*');
            // headers.append('Content-Type','application/x-www-form-urlencoded');
            // headers.append('responseType','arraybuffer')
            // let body = new URLSearchParams();
            // body.set('content',emailBody);
            // body.set('header_title','Pagalee - Relatório de Vendas');
            // body.set('period','10/01/2018');
            // // var body = {
            // //     "content":emailBody.toString(),
            // //     "filename":"Pagalee - Relatório de Vendas"
            // // }
            // let options = new RequestOptions({ headers: headers });
            // this.http
            // .post('http://10.0.0.150:3000/pdf/report/pagalee/eventreport',body, options)  
            // .subscribe(res => {
            //     console.log(res['_body']);
            //     var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(res['_body'])));
            //     console.log(base64String);
            //     var file = new Blob([base64String], {type: 'application/pdf'});
            //     FileSaver.saveAs(file, 'texte.pdf');
    
            //     //this.downloadFile(res['_body']);
            //     this.comumService.loading = false;
            // },error=>{
            //     console.log(error);
            //     this.comumService.loading = false;
            // });
        });
    }

    downloadFile(data){
        var blob = new Blob([data.blob()], { type: 'application/pdf' });
        FileSaver.saveAs(blob, 'texte.pdf');
        
      }
}
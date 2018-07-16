import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database";
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AcquirerService {

  constructor(private db: AngularFireDatabase){}
  public deParaAcquirer(path,brand,payment){
    this.db.list(path,{
                query:{
                  orderByChild:'active',
                  equalTo:true
                }
            }).subscribe(a => {   
                Object.keys(a[0].billing_acquirer_agreement.payment_fee).map((key, index) => {
                    //if(index[key].payment_brand.name == brand && index[key].payment_method.name)
                });
            });
  }
 
}

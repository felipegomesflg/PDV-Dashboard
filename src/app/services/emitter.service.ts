import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class EmitterService {

  constructor(){}

  private subject = new Subject<any>();

     sendMessage(message: any) {
         this.subject.next(message);
     }

     sendObjDataTable(message: any) {
        this.subject.next(message);
    }

    getObjDataTable(): Observable<any> {
      return this.subject.asObservable();
    }

     clearMessage() {
         this.subject.next();
     }

     getMessage(): Observable<any> {
         return this.subject.asObservable();
     }

}

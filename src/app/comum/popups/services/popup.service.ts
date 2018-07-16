import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { AlertCallback } from '../alert-callback';
import { ConfirmCallback } from '../confirm-callback';

@Injectable()
export class PopupService {

    private alertSource = new Subject<String>();
    alert$ = this.alertSource.asObservable();
    alertCallback: AlertCallback;

    private confirmSource = new Subject<String>();
    confirm$ = this.confirmSource.asObservable();
    confirmCallback: ConfirmCallback;

    
    confirm(message: string): ConfirmCallback {
        console.log(this.confirmSource);
        this.confirmSource.next(message);
        console.log(this.confirmSource);
        this.confirmCallback = new ConfirmCallback();
        return this.confirmCallback;
    }

    
    alert(message: string): AlertCallback {
        this.alertSource.next(message);
        this.alertCallback = new AlertCallback();
        return this.alertCallback;
    }

}
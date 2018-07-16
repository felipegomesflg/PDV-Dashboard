import { Component, ViewChild } from '@angular/core';
import { PopupService } from '../services/popup.service';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { Subject } from 'rxjs/Subject';
import { Observable } from "rxjs/Observable";
import { AlertCallback } from '../alert-callback';

@Component({
    selector: 'popup',
    templateUrl: './popup.component.html'
})
export class PopupComponent {

    @ViewChild('modal') public modal: ModalDirective;
    private message: string;
    private subscribedToClosing: boolean = false;
    private isConfirm: boolean = false;
    private confirmed: boolean = false;

    constructor(
        private popupService: PopupService
    ) {
        
        popupService.alert$.subscribe((message: string) => {
            this.isConfirm = false;
            this.message = message;
            this.modal.show();
            this.handleClose();
        });

        popupService.confirm$.subscribe((message: string) => {
            console.log(message);
            this.isConfirm = true;
            this.message = message;
            this.modal.show();
            this.handleClose();
        });

    }

    private handleClose() {
        if (!this.subscribedToClosing) {
            this.modal.onHidden.subscribe(() => {
                this.subscribedToClosing = true;
                if (this.isConfirm) {
                    if (this.confirmed) {
                        this.popupService.confirmCallback._ok();
                    } else {
                        this.popupService.confirmCallback._cancel();
                        this.confirmed = false;
                    }
                } else {
                    this.popupService.alertCallback._ok();
                }
            });
        }
    }

    private ok(): void {
        this.confirmed = true;
        this.modal.hide();
    }

    private cancel(): void {
        this.confirmed = false;
        this.modal.hide();
    }

}
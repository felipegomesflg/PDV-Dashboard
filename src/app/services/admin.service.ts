import { CanActivate, Router } from '@angular/router';
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { LocalStorageService } from 'angular-2-local-storage';

@Injectable()
export class AdminGuard implements CanActivate {
    private pathArray: any;

    constructor(private localStorage: LocalStorageService, private router: Router) {
        this.pathArray = this.localStorage.get("pathArray");
    }

    canActivate(): Observable<boolean> | boolean {
        if (this.pathArray[0].account_type.id <= 2)
            return true;
        else{
            this.router.navigate(['/']);
            return false;
        }
    }
}
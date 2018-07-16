import { Injectable } from "@angular/core";

import * as firebase from 'firebase'; 

@Injectable()
export class StorageService {
    private basePath:string = '/uploads';
    private uploadTask: firebase.storage.UploadTask;
    constructor(){

    }

}
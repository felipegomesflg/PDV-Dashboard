import { Router } from '@angular/router';
import { Component, OnInit,ViewContainerRef } from '@angular/core';
import {AuthGuard} from './../../services/auth.service';
import {AngularFireAuth } from 'angularfire2/auth';
import { LocalStorageService } from 'angular-2-local-storage'
import { isDev,version } from "../../app.environment";

import {ComumService} from '../../services/comum.service'
import { DataService } from "./../../services/data.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email:string;
  password:string;
  private version:any;
  private denied:string = '';
  private loaderBtn:string = '';
  private forgot:boolean = false; 
  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private authService:AuthGuard,
    private comum:ComumService,
    private dataService: DataService,
    private localStorage:LocalStorageService
  ) {
    this.version = localStorage.get('version');
  }

  loginEmail() {
    if(this.validateFields()){
      this.authService.loginEmail(this.email, this.password);
      this.loaderBtn = 'loaderBtn';
    }
  }

  ngOnInit() {
    this.auth.authState.subscribe(auth=>{
      if(auth)
        this.router.navigate([ '/' ]);
    })
    this.authService.loginFailure.subscribe(
         show =>  {

           this.denied="shake";
               setTimeout(()=>{
              this.denied = '';
              this.loaderBtn = '';
          }, 500);
           //this.comum.alertError('Usuário e/ou senha incorretos!','Erro!')
         }
       )

  }

  forgotPass(){
    this.forgot = true;
  }

  backLogin(){
    this.forgot = false;
  } 

  sendLoginReset(){
    this.comum.loading = true;
    let sendData={
      email:this.email
    }
    
    if(this.validateFields('reset'))
        this.dataService.addEntity(sendData, `v1/accounts/sendrefreshpassword`)
        .subscribe(val => {
          this.comum.loading = false;
          this.comum.alertWarning('Foi enviado um link de recuperação de senha para o seu e-mail!' ,'Recuperação de acesso', 5000);
          this.password = '';
          this.backLogin();
        },
        Error=>{
          this.comum.loading = false;
          this.comum.alertError(`Por favor, verifique se o e-mail ${this.email} é o e-mail que você cadastradou no sistema`  ,'Erro ao Recuperar a senha')
        });
  }

  validateFields(val = null){
    if((val && !this.email)|| (!val && (!this.email || !this.password))){
      this.denied="shake";
               setTimeout(()=>{
              this.denied = '';
          }, 500);
      return false;
    }else{
      return true;
    }
  }

}

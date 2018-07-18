import { Component, OnInit, Input,ElementRef } from '@angular/core';
import { LocalStorageService } from "angular-2-local-storage";
import { ComumService } from '../services/comum.service';
import { Router } from '@angular/router';


import { AuthGuard } from '../services/auth.service';
import * as $ from 'jquery';

@Component({
    selector: 'app-menu',
    template: `
  <nav id="mainnav-container"  class="no-padding z-index-15"  [ngClass]="{'adjustment-sm' : this.comum.isMenu}" >
    <div id="mainnav">
    <a class="mainnav-toggle hand" (click)="toggleMenu()">
        <i class="demo-pli-view-list"></i>
    </a>
        <div id="mainnav-menu-wrap">
            <div class="nano">
                <div class="nano-content">
                    <div *ngIf="currentAcc">
                        <div id="mainnav-profile" class="mainnav-profile"  >
                            <div class="profile-wrap hand" (click)="openUserData()">
                                <div class="pad-btm">
                                    <img class="img-circle img-sm img-border" [src]="displayImage" alt="Profile Picture">
                                </div>
                                <a href="#profile-nav" class="box-block" data-toggle="collapse" aria-expanded="false">        
                                    <p class="mnp-name">{{displayName}}</p>
                                    <span class="pull-right dropdown-toggle" >
                                        <i class="dropdown-caret"></i>
                                    </span>
                                    <span class="mnp-desc" *ngIf="userType">{{userType.name}}</span>
                                </a>
                                
                                
                            </div>
                            <div id="profile-nav" class="collapse list-group bg-trans">
                                    <a class="list-group-item" (click)="logout()">
                                        <i class="demo-pli-unlock icon-lg icon-fw"></i> Logout
                                    </a>
                                </div>                            
                        </div>
                        <ul id="mainnav-menu" class="list-group">
                            <li *ngFor="let p of pages" routerLinkActive="active-link">
                                <a *ngIf="p.routerLink" [routerLink]="p.routerLink">
                                    <span class="menu-title">
                                        <strong>{{p.name}}</strong>
                                    </span> 
                                </a>
                                <hr *ngIf="!p.routerLink" class="list-divider">
                            </li>
                        </ul> 
                    </div>
                    <div *ngIf="!currentAcc" class="profile-loader"> 
                        
                    </div>
                    <ul class="list-group">
                        <li class="footer-icon animate">
                            <img src="img/icon.png" alt="Pagalee" class="brand-icon">
                            <div class="inline-flex">
                                <small>
                                    <a href="https://www.pagalee.com" target="_blank">Pagalee.com</a> v{{version}} <span class="red">&hearts;</span>
                                    <br>
                                    Copyright
                                    <br>
                                    &#0169; Todos os direitos reservados
                                </small>
                            </div>
                        </li>
                    </ul>
                    <div >
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>

  `,
  host: {
    '(document:click)': 'handleClick($event)',
},
})
export class MenuComponent implements OnInit {
    pages: any = []
    lang:any;
    constructor(private authService: AuthGuard, private localStorage: LocalStorageService, private comum: ComumService, private router: Router, myElement: ElementRef) {
        this.elementRef = myElement;
        
    }
    @Input('resource') resource: any;
    @Input('userType') userType: any;
    @Input('displayImage') displayImage: any;
    @Input('displayName') displayName: any;
    @Input('displayEmail') displayEmail: any;
    private accList: Array<any> = [];
    private path: any;
    private pathArray: any;
    private currentAcc: any;
    navOfset: any;
    
    private version: any;
    public elementRef;

    ngOnInit() {        
        this.currentAcc = [];
        this.path = this.localStorage.get('path');

        this.comum.path.subscribe(val => {
            this.loadAccList(val);
        })

        this.comum.pathArray.subscribe(val => {
            this.loadAccList();
        })

        if (this.path) {
            this.loadAccList(this.path);
        }

        if (!this.comum.getVersion()) {
            this.comum.path.subscribe(path => {
                this.loadVersion();
            });
        }
        else
            this.version = this.comum.getVersion();

        $(".list-group li").width($('.list-group').width() - 20);

        this.comum.displayImage.subscribe(val => {
            this.displayImage = val;
        })
    }

    loadAccList(val = null) {
        this.accList = [];
        this.pathArray = this.localStorage.get('pathArray');
        this.pathArray.forEach(p => {
            this.accList.push({ id: p.firebase_path, trade_name: p.trade_name, display_image: p.display_image });
            if (val && p.firebase_path == val) 
                this.currentAcc = p;
        });
    }

    handleClick(event){
        var clickedComponent = event.target;
        var inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if(inside){
        }else{
            this.outsideClick();
        }
    }
    loadVersion() {
        this.version = this.comum.getVersion();
    }

    ngAfterViewInit() {
        this.navOfset = $('.footer-icon').offset().top;
        this.stickedMenu();

        $(window).scroll(() => {
            this.stickedMenu();
        });
        $(window).resize(() => {
            $('.footer-icon').removeClass('fixed');
            this.navOfset = $('.footer-icon').offset().top;
            this.stickedMenu();
        })
    }

    outsideClick() { // capturando click fora deste componente e fechando menu em dispositivos mobile
        if (screen.width < 767) {
            if ($("#mainnav-container").hasClass('adjustment-sm') && this.comum.isMenu)
                this.toggleMenu();
        }
    }

    toggleMenu() {
        this.comum.toggleMenu();
    }

    ngOnChanges() {//para pegar mudanças das lojas
        //1- administrador
        //2 - Operador do Pagalee
        //3 - Dono do Contrato
        //4 - Gerente do Contrato
        //5 - Dono de Loja
        let menu = this.resource;
        this.pages = [];
        for (var i in menu) {
            if (menu[i].role.indexOf(this.userType.id) > -1)
                this.pages.push(menu[i]);
        }
    } 
    logout() {
        this.authService.logout();
    }

   

    stickedMenu() {
        var scroll_top = $(window).scrollTop() + $(window).height() - 80;  //top do scroll + tamanho de tela - tamanho do icone
        if (scroll_top > this.navOfset)
            $('.footer-icon').addClass('fixed');
        else
            $('.footer-icon').removeClass('fixed');

    }

    openUserData() {
        this.router.navigate(['/profiles']);
    }



}

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
        <div id="mainnav-menu-wrap">
            <div class="nano">
                <div class="nano-content">
                    <div *ngIf="currentAcc">
                        <div id="mainnav-profile" class="mainnav-profile"  >
                            <div class="profile-wrap hand" (click)="openUserData()">
                                <div class="pad-btm">
                                    <img class="img-circle img-sm img-border" [src]="displayImage" alt="Profile Picture">
                                </div>
                                <!--<a href="#profile-nav" class="box-block" data-toggle="collapse" aria-expanded="false">
                                    <span class="pull-right dropdown-toggle" >
                                                    <i class="dropdown-caret"></i>
                                                </span>
                                                -->
                                    <p class="mnp-name">{{displayName}}</p>
                                    <span class="mnp-desc" *ngIf="userType">{{userType.name}}</span>
                                <!--</a>-->
                                
                                
                            </div>
                            <div class="contract">
                                    <h4><small>Contrato Atual</small></h4>
                                    <span (click)="toggleChangeAcc()" title="Selecionar outro Contrato">
                                    {{currentAcc.trade_name}}
                                    <i class="fa fa-chevron-right right"></i>
                                    </span>
                                </div>
                            <!--
                            <div id="profile-nav" class="collapse list-group bg-trans">
                                
                                <a href="#" class="list-group-item">
                                    <i class="demo-pli-male icon-lg icon-fw"></i> View Profile
                                </a>
                                <a href="#" class="list-group-item">
                                    <i class="demo-pli-gear icon-lg icon-fw"></i> Settings
                                </a>
                                <a href="#" class="list-group-item">
                                    <i class="demo-pli-information icon-lg icon-fw"></i> Help
                                </a>
                                <a class="list-group-item" (click)="logout()">
                                    <i class="demo-pli-unlock icon-lg icon-fw"></i> Logout
                                </a>
                            </div>
                            -->
                        </div>
                        <ul id="mainnav-menu" class="list-group">
                            <li *ngFor="let p of pages" routerLinkActive="active-link" [ngClass]="{'list-header':!p.routerLink}">
                                <span *ngIf="!p.routerLink" class="text-uppercase text-10">{{p.label}}</span>
                                <a *ngIf="p.routerLink" [routerLink]="p.routerLink">
                                    <i [ngClass]="p.icon"></i>
                                    <span class="menu-title" (click)="toggleMenu();menuFlag = !menuFlag;">
                                        <strong>{{p.label}}</strong>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div *ngIf="!currentAcc" class="profile-loader">
                        
                    </div>
                    <ul class="list-group">
                        <li class="list-divider"></li>
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
<div class="contract-mobile visible-xs" (click)="toggleChangeAcc()">
<img class="img-logo padding-5" src="{{currentAcc.display_image}}">
    <span  title="Selecionar outro Contrato">
    
    {{currentAcc.trade_name}}
    <i class="fa fa-chevron-down right"></i>
    </span>
</div>
<aside id="aside-container" class="aside-left" [ngClass]="{'toggle':toggleAcc}">
    <div class="row">
        <a class="close-btn hand  right " (click)="toggleChangeAcc()"><i class="fa fa-close"></i></a>
    </div>
    
    <ul>
        <li *ngFor="let p of accList">
            <a (click)="changeAcc(p.id)">
                <span class="">
                <img class="img-logo padding-5" src="{{p.display_image}}">
                </span> {{p.trade_name}}
            </a>
        </li>
    </ul>
</aside>

  `,
  host: {
    '(document:click)': 'handleClick($event)',
},
})
export class MenuComponent implements OnInit {
    pages: any = []
    constructor(private authService: AuthGuard, private localStorage: LocalStorageService, private comum: ComumService, private router: Router, myElement: ElementRef) {
        this.elementRef = myElement;
    }

    @Input('userType') userType: any;
    @Input('displayImage') displayImage: any;
    @Input('displayName') displayName: any;
    @Input('displayEmail') displayEmail: any;
    private accList: Array<any> = [];
    private path: any;
    private pathArray: any;
    private currentAcc: any;
    private toggleAcc: boolean = false;
    navOfset: any;
    private menuFlag: boolean = false;
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
        this.menuFlag = !this.menuFlag;
        if ($("#mainnav-container").hasClass('adjustment-sm') && this.comum.isMenu && !this.menuFlag)
            this.toggleMenu();
    }

    toggleMenu() {
        if (screen.width < 767) {
            this.comum.toggleMenu();
            this.comum.toggleMenuSm();
        }
    }

    ngOnChanges() {//para pegar mudanças das lojas
        //1- administrador
        //2 - Operador do Pagalee
        //3 - Dono do Contrato
        //4 - Gerente do Contrato
        //5 - Dono de Loja

        let menu = [
            { label: 'Gerencial', role: "1" },
            { label: 'Contratos', routerLink: '/account/', icon: 'fa fa-handshake-o', role: "1" },
            { label: 'Adquirentes', routerLink: '/acquirer/', icon: 'glyphicon glyphicon-tasks', role: "1" },
            { label: 'Logs', routerLink: '/logs/', icon: 'fa fa-history', role: "1" },
            { label: 'Administrativo', role: "1,2,3,4,5" },
            //{ label: 'Resumo', routerLink: '/resume/', icon: 'fa fa-area-chart',role:"1,3,4,5"},
            { label: 'Resumo Financeiro', routerLink: '/sales/', icon: 'fa fa-dollar', role: "1,2,3,4,5" },
            //{ label: 'Pagamentos', routerLink: '/payments/', icon: 'fa fa-dollar',role:"1,3,4,5"},
            { label: 'Cadastros', role: "1,2,3,4,5" },
            { label: 'Usuários', routerLink: '/users/', icon: 'fa fa-user-circle', role: "1" },
            { label: 'Lojas', routerLink: '/store/', icon: 'fa fa-home', role: "1" },
            { label: 'Eventos', routerLink: '/events/', icon: 'fa fa-beer', role: "1,2,3,4,5" },
            { label: 'Categorias & Produtos', routerLink: '/products/', icon: 'fa fa-cube', role: "1,2,3,4,5" },
            //{ label: 'Promoções', routerLink: '/event-sales/', icon: 'fa fa-money',role:"1,3,4,5"}
        ];
        this.pages = [];
        for (var i in menu) {
            if (menu[i].role.indexOf(this.userType.id) > -1)
                this.pages.push(menu[i]);
        }
    }
    logout() {
        this.authService.logout();
    }

    toggleChangeAcc() {
        this.toggleAcc = !this.toggleAcc;
    }

    changeAcc(acc) {
        this.comum.pathGet = acc;
        this.toggleAcc = false;
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

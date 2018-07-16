import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-campo-control-erro',  
  styles:['.errorDiv {margin-bottom: 0px;}'],
  template: `
              <div *ngIf="mostrarErro">
              <span class="glyphicon glyphicon-remove form-control-feedback"></span>
              <span class="sr-only">(error)</span>
              <div class="alert alert-danger errorDiv" role="alert">
                {{ msgErro }}
              </div>
            </div>
  `
})
export class CampoControlErroComponent implements OnInit {

  @Input() msgErro: string;
  @Input() mostrarErro: boolean;  

  constructor() { }

  ngOnInit() { }

}

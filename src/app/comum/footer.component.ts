import { Component, OnInit } from '@angular/core';

import { LocalStorageService } from 'angular-2-local-storage'
import { ComumService } from '../services/comum.service';

@Component({
  selector: 'app-footer',
  template: `
  <footer id="footer">
    <p class="pad-lft">&#0169; 2018 pagalee.com <span>v{{version}}</span></p>    
  </footer>
  `
})
export class FooterComponent implements OnInit {

  private version: any;
  constructor(private localStorage: LocalStorageService, private comumService: ComumService) {
    if (!this.comumService.getVersion()) {
      this.comumService.path.subscribe(path => {
        this.loadData();
      });
    }
    else
      this.version = this.comumService.getVersion();
  }

  ngOnInit() {
  }

  loadData() {
    this.version = this.comumService.getVersion();
  }

}

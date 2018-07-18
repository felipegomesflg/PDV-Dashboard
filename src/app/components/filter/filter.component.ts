import { Component, OnInit,Input,Output,EventEmitter,ElementRef } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  host: {
    '(document:click)': 'handleClick($event)',
},
})
export class FilterComponent implements OnInit {

  @Input() data;
  @Input() value;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();
  
  selectedValue:any='';
  openFilter:boolean=false;
  public elementRef;
  constructor(myElement: ElementRef) { 
    this.elementRef = myElement;
  }

  ngOnInit() {
    this.getSelected();
  }
  toggleFilter(){
    this.openFilter= !this.openFilter;
  }

  selectFilter(id){
    this.value = id;
    this.getSelected();
    this.openFilter = false;
  }

  getSelected(){
    for(var i in this.data){
      if(this.data[i].id==this.value){
        this.valueChanged.emit(this.data[i]);
        if(this.data[i].text)
          this.selectedValue = this.data[i].text
        else
          this.selectedValue = this.data[i].name
      }
    }
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
    if(event.target.attributes.id && event.target.attributes.id.nodeValue == 'pipeFilter-selected'){
      this.openFilter = true;
    }else
      if(!inside && this.openFilter){
        this.openFilter = false;
      }
    
}

}

import { Component, OnInit,Input } from "@angular/core";
import { ComumService } from "../../../services/comum.service";

@Component({
  selector: "app-personal-information",
  templateUrl: "./personal-information.component.html"
})
export class PersonalInformationComponent implements OnInit {

  @Input('profileData')profileData:any; 

  constructor(private comumService: ComumService) { }

  ngOnInit() {}


}
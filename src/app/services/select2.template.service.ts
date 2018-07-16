import { Injectable } from "@angular/core";
import { Select2TemplateFunction, Select2OptionData } from "ng2-select2";

@Injectable()
export class Select2TemplateService {

    constructor(){}

    //region [function for result template]
    public templateResult: Select2TemplateFunction = (state: Select2OptionData): JQuery | string => {
        if (!state.id) {
            return state.text;
        }

        let image = '<span class="image"></span>';

        if (state.additional.display_image) {
        image = '<span class="image"><img width="40" src="' + state.additional.display_image + '"</span>';
        }

        return jQuery('<span>' + image + ' ' + state.text + '</span>');
        // return jQuery('<span><b>' + state.text + '.</b> ' + image + ' ' + state.text + '</span>');
    }

    // function for selection template
    public templateSelection: Select2TemplateFunction = (state: Select2OptionData): JQuery | string => {
        if (!state.id) {
            return state.text;
        }

        return jQuery('<span>' + state.text + '</span>');
        // return jQuery('<span><b>' + state.text + '.</b> ' + state.text + '</span>');
    }
    //endregion

}

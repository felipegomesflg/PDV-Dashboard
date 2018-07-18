import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string=''): any[] {
    if(!items) return [];
    if(!searchText) return [];
searchText = searchText.toLowerCase();
return items.filter( it => {
    if(it.text)
      return it.text.toLowerCase().includes(searchText.toLocaleLowerCase());
    else
      return it.name.toLowerCase().includes(searchText.toLocaleLowerCase());
    });
   }
}
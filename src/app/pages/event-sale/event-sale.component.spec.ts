import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSaleComponent } from './event-sale.component';

describe('EventSaleComponent', () => {
  let component: EventSaleComponent;
  let fixture: ComponentFixture<EventSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsCalendarComponent } from './payments-calendar.component';

describe('PaymentsCalendarComponent', () => {
  let component: PaymentsCalendarComponent;
  let fixture: ComponentFixture<PaymentsCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentsCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

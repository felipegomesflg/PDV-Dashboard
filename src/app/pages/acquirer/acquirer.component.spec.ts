import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcquirerComponent } from './acquirer.component';

describe('AcquirerComponent', () => {
  let component: AcquirerComponent;
  let fixture: ComponentFixture<AcquirerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcquirerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcquirerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

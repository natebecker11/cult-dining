import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelResultModalComponent } from './wheel-result-modal.component';

describe('WheelResultModalComponent', () => {
  let component: WheelResultModalComponent;
  let fixture: ComponentFixture<WheelResultModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WheelResultModalComponent]
    });
    fixture = TestBed.createComponent(WheelResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

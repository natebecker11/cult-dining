import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCountriesComponent } from './manage-countries.component';

describe('ManageCountriesComponent', () => {
  let component: ManageCountriesComponent;
  let fixture: ComponentFixture<ManageCountriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageCountriesComponent]
    });
    fixture = TestBed.createComponent(ManageCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsInfoComponent } from './terms-info.component';

describe('TermsInfoComponent', () => {
  let component: TermsInfoComponent;
  let fixture: ComponentFixture<TermsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

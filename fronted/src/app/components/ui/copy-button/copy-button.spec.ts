import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyButton } from './copy-button';

describe('CopyButton', () => {
  let component: CopyButton;
  let fixture: ComponentFixture<CopyButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputBox } from './output-box';

describe('OutputBox', () => {
  let component: OutputBox;
  let fixture: ComponentFixture<OutputBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

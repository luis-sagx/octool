import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBox } from './input-box';

describe('InputBox', () => {
  let component: InputBox;
  let fixture: ComponentFixture<InputBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputBox],
    }).compileComponents();

    fixture = TestBed.createComponent(InputBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

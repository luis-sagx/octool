import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCaseTool } from './text-case-tool';

describe('TextCaseTool', () => {
  let component: TextCaseTool;
  let fixture: ComponentFixture<TextCaseTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextCaseTool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextCaseTool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

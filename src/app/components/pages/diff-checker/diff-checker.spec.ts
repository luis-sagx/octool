import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffChecker } from './diff-checker';

describe('DiffChecker', () => {
  let component: DiffChecker;
  let fixture: ComponentFixture<DiffChecker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiffChecker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiffChecker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCount } from './word-count';

describe('WordCount', () => {
  let component: WordCount;
  let fixture: ComponentFixture<WordCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

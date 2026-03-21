import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Base64Tool } from './base64-tool';

describe('Base64Tool', () => {
  let component: Base64Tool;
  let fixture: ComponentFixture<Base64Tool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Base64Tool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Base64Tool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

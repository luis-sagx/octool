import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonGenerator } from './json-generator';

describe('JsonGenerator', () => {
  let component: JsonGenerator;
  let fixture: ComponentFixture<JsonGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

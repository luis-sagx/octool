import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'speed';

interface UnitDefinition {
  name: string;
  symbol: string;
  toBase: number;
}

interface UnitMap {
  [key: string]: UnitDefinition;
}

const UNIT_DEFINITIONS: { [key in UnitCategory]: UnitMap } = {
  length: {
    mm: { name: 'Millimeter', symbol: 'mm', toBase: 0.001 },
    cm: { name: 'Centimeter', symbol: 'cm', toBase: 0.01 },
    m: { name: 'Meter', symbol: 'm', toBase: 1 },
    km: { name: 'Kilometer', symbol: 'km', toBase: 1000 },
    in: { name: 'Inch', symbol: 'in', toBase: 0.0254 },
    ft: { name: 'Foot', symbol: 'ft', toBase: 0.3048 },
    yd: { name: 'Yard', symbol: 'yd', toBase: 0.9144 },
    mi: { name: 'Mile', symbol: 'mi', toBase: 1609.344 },
  },
  weight: {
    mg: { name: 'Milligram', symbol: 'mg', toBase: 0.000001 },
    g: { name: 'Gram', symbol: 'g', toBase: 0.001 },
    kg: { name: 'Kilogram', symbol: 'kg', toBase: 1 },
    lb: { name: 'Pound', symbol: 'lb', toBase: 0.453592 },
    oz: { name: 'Ounce', symbol: 'oz', toBase: 0.0283495 },
    ton: { name: 'Metric Ton', symbol: 't', toBase: 1000 },
  },
  temperature: {
    celsius: { name: 'Celsius', symbol: '°C', toBase: 1 },
    fahrenheit: { name: 'Fahrenheit', symbol: '°F', toBase: 1 },
    kelvin: { name: 'Kelvin', symbol: 'K', toBase: 1 },
  },
  volume: {
    ml: { name: 'Milliliter', symbol: 'mL', toBase: 0.001 },
    l: { name: 'Liter', symbol: 'L', toBase: 1 },
    floz: { name: 'Fluid Ounce', symbol: 'fl oz', toBase: 0.0295735 },
    cup: { name: 'Cup', symbol: 'cup', toBase: 0.236588 },
    pint: { name: 'Pint', symbol: 'pt', toBase: 0.473176 },
    gallon: { name: 'Gallon (US)', symbol: 'gal', toBase: 3.78541 },
  },
  speed: {
    ms: { name: 'Meters/second', symbol: 'm/s', toBase: 1 },
    kmh: { name: 'Kilometers/hour', symbol: 'km/h', toBase: 0.277778 },
    mph: { name: 'Miles/hour', symbol: 'mph', toBase: 0.44704 },
    knot: { name: 'Knot', symbol: 'kn', toBase: 0.514444 },
  },
};

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './unit-converter.html',
  styleUrl: './unit-converter.css',
})
export class UnitConverter implements OnInit {
  category = signal<UnitCategory>('length');
  fromUnit = signal('cm');
  toUnit = signal('in');
  amount = signal(1);
  decimals = signal(2);
  
  // Track if initial load is done to prevent recalc on setCategory
  private initialLoad = false;

  result = signal(0);

  unitOptions = computed(() => {
    const cat = this.category();
    return UNIT_DEFINITIONS[cat] ?? {};
  });

  categories = [
    { key: 'length', name: 'Length' },
    { key: 'weight', name: 'Weight' },
    { key: 'temperature', name: 'Temperature' },
    { key: 'volume', name: 'Volume' },
    { key: 'speed', name: 'Speed' },
  ];

  ngOnInit(): void {
    this.initialLoad = true;
    this.calculate();
  }

  setCategory(cat: UnitCategory): void {
    this.category.set(cat);
    
    // Set meaningful from/to that match the result
    // Default: cm -> in (length), g -> lb (weight), C -> F (temp), ml -> cup (volume), km/h -> mph (speed)
    if (cat === 'length') {
      this.fromUnit.set('cm');
      this.toUnit.set('in');
    } else if (cat === 'weight') {
      this.fromUnit.set('g');
      this.toUnit.set('lb');
    } else if (cat === 'temperature') {
      this.fromUnit.set('celsius');
      this.toUnit.set('fahrenheit');
    } else if (cat === 'volume') {
      this.fromUnit.set('ml');
      this.toUnit.set('cup');
    } else if (cat === 'speed') {
      this.fromUnit.set('kmh');
      this.toUnit.set('mph');
    }
    
    this.calculate();
  }

  onFromUnitChange(unit: string): void {
    this.fromUnit.set(unit);
    this.calculate();
  }

  onToUnitChange(unit: string): void {
    this.toUnit.set(unit);
    this.calculate();
  }

  onAmountChange(value: number): void {
    this.amount.set(value);
    this.calculate();
  }

  onDecimalsChange(value: number): void {
    this.decimals.set(value);
    this.calculate();
  }

  calculate(): void {
    const amount = this.amount();
    const from = this.fromUnit();
    const to = this.toUnit();
    const cat = this.category();

    if (amount === 0) {
      this.result.set(0);
      return;
    }

    if (cat === 'temperature') {
      const converted = this.convertTemperature(amount, from, to);
      this.result.set(converted);
      return;
    }

    const fromDef = UNIT_DEFINITIONS[cat]?.[from];
    const toDef = UNIT_DEFINITIONS[cat]?.[to];

    if (!fromDef || !toDef) {
      this.result.set(0);
      return;
    }

    const baseValue = amount * fromDef.toBase;
    const converted = baseValue / toDef.toBase;
    this.result.set(converted);
  }

  private convertTemperature(value: number, from: string, to: string): number {
    let celsius: number;

    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * (5 / 9);
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    let result: number;
    switch (to) {
      case 'celsius':
        result = celsius;
        break;
      case 'fahrenheit':
        result = celsius * (9 / 5) + 32;
        break;
      case 'kelvin':
        result = celsius + 273.15;
        break;
      default:
        result = celsius;
    }

    return result;
  }

  swap(): void {
    const from = this.fromUnit();
    const to = this.toUnit();
    this.fromUnit.set(to);
    this.toUnit.set(from);
    this.calculate();
  }

  getDecimals(): string {
    const d = this.decimals();
    return `1.${d}-${d}`;
  }
}
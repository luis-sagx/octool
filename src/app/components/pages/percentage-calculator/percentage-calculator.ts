import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type CalcMode = 'percent-of' | 'what-percent' | 'change';

@Component({
  selector: 'app-percentage-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './percentage-calculator.html',
  styleUrl: './percentage-calculator.css',
})
export class PercentageCalculator {
  mode = signal<CalcMode>('percent-of');
  x = signal(0);
  y = signal(0);

  result = computed(() => {
    const xVal = this.x();
    const yVal = this.y();

    if (!yVal && this.mode() !== 'change') return 0;

    switch (this.mode()) {
      case 'percent-of':
        return (xVal / 100) * yVal;
      case 'what-percent':
        return yVal > 0 ? (xVal / yVal) * 100 : 0;
      case 'change':
        if (!xVal) return 0;
        return ((yVal - xVal) / xVal) * 100;
      default:
        return 0;
    }
  });

  changeLabel = computed(() => {
    const val = this.result();
    if (val > 0) return 'increase';
    if (val < 0) return 'decrease';
    return 'no change';
  });

  setMode(mode: CalcMode): void {
    this.mode.set(mode);
    this.x.set(0);
    this.y.set(0);
  }

  onXChange(value: number): void {
    this.x.set(value);
  }

  onYChange(value: number): void {
    this.y.set(value);
  }
}
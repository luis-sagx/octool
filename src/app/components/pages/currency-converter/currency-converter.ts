import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Rates {
  [key: string]: number;
}

const API_URL = 'https://open.er-api.com/v6/latest/USD';
const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-converter.html',
  styleUrl: './currency-converter.css',
})
export class CurrencyConverter implements OnInit, OnDestroy {
  currencies = signal<string[]>([]);
  rates = signal<Rates>({});
  lastUpdated = signal<string>('');

  fromCurrency = signal('USD');
  toCurrency = signal('EUR');
  amount = signal(1);

  result = signal(0);
  loading = signal(false);
  error = signal('');
  lastFetch = signal(0);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.fetchRates();
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  async fetchRates(): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch rates');

      const data = await response.json();
      const currencies = ['USD', ...Object.keys(data.rates)].sort();
      this.rates.set({ USD: 1, ...data.rates });
      this.currencies.set(currencies);

      if (data.time_last_update_utc) {
        const date = new Date(data.time_last_update_utc);
        this.lastUpdated.set(date.toLocaleDateString());
      }
      
      this.lastFetch.set(Date.now());
      this.calculate();
    } catch (e) {
      this.error.set('Failed to load exchange rates. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onAmountChange(value: number): void {
    this.amount.set(value);
    this.debouncedCalculate();
  }

  onFromCurrencyChange(currency: string): void {
    this.fromCurrency.set(currency);
    this.calculate();
  }

  onToCurrencyChange(currency: string): void {
    this.toCurrency.set(currency);
    this.calculate();
  }

  private debouncedCalculate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.calculate();
    }, DEBOUNCE_MS);
  }

  private calculate(): void {
    const from = this.fromCurrency();
    const to = this.toCurrency();
    const amt = this.amount();
    const currentRates = this.rates();

    if (!currentRates[from] || !currentRates[to]) {
      this.result.set(0);
      return;
    }

    const inUSD = amt / currentRates[from];
    const converted = inUSD * currentRates[to];
    this.result.set(converted);
  }

  swap(): void {
    const from = this.fromCurrency();
    const to = this.toCurrency();
    this.fromCurrency.set(to);
    this.toCurrency.set(from);
    this.calculate();
  }
}
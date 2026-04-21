import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rates {
  [key: string]: number;
}

const API_URL = 'https://open.er-api.com/v6/latest/USD';
const DEBOUNCE_MS = 300;

// Most common world currencies + Latin America
const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', country: '🇺🇸 United States' },
  { code: 'EUR', name: 'Euro', country: '🇪🇺 Eurozone' },
  { code: 'GBP', name: 'British Pound', country: '🇬🇧 United Kingdom' },
  { code: 'JPY', name: 'Japanese Yen', country: '🇯🇵 Japan' },
  { code: 'CNY', name: 'Chinese Yuan', country: '🇨🇳 China' },
  { code: 'MXN', name: 'Mexican Peso', country: '🇲🇽 Mexico' },
  { code: 'ARS', name: 'Argentine Peso', country: '🇦🇷 Argentina' },
  { code: 'BRL', name: 'Brazilian Real', country: '🇧🇷 Brazil' },
  { code: 'CLP', name: 'Chilean Peso', country: '🇨🇱 Chile' },
  { code: 'COP', name: 'Colombian Peso', country: '🇨🇴 Colombia' },
  { code: 'PEN', name: 'Peruvian Sol', country: '🇵🇪 Peru' },
  { code: 'UYU', name: 'Uruguayan Peso', country: '🇺🇾 Uruguay' },
  { code: 'PYG', name: 'Paraguayan Guarani', country: '🇵🇾 Paraguay' },
  { code: 'BOB', name: 'Bolivian Boliviano', country: '🇧🇴 Bolivia' },
  { code: 'VES', name: 'Venezuelan Bolivar', country: '🇻🇪 Venezuela' },
  { code: 'CRC', name: 'Costa Rican Colon', country: '🇨🇷 Costa Rica' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', country: '🇬🇹 Guatemala' },
  { code: 'HNL', name: 'Honduran Lempira', country: '🇭🇳 Honduras' },
  { code: 'NIO', name: 'Nicaraguan Cordoba', country: '🇳🇮 Nicaragua' },
  { code: 'SVC', name: 'Salvadoran Colon', country: '🇸🇻 El Salvador' },
  { code: 'DOP', name: 'Dominican Peso', country: '🇩🇴 Dominican Rep' },
  { code: 'CUP', name: 'Cuban Peso', country: '🇨🇺 Cuba' },
  { code: 'CAD', name: 'Canadian Dollar', country: '🇨🇦 Canada' },
  { code: 'AUD', name: 'Australian Dollar', country: '🇦🇺 Australia' },
  { code: 'CHF', name: 'Swiss Franc', country: '🇨🇭 Switzerland' },
  { code: 'KRW', name: 'South Korean Won', country: '🇰🇷 South Korea' },
  { code: 'INR', name: 'Indian Rupee', country: '🇮🇳 India' },
  { code: 'RUB', name: 'Russian Ruble', country: '🇷🇺 Russia' },
  { code: 'ZAR', name: 'South African Rand', country: '🇿🇦 South Africa' },
  { code: 'SGD', name: 'Singapore Dollar', country: '🇸🇬 Singapore' },
  { code: 'HKD', name: 'Hong Kong Dollar', country: '🇭🇰 Hong Kong' },
];

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './currency-converter.html',
  styleUrl: './currency-converter.css',
})
export class CurrencyConverter implements OnInit, OnDestroy {
  currencies = COMMON_CURRENCIES;
  rates = signal<Rates>({});
  lastUpdated = signal<string>('');

  fromCurrency = signal('USD');
  toCurrency = signal('EUR');
  amount = signal(1);

  result = signal(0);
  loading = signal(false);
  error = signal('');

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
      const rateMap: Rates = { USD: 1, ...data.rates };
      this.rates.set(rateMap);

      if (data.time_last_update_utc) {
        const date = new Date(data.time_last_update_utc);
        this.lastUpdated.set(date.toLocaleDateString());
      }

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

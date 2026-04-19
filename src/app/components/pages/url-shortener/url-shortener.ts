import { Component, signal } from '@angular/core';
import { CopyButton } from '../../ui/copy-button/copy-button';

@Component({
  selector: 'app-url-shortener',
  standalone: true,
  imports: [CopyButton],
  templateUrl: './url-shortener.html',
  styleUrl: './url-shortener.css',
})
export class UrlShortener {
  inputUrl = signal('');
  shortenedUrl = signal('');

  loading = signal(false);
  error = signal('');

  async shorten(): Promise<void> {
    const url = this.inputUrl().trim();

    if (!url) {
      this.error.set('Please enter a URL');
      return;
    }

    if (!this.isValidUrl(url)) {
      this.error.set('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.shortenedUrl.set('');

    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const text = await response.text();

      if (!text.startsWith('http')) {
        throw new Error('Invalid response from server');
      }

      this.shortenedUrl.set(text.trim());
    } catch (e: any) {
      this.error.set('Failed to shorten URL. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onInputChange(value: string): void {
    this.inputUrl.set(value);
    this.error.set('');
  }

  clear(): void {
    this.inputUrl.set('');
    this.shortenedUrl.set('');
    this.error.set('');
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
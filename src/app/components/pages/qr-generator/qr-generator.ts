import { Component, signal, OnDestroy } from '@angular/core';
import QRCode from 'qrcode';

type SizeOption = 'small' | 'medium' | 'large';

const SIZE_MAP: { [key in SizeOption]: number } = {
  small: 128,
  medium: 256,
  large: 512,
};

const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  templateUrl: './qr-generator.html',
  styleUrl: './qr-generator.css',
})
export class QrGenerator implements OnDestroy {
  inputText = signal('');
  qrDataUrl = signal('');

  size = signal<SizeOption>('medium');
  fgColor = signal('#1a1a2e');

  loading = signal(false);
  error = signal('');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  onInputChange(value: string): void {
    this.inputText.set(value);
    this.debouncedGenerate();
  }

  onSizeChange(size: SizeOption): void {
    this.size.set(size);
    if (this.inputText()) {
      this.generate();
    }
  }

  onColorChange(color: string): void {
    this.fgColor.set(color);
    if (this.inputText()) {
      this.generate();
    }
  }

  private debouncedGenerate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.generate();
    }, DEBOUNCE_MS);
  }

  private async generate(): Promise<void> {
    const text = this.inputText();
    if (!text.trim()) {
      this.qrDataUrl.set('');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const sizePx = SIZE_MAP[this.size()];
      const dataUrl = await QRCode.toDataURL(text, {
        width: sizePx,
        color: {
          dark: this.fgColor(),
          light: '#ffffff',
        },
        margin: 2,
      });
      this.qrDataUrl.set(dataUrl);
    } catch (e) {
      this.error.set('Failed to generate QR code');
      this.qrDataUrl.set('');
    } finally {
      this.loading.set(false);
    }
  }

  download(): void {
    const dataUrl = this.qrDataUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';

@Component({
  selector: 'base64-tool',
  standalone: true,
  imports: [OutputBox, InputBox, FormsModule],
  templateUrl: './base64-tool.html',
  styleUrl: './base64-tool.css',
})
export class Base64Tool {
  mode: 'image-to-base64' | 'base64-to-image' = 'image-to-base64';
  selectedFile: File | null = null;
  base64Input = '';
  base64Result = '';
  outputFormat = 'png';
  resultImageDataUrl = '';
  loading = false;
  hasError = false;
  errorMessage = '';

  setMode(mode: 'image-to-base64' | 'base64-to-image'): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.clearResults();
    this.hasError = false;
    this.errorMessage = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.clearResults();
    this.hasError = false;
    this.errorMessage = '';
  }

  async convertImageToBase64(): Promise<void> {
    if (!this.selectedFile) {
      this.hasError = true;
      this.errorMessage = 'Select an image.';
      return;
    }

    this.loading = true;
    this.clearResults();
    this.hasError = false;
    this.errorMessage = '';

    try {
      const dataUrl = await this.readFileAsDataUrl(this.selectedFile);
      const commaIndex = dataUrl.indexOf(',');
      this.base64Result =
        commaIndex > -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      this.resultImageDataUrl = '';
    } catch {
      this.hasError = true;
      this.errorMessage = 'Could not convert image to Base64.';
    } finally {
      this.loading = false;
    }
  }

  async convertBase64ToImage(): Promise<void> {
    if (!this.base64Input.trim()) {
      this.hasError = true;
      this.errorMessage = 'Paste a valid Base64 string.';
      return;
    }

    this.loading = true;
    this.clearResults();
    this.hasError = false;
    this.errorMessage = '';

    try {
      const normalized = this.normalizeBase64(this.base64Input);
      const converted = await this.convertDataUrlFormat(
        normalized,
        this.mimeFromFormat(this.outputFormat),
      );
      this.resultImageDataUrl = converted;
    } catch {
      this.hasError = true;
      this.errorMessage =
        'Could not convert Base64. Verify that it is valid and the format is supported.';
    } finally {
      this.loading = false;
    }
  }

  clear(): void {
    this.selectedFile = null;
    this.base64Input = '';
    this.clearResults();
    this.outputFormat = 'png';
    this.hasError = false;
    this.errorMessage = '';
  }

  private clearResults(): void {
    this.base64Result = '';
    this.resultImageDataUrl = '';
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) ?? '');
      reader.onerror = () => reject(new Error('read-failed'));
      reader.readAsDataURL(file);
    });
  }

  private normalizeBase64(value: string): string {
    const trimmed = value.trim();
    if (trimmed.startsWith('data:')) {
      return trimmed;
    }
    return `data:image/png;base64,${trimmed.replace(/\s/g, '')}`;
  }

  private mimeFromFormat(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      default:
        return 'image/png';
    }
  }

  private convertDataUrlFormat(
    dataUrl: string,
    outputMime: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('canvas-not-supported'));
          return;
        }

        if (outputMime === 'image/jpeg') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.drawImage(image, 0, 0);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('format-not-supported'));
              return;
            }
            resolve(await this.readBlobAsDataUrl(blob));
          },
          outputMime,
          outputMime === 'image/jpeg' ? 0.92 : undefined,
        );
      };
      image.onerror = () => reject(new Error('invalid-base64'));
      image.src = dataUrl;
    });
  }

  private readBlobAsDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) ?? '');
      reader.onerror = () => reject(new Error('blob-read-failed'));
      reader.readAsDataURL(blob);
    });
  }
}

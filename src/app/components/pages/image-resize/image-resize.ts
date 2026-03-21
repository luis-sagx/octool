import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import imageCompression from 'browser-image-compression';

type ResizeMode = 'dimensions' | 'weight';

@Component({
  selector: 'app-image-resize',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-resize.html',
  styleUrl: './image-resize.css',
})
export class ImageResize {
  mode = signal<ResizeMode>('dimensions');
  width = signal(800);
  height = signal(600);
  keepAspectRatio = signal(true);
  targetKb = signal(200);
  outputFormat = signal<'jpeg' | 'webp' | 'png'>('jpeg');

  loading = signal(false);
  error = signal('');

  originalFile: File | null = null;
  originalPreview = signal('');
  originalSizeKb = signal(0);
  resultDataUrl = signal('');
  resultSizeKb = signal(0);
  resultBlob: Blob | null = null;
  resultFileName = signal('');

  private naturalWidth = 0;
  private naturalHeight = 0;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.originalFile = file;
    this.originalSizeKb.set(Math.round(file.size / 1024));
    this.resultDataUrl.set('');
    this.resultSizeKb.set(0);
    this.resultBlob = null;
    this.error.set('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.originalPreview.set(src);
      const img = new Image();
      img.onload = () => {
        this.naturalWidth = img.naturalWidth;
        this.naturalHeight = img.naturalHeight;
        this.width.set(img.naturalWidth);
        this.height.set(img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onWidthChange(val: number) {
    this.width.set(val);
    if (this.keepAspectRatio() && this.naturalWidth && this.naturalHeight) {
      this.height.set(
        Math.round(val * (this.naturalHeight / this.naturalWidth)),
      );
    }
  }

  onHeightChange(val: number) {
    this.height.set(val);
    if (this.keepAspectRatio() && this.naturalWidth && this.naturalHeight) {
      this.width.set(
        Math.round(val * (this.naturalWidth / this.naturalHeight)),
      );
    }
  }

  async process() {
    if (!this.originalFile) {
      this.error.set('Please select an image first.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.mode() === 'weight') {
        const compressed = await imageCompression(this.originalFile, {
          maxSizeMB: this.targetKb() / 1024,
          fileType: this.mimeFromFormat(this.outputFormat()),
          useWebWorker: true,
        });
        this.resultBlob = compressed;
        this.resultSizeKb.set(Math.round(compressed.size / 1024));
        this.resultFileName.set(
          this.buildName(
            `compressed.${this.extensionFromFormat(this.outputFormat())}`,
          ),
        );
        this.resultDataUrl.set(await this.blobToDataUrl(compressed));
      } else {
        const resized = await this.resizeByDimensions(
          this.originalFile,
          this.width(),
          this.height(),
        );
        this.resultBlob = resized;
        this.resultSizeKb.set(Math.round(resized.size / 1024));
        const suffix = `${this.width()}x${this.height()}.${this.extensionFromFormat(this.outputFormat())}`;
        this.resultFileName.set(this.buildName(suffix));
        this.resultDataUrl.set(await this.blobToDataUrl(resized));
      }
    } catch (e: any) {
      this.error.set(e.message ?? 'Processing failed');
    } finally {
      this.loading.set(false);
    }
  }

  private resizeByDimensions(file: File, w: number, h: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Resize failed'))),
          this.mimeFromFormat(this.outputFormat()),
          this.outputFormat() === 'jpeg' ? 0.9 : undefined,
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = url;
    });
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private buildName(suffix: string): string {
    const name = this.originalFile?.name ?? 'image';
    const dot = name.lastIndexOf('.');
    return dot > -1 ? `${name.slice(0, dot)}_${suffix}` : `${name}_${suffix}`;
  }

  private mimeFromFormat(format: 'jpeg' | 'webp' | 'png'): string {
    if (format === 'webp') return 'image/webp';
    if (format === 'png') return 'image/png';
    return 'image/jpeg';
  }

  private extensionFromFormat(format: 'jpeg' | 'webp' | 'png'): string {
    if (format === 'jpeg') return 'jpg';
    return format;
  }

  download() {
    if (!this.resultBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.resultBlob);
    a.download = this.resultFileName();
    a.click();
    URL.revokeObjectURL(a.href);
  }

  clear() {
    this.originalFile = null;
    this.originalPreview.set('');
    this.resultDataUrl.set('');
    this.originalSizeKb.set(0);
    this.resultSizeKb.set(0);
    this.resultBlob = null;
    this.resultFileName.set('');
    this.error.set('');
    this.mode.set('dimensions');
    this.targetKb.set(200);
    this.outputFormat.set('jpeg');
  }
}

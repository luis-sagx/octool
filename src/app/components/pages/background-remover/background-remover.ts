import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-background-remover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-remover.html',
  styleUrl: './background-remover.css',
})
export class BackgroundRemover {
  originalPreview = signal('');
  resultDataUrl = signal('');
  originalName = signal('');
  originalSizeKb = signal(0);
  loading = signal(false);
  progressMessage = signal('');
  error = signal('');
  resultBlob: Blob | null = null;

  private originalFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.originalFile = file;
    this.originalName.set(file.name);
    this.originalSizeKb.set(Math.round(file.size / 1024));
    this.resultDataUrl.set('');
    this.resultBlob = null;
    this.error.set('');
    this.progressMessage.set('');

    const reader = new FileReader();
    reader.onload = (e) => this.originalPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.onFileSelected({ target: { files: [file] } } as any);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  async removeBackground() {
    if (!this.originalFile) {
      this.error.set('Please select an image first.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.resultDataUrl.set('');
    this.progressMessage.set(
      'Loading AI model (first time may take a moment)...',
    );

    try {
      // Dynamic import to keep initial bundle small
      const { removeBackground } = await import('@imgly/background-removal');
      this.progressMessage.set('Processing image...');
      const resultBlob = await removeBackground(this.originalFile, {
        output: { format: 'image/png', quality: 0.9 },
      });
      this.resultBlob = resultBlob;
      const url = URL.createObjectURL(resultBlob);
      this.resultDataUrl.set(url);
      this.progressMessage.set('');
    } catch (e: any) {
      this.error.set(e.message ?? 'Background removal failed');
      this.progressMessage.set('');
    } finally {
      this.loading.set(false);
    }
  }

  download() {
    if (!this.resultBlob) return;
    const base = this.originalName().replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.resultBlob);
    a.download = `${base}_no-bg.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  clear() {
    this.originalPreview.set('');
    this.resultDataUrl.set('');
    this.originalFile = null;
    this.resultBlob = null;
    this.error.set('');
    this.progressMessage.set('');
  }
}

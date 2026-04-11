import { Component, signal } from '@angular/core';
import ImageTracer from 'imagetracerjs';

@Component({
  selector: 'app-format-converter',
  standalone: true,
  templateUrl: './format-converter.html',
  styleUrl: './format-converter.css',
})
export class FormatConverter {
  selectedFile = signal<File | null>(null);
  originalPreview = signal('');
  originalSizeKb = signal(0);
  targetFormat = signal('png');
  resultDataUrl = signal('');
  resultBlob: Blob | null = null;
  loading = signal(false);
  error = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.loadFile(input.files?.[0] ?? null);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.loadFile(event.dataTransfer?.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  async convertFormat(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Choose an image.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.resultDataUrl.set('');

    try {
      const blob = await this.convertFileFormat(file, this.targetFormat());
      this.resultBlob = blob;
      this.resultDataUrl.set(await this.blobToDataUrl(blob));
    } catch {
      this.error.set('Failed to convert the image to the selected format.');
    } finally {
      this.loading.set(false);
    }
  }

  download(): void {
    if (!this.resultBlob) return;
    const name = this.selectedFile()?.name.replace(/\.[^.]+$/, '') ?? 'image';

    const ext = this.targetFormat() === 'jpeg' ? 'jpg' : this.targetFormat();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.resultBlob);
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  clear(): void {
    this.selectedFile.set(null);
    this.originalPreview.set('');
    this.originalSizeKb.set(0);
    this.resultDataUrl.set('');
    this.resultBlob = null;
    this.error.set('');
    this.targetFormat.set('png');
  }

  private loadFile(file: File | null): void {
    if (!file) return;
    this.selectedFile.set(file);
    this.originalSizeKb.set(Math.round(file.size / 1024));
    this.resultDataUrl.set('');
    this.resultBlob = null;
    this.error.set('');

    const reader = new FileReader();
    reader.onload = (e) => this.originalPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  private mimeFromFormat(format: string): string {
    switch (format) {
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/png';
    }
  }

  private async convertFileFormat(file: File, format: string): Promise<Blob> {
    if (format === 'svg') {
      const sourceDataUrl = await this.fileToDataUrl(file);
      const sourceImage = await this.dataUrlToImage(sourceDataUrl);
      const svgString = await this.imageToSvg(sourceImage);
      return new Blob([svgString], { type: 'image/svg+xml' });
    }

    const sourceDataUrl = await this.fileToDataUrl(file);
    const sourceImage = await this.dataUrlToImage(sourceDataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.naturalWidth;
    canvas.height = sourceImage.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('canvas-not-supported');
    }

    if (format === 'jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(sourceImage, 0, 0);
    const mime = this.mimeFromFormat(format);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('format-not-supported'));
            return;
          }
          resolve(blob);
        },
        mime,
        mime === 'image/jpeg' ? 0.92 : undefined,
      );
    });
  }

  private imageToSvg(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        ltres: 10,
        qtres: 10,
        pathomit: 8,
        colorsampling: 2,
        numberofcolors: 16,
        mincolorratio: 0.02,
        colorquantcycles: 5,
        scale: 1,
        simplifytolerance: 0,
        roundcoords: 1,
        viewbox: true,
        desc: false,
        noorb: false,
        noprogress: true,
        whitespace: true,
      };
      try {
        const svgStr = ImageTracer.imagedataToSVG(
          this.imageToImageData(image),
          options
        );
        resolve(svgStr);
      } catch (e) {
        reject(e);
      }
    });
  }

  private imageToImageData(image: HTMLImageElement): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-not-supported');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) ?? '');
      reader.onerror = () => reject(new Error('file-read-error'));
      reader.readAsDataURL(file);
    });
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) ?? '');
      reader.onerror = () => reject(new Error('blob-read-error'));
      reader.readAsDataURL(blob);
    });
  }

  private dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('invalid-image'));
      image.src = dataUrl;
    });
  }
}

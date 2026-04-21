import { Component, signal } from '@angular/core';
import ImageTracer from 'imagetracerjs';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-format-converter',
  standalone: true,
  templateUrl: './format-converter.html',
  styleUrl: './format-converter.css',
})
export class FormatConverter {
  selectedFiles = signal<File[]>([]);
  originalPreview = signal('');
  originalSizeKb = signal(0);
  targetFormat = signal('png');
  quality = signal<'low' | 'medium' | 'high'>('high');
  resultDataUrl = signal('');
  convertedCount = signal(0);
  resultBlobs: { name: string; blob: Blob }[] = [];
  loading = signal(false);
  error = signal('');
  fileMode = signal<'single' | 'multiple'>('single');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.loadFiles(Array.from(input.files ?? []));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.loadFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  setFileMode(mode: 'single' | 'multiple'): void {
    this.fileMode.set(mode);
    this.clear();
  }

  async convertFormat(): Promise<void> {
    const files = this.selectedFiles();
    if (!files.length) {
      this.error.set('Choose at least one image.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.resultDataUrl.set('');
    this.convertedCount.set(0);
    this.resultBlobs = [];

    try {
      const settledResults = await Promise.allSettled(
        files.map(async (file) => ({
          name: file.name,
          blob: await this.convertFileFormat(file, this.targetFormat()),
        })),
      );

      const successfulResults = settledResults
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<{ name: string; blob: Blob }> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value);

      if (!successfulResults.length) {
        throw new Error('all-conversions-failed');
      }

      this.resultBlobs = successfulResults;
      this.convertedCount.set(successfulResults.length);
      this.resultDataUrl.set(
        await this.blobToDataUrl(successfulResults[0].blob),
      );
      this.downloadAll();

      const failedCount = settledResults.length - successfulResults.length;
      if (failedCount > 0) {
        this.error.set(
          `${failedCount} image(s) could not be converted. Downloaded ${successfulResults.length}.`,
        );
      }
    } catch {
      this.error.set('Failed to convert the selected images.');
    } finally {
      this.loading.set(false);
    }
  }

  downloadAll(): void {
    if (!this.resultBlobs.length) return;

    const ext = this.targetFormat() === 'jpeg' ? 'jpg' : this.targetFormat();

    // Si hay más de un archivo, descargar como ZIP
    if (this.resultBlobs.length > 1) {
      this.downloadAsZip(ext);
      return;
    }

    // Solo un archivo: descarga directa
    const result = this.resultBlobs[0];
    const name = result.name.replace(/\.[^.]+$/, '') || 'image';
    this.downloadBlob(result.blob, `${name}.${ext}`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async downloadAsZip(ext: string): Promise<void> {
    // Import dinámico de JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const result of this.resultBlobs) {
      const name = result.name.replace(/\.[^.]+$/, '') || 'image';
      zip.file(`${name}.${ext}`, result.blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(content, `converted_images_${Date.now()}.zip`);
  }

  clear(): void {
    this.selectedFiles.set([]);
    this.originalPreview.set('');
    this.originalSizeKb.set(0);
    this.resultDataUrl.set('');
    this.convertedCount.set(0);
    this.resultBlobs = [];
    this.error.set('');
    this.targetFormat.set('png');
    this.quality.set('high');
  }

  private loadFiles(files: File[]): void {
    if (!files.length) return;

    // En modo single solo tomar el primer archivo
    const filesToLoad = this.fileMode() === 'single' ? [files[0]] : files;

    this.selectedFiles.set(filesToLoad);
    this.originalSizeKb.set(Math.round(filesToLoad[0].size / 1024));
    this.resultDataUrl.set('');
    this.convertedCount.set(0);
    this.resultBlobs = [];
    this.error.set('');

    const reader = new FileReader();
    reader.onload = (e) => this.originalPreview.set(e.target?.result as string);
    reader.readAsDataURL(filesToLoad[0]);
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
      case 'pdf':
        return 'application/pdf';
      default:
        return 'image/png';
    }
  }

  private upscaleFromQuality(): number {
    switch (this.quality()) {
      case 'high':
        return 2;
      case 'medium':
        return 1.5;
      default:
        return 1;
    }
  }

  private jpegQualityFromLevel(): number {
    switch (this.quality()) {
      case 'high':
        return 0.97;
      case 'medium':
        return 0.92;
      default:
        return 0.8;
    }
  }

  private async convertFileFormat(file: File, format: string): Promise<Blob> {
    const sourceDataUrl = await this.fileToDataUrl(file);
    const sourceImage = await this.dataUrlToImage(sourceDataUrl);

    if (format === 'svg') {
      const svgString = await this.imageToSvg(sourceImage);
      return new Blob([svgString], { type: 'image/svg+xml' });
    }

    if (format === 'pdf') {
      return await this.imageToPdf(sourceImage);
    }

    const scale = this.upscaleFromQuality();
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.naturalWidth * scale;
    canvas.height = sourceImage.naturalHeight * scale;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('canvas-not-supported');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    if (format === 'jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    if (this.quality() === 'high' && format !== 'jpeg' && format !== 'bmp') {
      this.applySharpening(context, canvas.width, canvas.height);
    }

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
        mime === 'image/jpeg' ? this.jpegQualityFromLevel() : undefined,
      );
    });
  }

  private async imageToPdf(image: HTMLImageElement): Promise<Blob> {
    const scale = this.upscaleFromQuality();
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });

    pdf.addImage(
      image,
      'PNG',
      0,
      0,
      width,
      height,
    );

    return pdf.output('blob') as unknown as Blob;
  }

  private applySharpening(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ): void {
    const imageData = ctx.getImageData(0, 0, w, h);
    const src = imageData.data;
    const out = new Uint8ClampedArray(src);
    // Kernel de sharpening estándar (laplaciano con centro 5)
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * w + (x + kx)) * 4 + c;
              sum += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          out[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, sum));
        }
      }
    }

    ctx.putImageData(new ImageData(out, w, h), 0, 0);
  }

  private imageToSvg(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      const q = this.quality();

      // Calcular scale óptimo basado en tamaño de imagen original
      // NO upscale si la imagen ya es razonablemente grande (>1200px)
      const baseScale =
        image.naturalWidth > 1200 || image.naturalHeight > 1202 ? 1 : 2;

      const options = {
        // Tolerancias más altas = menos paths
        ltres: q === 'high' ? 2 : q === 'medium' ? 4 : 8,
        qtres: q === 'high' ? 2 : q === 'medium' ? 4 : 8,
        // Eliminar paths pequeños para reducir tamaño
        pathomit: q === 'high' ? 8 : q === 'medium' ? 16 : 32,
        colorsampling: 2,
        // MUCHO menos colores - esto es el factor más importante
        numberofcolors: q === 'high' ? 24 : q === 'medium' ? 16 : 8,
        mincolorratio: 0.02,
        colorquantcycles: 3,
        blurradius: 0,
        blurdelta: 0,
        scale: baseScale,
        // Simplificar paths para reducir puntos
        simplifytolerance: q === 'high' ? 0 : q === 'medium' ? 1 : 2,
        roundcoords: q === 'high' ? 2 : 1,
        viewbox: true,
        desc: false,
        noorb: false,
        noprogress: true,
        whitespace: true,
      };

      try {
        const imageData = this.imageToImageData(image, baseScale);
        const svgStr = ImageTracer.imagedataToSVG(imageData, options);
        resolve(svgStr);
      } catch (e) {
        reject(e);
      }
    });
  }

  private imageToImageData(image: HTMLImageElement, upscale = 1): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth * upscale;
    canvas.height = image.naturalHeight * upscale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-not-supported');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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

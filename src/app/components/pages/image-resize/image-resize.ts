import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, finalize, catchError, EMPTY } from 'rxjs';
import { ImageApi } from '../../../services/image-api';

type Mode = 'dimensions' | 'weight';

@Component({
  selector: 'app-image-resize',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './image-resize.html',
  styleUrl: './image-resize.css',
})
export class ImageResize {
  private readonly api = inject(ImageApi);

  //  Estado
  selectedFile = signal<File | null>(null);
  originalPreview = signal('');
  originalSizeKb = signal(0);

  mode = signal<Mode>('dimensions');

  // Modo dimensiones
  width = signal(800);
  height = signal(600);
  keepAspectRatio = signal(true);
  private aspectRatio = 1;

  // Modo peso
  targetKb = signal(300);
  outputFormat = signal('jpeg');

  // Resultado
  resultDataUrl = signal('');
  resultSizeKb = signal(0);
  loading = signal(false);
  error = signal('');

  resultFileName = computed(() => {
    const file = this.selectedFile();
    if (!file) return 'result';
    const name = file.name.replace(/\.[^.]+$/, '');
    return this.mode() === 'dimensions'
      ? `${name}_${this.width()}x${this.height()}.png`
      : `${name}_compressed.${this.outputFormat()}`;
  });

  private readonly submit$ = new Subject<File>();

  constructor() {
    this.submit$
      .pipe(
        switchMap((file) => {
          this.loading.set(true);
          this.error.set('');
          this.resultDataUrl.set('');
          this.resultSizeKb.set(0);

          const request$ =
            this.mode() === 'dimensions'
              ? this.api.resizeImage(file, this.width(), this.height())
              : this.api.compressImage(
                  file,
                  this.targetKb(),
                  this.outputFormat(),
                );

          return request$.pipe(
            catchError((err: Error) => {
              this.error.set(err.message);
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        this.resultDataUrl.set(`data:${data.mime_type};base64,${data.base64}`);
        if ('result_size_kb' in data) {
          this.resultSizeKb.set((data as any).result_size_kb);
        }
      });
  }

  //  Handlers
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.error.set('');
    this.resultDataUrl.set('');
    this.resultSizeKb.set(0);

    if (!file) return;

    this.originalSizeKb.set(Math.round(file.size / 1024));

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this.originalPreview.set(url);

      // Calcular aspect ratio original
      const img = new Image();
      img.onload = () => {
        this.aspectRatio = img.naturalWidth / img.naturalHeight;
        this.width.set(img.naturalWidth);
        this.height.set(img.naturalHeight);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  onWidthChange(value: number): void {
    this.width.set(value);
    if (this.keepAspectRatio() && value > 0) {
      this.height.set(Math.round(value / this.aspectRatio));
    }
  }

  onHeightChange(value: number): void {
    this.height.set(value);
    if (this.keepAspectRatio() && value > 0) {
      this.width.set(Math.round(value * this.aspectRatio));
    }
  }

  process(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Selecciona una imagen.');
      return;
    }
    if (
      this.mode() === 'dimensions' &&
      (this.width() <= 0 || this.height() <= 0)
    ) {
      this.error.set('Ancho y alto deben ser mayores a 0.');
      return;
    }
    if (this.mode() === 'weight' && this.targetKb() <= 0) {
      this.error.set('El peso objetivo debe ser mayor a 0 KB.');
      return;
    }
    this.submit$.next(file);
  }

  download(): void {
    const url = this.resultDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = this.resultFileName();
    a.click();
  }

  clear(): void {
    this.selectedFile.set(null);
    this.originalPreview.set('');
    this.originalSizeKb.set(0);
    this.resultDataUrl.set('');
    this.resultSizeKb.set(0);
    this.error.set('');
    this.width.set(800);
    this.height.set(600);
    this.targetKb.set(300);
    this.outputFormat.set('jpeg');
    this.keepAspectRatio.set(true);
  }
}

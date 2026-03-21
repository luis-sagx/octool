import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, finalize, catchError, EMPTY } from 'rxjs';
import { ImageApi } from '../../../services/image-api';

@Component({
  selector: 'app-background-remover',
  standalone: true,
  templateUrl: './background-remover.html',
  styleUrl: './background-remover.css',
})
export class BackgroundRemover {
  private readonly api = inject(ImageApi);

  selectedFile = signal<File | null>(null);
  originalPreview = signal('');
  originalSizeKb = signal(0);
  resultDataUrl = signal('');
  loading = signal(false);
  error = signal('');

  private readonly submit$ = new Subject<File>();

  constructor() {
    this.submit$
      .pipe(
        switchMap((file) => {
          this.loading.set(true);
          this.error.set('');
          this.resultDataUrl.set('');

          return this.api.removeBackground(file).pipe(
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
      });
  }

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

  removeBackground(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Selecciona una imagen.');
      return;
    }
    this.submit$.next(file);
  }

  download(): void {
    const url = this.resultDataUrl();
    if (!url) return;
    const name = this.selectedFile()?.name.replace(/\.[^.]+$/, '') ?? 'imagen';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_sin_fondo.png`;
    a.click();
  }

  clear(): void {
    this.selectedFile.set(null);
    this.originalPreview.set('');
    this.originalSizeKb.set(0);
    this.resultDataUrl.set('');
    this.error.set('');
  }

  private loadFile(file: File | null): void {
    if (!file) return;
    this.selectedFile.set(file);
    this.originalSizeKb.set(Math.round(file.size / 1024));
    this.resultDataUrl.set('');
    this.error.set('');

    const reader = new FileReader();
    reader.onload = (e) => this.originalPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }
}

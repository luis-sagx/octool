import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, finalize, catchError, EMPTY } from 'rxjs';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';
import { ImageApi } from '../../../services/image-api';

type Base64Action =
  | { type: 'toBase64'; file: File }
  | { type: 'toImage'; b64: string };

@Component({
  selector: 'base64-tool',
  standalone: true,
  imports: [OutputBox, InputBox, FormsModule],
  templateUrl: './base64-tool.html',
  styleUrl: './base64-tool.css',
})
export class Base64Tool {
  private readonly api = inject(ImageApi);

  selectedFile: File | null = null;
  base64Input = '';
  base64Result = '';
  outputFormat = 'png';
  resultImageDataUrl = '';
  loading = false;
  hasError = false;
  errorMessage = '';

  private readonly submit$ = new Subject<Base64Action>();

  constructor() {
    this.submit$
      .pipe(
        switchMap((action) => {
          this.loading = true;
          this.hasError = false;
          this.errorMessage = '';

          const request$ =
            action.type === 'toBase64'
              ? this.api.imageToBase64(action.file)
              : this.api.base64ToImage(action.b64, this.outputFormat);

          return request$.pipe(
            catchError((err: Error) => {
              this.hasError = true;
              this.errorMessage = err.message;
              return EMPTY;
            }),
            finalize(() => (this.loading = false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        this.base64Result = data.base64;
        this.resultImageDataUrl = `data:${data.mime_type};base64,${data.base64}`;
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.hasError = false;
    this.errorMessage = '';
  }

  convertImageToBase64(): void {
    if (!this.selectedFile) {
      this.hasError = true;
      this.errorMessage = 'Selecciona una imagen.';
      return;
    }
    this.submit$.next({ type: 'toBase64', file: this.selectedFile });
  }

  convertBase64ToImage(): void {
    if (!this.base64Input.trim()) {
      this.hasError = true;
      this.errorMessage = 'Pega un Base64 válido.';
      return;
    }
    this.submit$.next({ type: 'toImage', b64: this.base64Input });
  }

  clear(): void {
    this.selectedFile = null;
    this.base64Input = '';
    this.base64Result = '';
    this.resultImageDataUrl = '';
    this.outputFormat = 'png';
    this.hasError = false;
    this.errorMessage = '';
  }
}

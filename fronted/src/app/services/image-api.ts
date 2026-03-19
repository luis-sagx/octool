import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';

export interface ImageResponse {
  base64: string;
  mime_type: string;
  format: string;
}

export interface CompressResponse extends ImageResponse {
  original_size_kb: number;
  result_size_kb: number;
  quality_used: number | null;
}

@Injectable({ providedIn: 'root' })
export class ImageApi {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://127.0.0.1:8000';

  removeBackground(file: File): Observable<ImageResponse> {
    const form = this.fileForm({ file });
    return this.http
      .post<ImageResponse>(`${this.apiBase}/remove-background`, form)
      .pipe(catchError(this.handleError));
  }

  removeBackgroundPrecise(
    file: File,
    options: {
      model?: string;
      fg_threshold?: number;
      bg_threshold?: number;
      erode_size?: number;
    } = {},
  ): Observable<ImageResponse> {
    const form = this.fileForm({
      file,
      model: options.model ?? 'isnet-general-use',
      fg_threshold: options.fg_threshold ?? 240,
      bg_threshold: options.bg_threshold ?? 10,
      erode_size: options.erode_size ?? 10,
    });
    return this.http
      .post<ImageResponse>(`${this.apiBase}/remove-background/precise`, form)
      .pipe(catchError(this.handleError));
  }

  resizeImage(
    file: File,
    width: number,
    height: number,
  ): Observable<ImageResponse> {
    const form = this.fileForm({ file, width, height });
    return this.http
      .post<ImageResponse>(`${this.apiBase}/resize-image`, form)
      .pipe(catchError(this.handleError));
  }

  compressImage(
    file: File,
    targetKb: number,
    outputFormat = 'jpeg',
  ): Observable<CompressResponse> {
    const form = this.fileForm({
      file,
      target_kb: targetKb,
      output_format: outputFormat,
    });
    return this.http
      .post<CompressResponse>(`${this.apiBase}/pillow-tool`, form)
      .pipe(catchError(this.handleError));
  }

  convertFormat(file: File, targetFormat: string): Observable<ImageResponse> {
    const form = this.fileForm({ file, target_format: targetFormat });
    return this.http
      .post<ImageResponse>(`${this.apiBase}/convert-format`, form)
      .pipe(catchError(this.handleError));
  }

  imageToBase64(file: File): Observable<ImageResponse> {
    const form = this.fileForm({ file });
    return this.http
      .post<ImageResponse>(`${this.apiBase}/base64/image-to-base64`, form)
      .pipe(catchError(this.handleError));
  }

  base64ToImage(
    base64Data: string,
    outputFormat = 'png',
  ): Observable<ImageResponse> {
    return this.http
      .post<ImageResponse>(`${this.apiBase}/base64/base64-to-image`, {
        base64_data: base64Data,
        output_format: outputFormat,
      })
      .pipe(catchError(this.handleError));
  }

  //Helpers

  private fileForm(fields: Record<string, string | number | File>): FormData {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, value instanceof File ? value : String(value));
    }
    return form;
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message: string =
      err.error?.detail ?? err.message ?? 'Error desconocido';
    return throwError(() => new Error(message));
  }
}

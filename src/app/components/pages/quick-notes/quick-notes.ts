import { Component, signal, effect, OnInit, OnDestroy } from '@angular/core';

const STORAGE_KEY = 'octool-quick-notes';
const DEBOUNCE_MS = 500;

@Component({
  selector: 'app-quick-notes',
  standalone: true,
  templateUrl: './quick-notes.html',
  styleUrl: './quick-notes.css',
})
export class QuickNotes implements OnInit, OnDestroy {
  content = signal('');
  saved = signal(false);
  showConfirm = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const text = this.content();
      this.debouncedSave(text);
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.content.set(saved);
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  onInputChange(value: string): void {
    this.content.set(value);
    this.saved.set(false);
  }

  private debouncedSave(text: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, text);
      this.saved.set(true);

      setTimeout(() => this.saved.set(false), 2000);
    }, DEBOUNCE_MS);
  }

  clear(): void {
    if (!this.showConfirm()) {
      this.showConfirm.set(true);
      return;
    }

    this.content.set('');
    localStorage.removeItem(STORAGE_KEY);
    this.saved.set(true);
    this.showConfirm.set(false);

    setTimeout(() => this.saved.set(false), 2000);
  }

  cancelClear(): void {
    this.showConfirm.set(false);
  }
}
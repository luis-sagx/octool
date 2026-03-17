import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-copy-button',
  imports: [],
  templateUrl: './copy-button.html',
  styleUrl: './copy-button.css'
})
export class CopyButton {
  @Input() textToCopy: string = '';

  copied = signal(false);

  copyText() {
    navigator.clipboard.writeText(this.textToCopy).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}

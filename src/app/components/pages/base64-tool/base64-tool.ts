import { Component } from '@angular/core';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';

@Component({
  selector: 'base64-tool',
  standalone: true,
  imports: [OutputBox, InputBox],
  templateUrl: './base64-tool.html',
  styleUrl: './base64-tool.css',
})
export class Base64Tool {
  inputText: string = '';
  result: string = '';
  hasError: boolean = false;

  convertToBase64(): void {
    this.hasError = false;
    try {
      this.result = btoa(this.inputText);
    } catch {
      this.hasError = true;
      this.result = '';
    }
  }

  convertToText(): void {
    this.hasError = false;
    try {
      this.result = atob(this.inputText);
    } catch {
      this.hasError = true;
      this.result = '';
    }
  }

  clear(): void {
    this.inputText = '';
    this.result = '';
    this.hasError = false;
  }
}

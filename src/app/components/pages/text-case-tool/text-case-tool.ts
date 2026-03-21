import { Component } from '@angular/core';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';

@Component({
  selector: 'app-text-case-tool',
  standalone: true,
  imports: [OutputBox, InputBox],
  templateUrl: './text-case-tool.html',
  styleUrl: './text-case-tool.css',
})
export class TextCaseTool {
  inputText = '';
  outputText = '';
  hasError = false;

  toUpper() {
    if (this.verifyInput()) {
      this.outputText = this.inputText.toUpperCase();
    }
  }

  toLower() {
    if (this.verifyInput()) {
      this.outputText = this.inputText.toLowerCase();
    }
  }

  toCapital() {
    if (this.verifyInput()) {
      this.outputText = this.inputText
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    }
  }

  verifyInput(): boolean {
    if (/[a-zA-Z]/.test(this.inputText)) {
      this.hasError = false;
      return true;
    } else {
      this.hasError = true;
      this.outputText = '';
      return false;
    }
  }

  clear() {
    this.inputText = '';
    this.outputText = '';
    this.hasError = false;
  }
}

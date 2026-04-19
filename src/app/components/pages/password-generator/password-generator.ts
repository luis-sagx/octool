import { Component, signal, computed } from '@angular/core';
import { CopyButton } from '../../ui/copy-button/copy-button';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [CopyButton],
  templateUrl: './password-generator.html',
  styleUrl: './password-generator.css',
})
export class PasswordGenerator {
  length = signal(16);
  includeUppercase = signal(true);
  includeLowercase = signal(true);
  includeNumbers = signal(true);
  includeSymbols = signal(true);

  generatedPassword = signal('');

  private uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  private numberChars = '0123456789';
  private symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  canGenerate = computed(() => {
    return (
      this.includeUppercase() ||
      this.includeLowercase() ||
      this.includeNumbers() ||
      this.includeSymbols()
    );
  });

  generate(): void {
    if (!this.canGenerate()) {
      return;
    }

    let charset = '';
    if (this.includeUppercase()) charset += this.uppercaseChars;
    if (this.includeLowercase()) charset += this.lowercaseChars;
    if (this.includeNumbers()) charset += this.numberChars;
    if (this.includeSymbols()) charset += this.symbolChars;

    let password = '';
    const array = new Uint32Array(this.length());
    crypto.getRandomValues(array);

    for (let i = 0; i < this.length(); i++) {
      password += charset[array[i] % charset.length];
    }

    this.generatedPassword.set(password);
  }

  regenerate(): void {
    this.generate();
  }

  copyToClipboard(): void {
    if (this.generatedPassword()) {
      navigator.clipboard.writeText(this.generatedPassword());
    }
  }
}
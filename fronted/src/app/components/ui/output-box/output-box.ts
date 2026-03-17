import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyButton } from '../copy-button/copy-button';

@Component({
  selector: 'app-output-box',
  standalone: true,
  imports: [CommonModule, CopyButton],
  templateUrl: './output-box.html',
  styleUrl: './output-box.css',
})
export class OutputBox {
  @Input() text: string = '';
}

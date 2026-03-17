import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './tool-card.html',
  styleUrl: './tool-card.css'
})
export class ToolCard {
  @Input() title!: string;
  @Input() description!: string;
  @Input() iconClass!: string;
  @Input() link!: string;
}

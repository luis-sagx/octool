import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './tool-card.html',
})
export class ToolCard {
  @Input() title!: string;
  @Input() description!: string;
  @Input() iconPath?: string;
  @Input() badgeText?: string;
  @Input() link?: string;
}

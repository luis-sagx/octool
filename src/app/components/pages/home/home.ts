import { Component } from '@angular/core';
import { ToolCard } from '../../ui/tool-card/tool-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ToolCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  tools = [
    {
      title: 'JSON Generator',
      description: 'Generate JSON structures with ease.',
      iconClass: 'fas fa-code',
      link: '/json-generator',
    },
    {
      title: 'Text Case Converter',
      description: 'Convert to UPPERCASE, lowercase, or Capitalized.',
      iconClass: 'fas fa-text-height',
      link: '/text-case',
    },
    {
      title: 'Base64 Tool',
      description: 'Encode and decode Base64 strings.',
      iconClass: 'fas fa-lock',
      link: '/base64',
    },
    {
      title: 'Word Counter',
      description: 'Count words and characters in your text.',
      iconClass: 'fas fa-sort-numeric-up',
      link: '/word-count',
    },
    {
      title: 'Diff Checker',
      description: 'Compare two texts line by line.',
      iconClass: 'fas fa-exchange-alt',
      link: '/diff-checker',
    },
  ];
}

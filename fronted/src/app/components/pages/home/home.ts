import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToolCard } from '../../ui/tool-card/tool-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, RouterLink, ToolCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  toolCards = [
    {
      title: 'Word Counter',
      description:
        'Track word, character, and sentence counts with instant feedback and clean exports.',
      link: '/word-count',
      badgeText: 'Live',
      iconPath: 'M4 6h16M4 10h16M4 14h10M4 18h7',
    },
    {
      title: 'JSON Creator',
      description:
        'Build, validate, and format JSON structures with smart presets and reusable blocks.',
      link: '/json-generator',
      badgeText: 'Templates',
      iconPath:
        'M9 3H5a2 2 0 0 0-2 2v4m0 6v4a2 2 0 0 0 2 2h4m6-18h4a2 2 0 0 1 2 2v4m0 6v4a2 2 0 0 1-2 2h-4',
    },
    {
      title: 'Background Remover',
      description:
        'Strip image backgrounds in one click with clean edges and downloadable assets.',
      badgeText: 'Soon',
      iconPath: 'M15 5l4 4M7 7h6M7 11h10M7 15h4',
    },
    {
      title: 'Text Case Tool',
      description:
        'Switch between sentence, title, and uppercase styles without losing formatting.',
      link: '/text-case',
      badgeText: 'Fast',
      iconPath: 'M4 6h16M4 12h10M4 18h6',
    },
    {
      title: 'Diff Checker',
      description:
        'Compare two blocks side-by-side with clear highlighting and exportable reports.',
      link: '/diff-checker',
      badgeText: 'Compare',
      iconPath: 'M10 6h10M4 12h16M10 18h10',
    },
    {
      title: 'Base64 Encoder',
      description:
        'Encode or decode strings and files with quick copy-to-clipboard outputs.',
      link: '/base64',
      badgeText: 'Encode',
      iconPath: 'M12 6v12m6-6H6',
    },
  ];
}

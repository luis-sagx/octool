import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
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
      link: '/background-remover',
      badgeText: 'New',
      iconPath: 'M15 5l4 4M7 7h6M7 11h10M7 15h4',
    },
    {
      title: 'Image Resize',
      description:
        'Resize images by exact pixel dimensions using Pillow with instant preview.',
      link: '/image-resize',
      badgeText: 'Pixels',
      iconPath:
        'M4 10V6a2 2 0 0 1 2-2h4m4 0h4a2 2 0 0 1 2 2v4m0 4v4a2 2 0 0 1-2 2h-4m-4 0H6a2 2 0 0 1-2-2v-4',
    },
    {
      title: 'Format Converter',
      description:
        'Convert image format between PNG, JPEG, WEBP, and BMP in one click.',
      link: '/format-converter',
      badgeText: 'Convert',
      iconPath:
        'M8 7h8m-8 5h8m-8 5h8M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z',
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
      title: 'Base64 Image',
      description:
        'Transform images to Base64 and convert Base64 back to image from the backend.',
      link: '/base64',
      badgeText: 'Image',
      iconPath: 'M12 6v12m6-6H6',
    },
  ];
}

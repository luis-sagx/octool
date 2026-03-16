import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { TextCaseTool } from './components/pages/text-case-tool/text-case-tool';
import { Base64Tool } from './components/pages/base64-tool/base64-tool';
import { WordCount } from './components/pages/word-count/word-count';
import { TextJsonConverter } from './components/pages/text-json-converter/text-json-converter';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'text-case',
    component: TextCaseTool,
  },
  {
    path: 'base64',
    component: Base64Tool,
  },
  {
    path: 'word-count',
    component: WordCount,
  },
  {
    path: 'text-json-converter',
    component: TextJsonConverter,
  },
  {
    path: '**',
    redirectTo: '/',
  },
];

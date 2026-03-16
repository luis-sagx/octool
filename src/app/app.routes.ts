import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { TextCaseTool } from './components/pages/text-case-tool/text-case-tool';
import { Base64Tool } from './components/pages/base64-tool/base64-tool';
import { WordCount } from './components/pages/word-count/word-count';
import { JsonGenerator } from './components/pages/json-generator/json-generator';
import { DiffChecker } from './components/pages/diff-checker/diff-checker';

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
    path: 'json-generator',
    component: JsonGenerator,
  },
  {
    path: 'diff-checker',
    component: DiffChecker,
  },

  {
    path: '**',
    redirectTo: '/',
  },
];

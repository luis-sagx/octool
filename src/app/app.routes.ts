import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { TextCaseTool } from './components/pages/text-case-tool/text-case-tool';
import { Base64Tool } from './components/pages/base64-tool/base64-tool';
import { WordCount } from './components/pages/word-count/word-count';
import { JsonGenerator } from './components/pages/json-generator/json-generator';
import { JsonTemplates } from './components/pages/json/json-templates/json-templates';
import { JsonConvert } from './components/pages/json/json-convert/json-convert';
import { JsonUtils } from './components/pages/json/json-utils/json-utils';
import { DiffChecker } from './components/pages/diff-checker/diff-checker';
import { BackgroundRemover } from './components/pages/background-remover/background-remover';
import { ImageResize } from './components/pages/image-resize/image-resize';
import { FormatConverter } from './components/pages/format-converter/format-converter';

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
    path: 'json/templates',
    component: JsonTemplates,
  },
  {
    path: 'json/convert',
    component: JsonConvert,
  },
  {
    path: 'json/utils',
    component: JsonUtils,
  },
  {
    path: 'diff-checker',
    component: DiffChecker,
  },
  {
    path: 'background-remover',
    component: BackgroundRemover,
  },
  {
    path: 'image-resize',
    component: ImageResize,
  },
  {
    path: 'format-converter',
    component: FormatConverter,
  },

  {
    path: '**',
    redirectTo: '/',
  },
];
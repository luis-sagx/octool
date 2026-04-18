import { Component, signal } from '@angular/core';
import { OutputBox } from '../../../ui/output-box/output-box';

type JsonUtil = 'format' | 'minify' | 'sort' | 'validate' | 'flatten' | 'unflatten' | 'diff' | 'query';

@Component({
  selector: 'app-json-utils',
  standalone: true,
  imports: [OutputBox],
  templateUrl: './json-utils.html',
})
export class JsonUtils {
  readonly utils: { value: JsonUtil; label: string; icon: string; description: string }[] = [
    { value: 'format', label: 'Format', icon: 'fa-align-left', description: 'Pretty print with indentation' },
    { value: 'minify', label: 'Minify', icon: 'fa-compress-arrows-alt', description: 'Remove whitespace' },
    { value: 'sort', label: 'Sort Keys', icon: 'fa-sort-alpha-down', description: 'Sort object keys alphabetically' },
    { value: 'validate', label: 'Validate', icon: 'fa-check-circle', description: 'Check if valid JSON' },
    { value: 'flatten', label: 'Flatten', icon: 'fa-layer-group', description: 'Convert nested to flat (key.subkey)' },
    { value: 'unflatten', label: 'Unflatten', icon: 'fa-object-group', description: 'Convert flat to nested object' },
    { value: 'diff', label: 'Diff', icon: 'fa-exchange-alt', description: 'Compare two JSON objects' },
    { value: 'query', label: 'Query', icon: 'fa-search', description: 'Extract values with JSONPath' },
  ];

  input = signal('');
  input2 = signal('');
  output = signal('');
  error = signal<string | null>(null);
  activeUtil = signal<JsonUtil>('format');

  setUtil(util: JsonUtil) {
    this.activeUtil.set(util);
    this.error.set(null);
    this.output.set('');
  }

  getActiveUtilIcon(): string {
    const util = this.utils.find((u) => u.value === this.activeUtil());
    return util?.icon || 'fa-play';
  }

  apply() {
    this.error.set(null);
    
    try {
      const util = this.activeUtil();
      const inputVal = this.input();
      
      if (!inputVal.trim()) {
        this.error.set('Please enter some JSON');
        return;
      }

      switch (util) {
        case 'format':
          this.output.set(this.formatJson(inputVal));
          break;
        case 'minify':
          this.output.set(JSON.stringify(JSON.parse(inputVal)));
          break;
        case 'sort':
          this.output.set(this.sortJsonKeys(inputVal));
          break;
        case 'validate':
          JSON.parse(inputVal);
          this.output.set('✅ Valid JSON');
          break;
        case 'flatten':
          this.output.set(this.flattenJson(inputVal));
          break;
        case 'unflatten':
          this.output.set(this.unflattenJson(inputVal));
          break;
        case 'diff':
          this.output.set(this.compareJson(inputVal, this.input2()));
          break;
        case 'query':
          this.output.set(this.queryJson(inputVal, this.input2()));
          break;
      }
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  // Utility functions
  private formatJson(jsonStr: string): string {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  }

  private sortJsonKeys(jsonStr: string): string {
    const obj = JSON.parse(jsonStr);
    return JSON.stringify(this.sortObjectKeys(obj), null, 2);
  }

  private sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) return obj.map((item) => this.sortObjectKeys(item));
    if (obj && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.sortObjectKeys(obj[key]);
          return acc;
        }, {} as Record<string, any>);
    }
    return obj;
  }

  private flattenJson(jsonStr: string): string {
    const obj = JSON.parse(jsonStr);
    const flat = this.flattenObject(obj);
    return JSON.stringify(flat, null, 2);
  }

  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(result, this.flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
    return result;
  }

  private unflattenJson(jsonStr: string): string {
    const flat = JSON.parse(jsonStr);
    const result: Record<string, any> = {};
    for (const key in flat) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = flat[key];
    }
    return JSON.stringify(result, null, 2);
  }

  private compareJson(json1: string, json2: string): string {
    const obj1 = JSON.parse(json1);
    const obj2 = JSON.parse(json2);
    const diff = this.findDiff(obj1, obj2, '');
    
    if (Object.keys(diff).length === 0) {
      return '✅ JSON objects are identical';
    }
    
    return JSON.stringify(diff, null, 2);
  }

  private findDiff(obj1: any, obj2: any, path: string): any {
    const result: any = {};
    
    const keys1 = obj1 && typeof obj1 === 'object' ? Object.keys(obj1) : [];
    const keys2 = obj2 && typeof obj2 === 'object' ? Object.keys(obj2) : [];
    const allKeys = [...new Set([...keys1, ...keys2])];
    
    for (const key of allKeys) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj1)) {
        result[fullPath] = { in: 'obj2', value: obj2[key] };
      } else if (!(key in obj2)) {
        result[fullPath] = { in: 'obj1', value: obj1[key] };
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          const nested = this.findDiff(obj1[key], obj2[key], fullPath);
          if (Object.keys(nested).length > 0) {
            Object.assign(result, nested);
          }
        } else {
          result[fullPath] = { obj1: obj1[key], obj2: obj2[key] };
        }
      }
    }
    
    return result;
  }

  private queryJson(jsonStr: string, query: string): string {
    const obj = JSON.parse(jsonStr);
    const result = this.jsonPath(obj, query);
    return JSON.stringify(result, null, 2);
  }

  private jsonPath(obj: any, path: string): any {
    const keys = path.replace(/^\.?\/?/, '').split('.').filter(Boolean);
    let current: any = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      
      // Handle array access like [0] or [*]
      if (key === '*') return current;
      if (key.startsWith('[') && key.endsWith(']')) {
        const idx = key.slice(1, -1);
        if (idx === '*') return current;
        current = current[parseInt(idx)];
      } else {
        current = current[key];
      }
    }
    
    return current;
  }

  clear() {
    this.input.set('');
    this.input2.set('');
    this.output.set('');
    this.error.set(null);
  }

  getActiveUtilLabel(): string {
    const util = this.utils.find((u) => u.value === this.activeUtil());
    return util?.label || '';
  }
}
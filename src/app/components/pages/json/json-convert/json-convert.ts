import { Component, signal } from '@angular/core';
import { OutputBox } from '../../../ui/output-box/output-box';

type ConvertMode = 'csv2json' | 'tsv2json' | 'json2csv' | 'json2tsv' | 'json2xml' | 'json2yaml';

@Component({
  selector: 'app-json-convert',
  standalone: true,
  imports: [OutputBox],
  templateUrl: './json-convert.html',
})
export class JsonConvert {
  readonly modes: { value: ConvertMode; label: string; icon: string }[] = [
    { value: 'csv2json', label: 'CSV → JSON', icon: 'fa-file-csv' },
    { value: 'tsv2json', label: 'TSV → JSON', icon: 'fa-file-alt' },
    { value: 'json2csv', label: 'JSON → CSV', icon: 'fa-file-csv' },
    { value: 'json2tsv', label: 'JSON → TSV', icon: 'fa-file-alt' },
    { value: 'json2xml', label: 'JSON → XML', icon: 'fa-file-code' },
    { value: 'json2yaml', label: 'JSON → YAML', icon: 'fa-file-code' },
  ];

  input = signal('');
  output = signal('');
  error = signal<string | null>(null);
  activeMode = signal<ConvertMode>('csv2json');

  setMode(mode: ConvertMode) {
    this.activeMode.set(mode);
    this.error.set(null);
    
    // Clear output when switching modes
    if (this.input()) {
      this.convert();
    }
  }

  convert() {
    this.error.set(null);
    
    try {
      const mode = this.activeMode();
      const inputVal = this.input();
      
      if (!inputVal.trim()) {
        this.output.set('');
        return;
      }

      switch (mode) {
        case 'csv2json':
          this.output.set(this.csvToJson(inputVal, ','));
          break;
        case 'tsv2json':
          this.output.set(this.csvToJson(inputVal, '\t'));
          break;
        case 'json2csv':
          this.output.set(this.jsonToDelimited(inputVal, ','));
          break;
        case 'json2tsv':
          this.output.set(this.jsonToDelimited(inputVal, '\t'));
          break;
        case 'json2xml':
          this.output.set(this.jsonToXml(inputVal));
          break;
        case 'json2yaml':
          this.output.set(this.jsonToYaml(inputVal));
          break;
      }
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  download() {
    const outputVal = this.output();
    if (!outputVal) return;

    const mode = this.activeMode();
    let extension: string;
    let mimeType: string;
    let content: string;

    switch (mode) {
      case 'csv2json':
      case 'json2csv':
        extension = 'csv';
        mimeType = 'text/csv';
        content = outputVal;
        break;
      case 'tsv2json':
      case 'json2tsv':
        extension = 'tsv';
        mimeType = 'text/tab-separated-values';
        content = outputVal;
        break;
      case 'json2xml':
        extension = 'xml';
        mimeType = 'application/xml';
        content = outputVal;
        break;
      case 'json2yaml':
        extension = 'yaml';
        mimeType = 'text/yaml';
        content = outputVal;
        break;
      default:
        extension = 'txt';
        mimeType = 'text/plain';
        content = outputVal;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${extension}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private csvToJson(csv: string, delimiter: string): string {
    const lines = csv.trim().split('\n');
    if (!lines.length) return '[]';

    const headers = lines[0].split(delimiter).map((h) => this.unquote(h.trim()));
    const result = lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line, delimiter);
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });

    return JSON.stringify(result, null, 2);
  }

  private jsonToDelimited(jsonStr: string, delimiter: string): string {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (!arr.length) return '';

    const headers = Object.keys(arr[0]);
    const rows = arr.map((obj) =>
      headers.map((h) => {
        const val = obj[h];
        const str = val === null ? '' : String(val);
        return str.includes(delimiter) || str.includes('"') ? `"${str.replace(/"/g, '""')}` : str;
      }).join(delimiter)
    );

    return [headers.join(delimiter), ...rows].join('\n');
  }

  private jsonToXml(jsonStr: string): string {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    
    const convert = (obj: any, tag: string): string => {
      if (obj === null || obj === undefined) return '';
      if (typeof obj !== 'object') {
        return `  <${tag}>${this.escapeXml(String(obj))}</${tag}>`;
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item) => convert(item, 'item')).join('\n');
      }
      
      return Object.entries(obj)
        .map(([key, value]) => convert(value, key))
        .join('\n');
    };

    const xml = arr
      .map((item, i) => convert(item, `item${i}`))
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${xml}\n</root>`;
  }

  private jsonToYaml(jsonStr: string): string {
    const data = JSON.parse(jsonStr);
    return this.toYaml(data, 0);
  }

  private toYaml(obj: any, indent: number): string {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (obj === undefined) return '';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'number') return String(obj);
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
        return `"${obj.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map((item) => `${spaces}- ${this.toYaml(item, indent + 1)}`).join('\n');
    }
    
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 0) return '{}';
      return Object.entries(obj)
        .map(([key, value]) => `${spaces}${key}: ${this.toYaml(value, indent + 1)}`)
        .join('\n');
    }
    
    return String(obj);
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(this.unquote(current));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(this.unquote(current));
    return result;
  }

  private unquote(str: string): string {
    return str.replace(/^"|"$/g, '').trim();
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
import { Component, signal } from '@angular/core';
import { OutputBox } from '../../ui/output-box/output-box';

interface BuilderField {
  id: string;
  key: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'uuid' | 'email' | 'url' | 'array' | 'object';
  value: any;
}

@Component({
  selector: 'app-json-generator',
  standalone: true,
  imports: [OutputBox],
  templateUrl: './json-generator.html',
})
export class JsonGenerator {
  output = signal('');
  fields = signal<BuilderField[]>([
    { id: '1', key: 'id', type: 'uuid', value: '' },
    { id: '2', key: 'name', type: 'text', value: '' },
    { id: '3', key: 'email', type: 'email', value: '' },
  ]);

  readonly fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'date', label: 'Date' },
    { value: 'uuid', label: 'UUID' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'array', label: 'Array' },
    { value: 'object', label: 'Object' },
  ];

  addField() {
    const newId = Date.now().toString();
    this.fields.update((f) => [
      ...f,
      { id: newId, key: '', type: 'text', value: '' },
    ]);
  }

  removeField(id: string) {
    this.fields.update((f) => f.filter((field) => field.id !== id));
  }

  onTypeChange(id: string, event: Event) {
    const value = (event.target as HTMLSelectElement).value as BuilderField['type'];
    this.updateField(id, { type: value });
  }

  onKeyChange(id: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateField(id, { key: value });
  }

  onValueChange(id: string, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.updateField(id, { value });
  }

  updateField(id: string, updates: Partial<BuilderField>) {
    this.fields.update((f) =>
      f.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  }

  generate() {
    const obj: Record<string, any> = {};
    for (const field of this.fields()) {
      if (!field.key) continue;

      let value: any = field.value;

      switch (field.type) {
        case 'number':
          value = parseFloat(field.value) || 0;
          break;
        case 'boolean':
          value = field.value === true || field.value === 'true';
          break;
        case 'date':
          value = field.value ? new Date(field.value).toISOString() : new Date().toISOString();
          break;
        case 'uuid':
          value = this.generateUUID();
          break;
        case 'email':
        case 'url':
        case 'text':
        default:
          value = field.value;
          break;
      }

      obj[field.key] = value;
    }

    this.output.set(JSON.stringify(obj, null, 2));
  }

  clear() {
    this.output.set('');
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.output());
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
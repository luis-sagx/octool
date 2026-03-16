import { Component, signal } from '@angular/core';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';

@Component({
  selector: 'app-json-generator',
  standalone: true,
  imports: [OutputBox, InputBox],
  templateUrl: './json-generator.html',
})
export class JsonGenerator {
  apiKey = signal(localStorage.getItem('ai_api_key') || '');
  prompt = signal('');
  loading = signal(false);
  result = signal<any>('');
  error = signal<string | null>(null);

  async generateJson() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey()}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that outputs only valid JSON.',
              },
              {
                role: 'user',
                content: `${this.prompt()}. Ensure the output is a valid JSON object.`,
              },
            ],
            response_format: { type: 'json_object' }, // Esto requiere que la palabra "JSON" esté presente arriba
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error en la API');
      }

      this.result.set(JSON.parse(data.choices[0].message.content));
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  saveKey() {
    localStorage.setItem('ai_api_key', this.apiKey());
  }

  formatJson(data: any): string {
    return JSON.stringify(data, null, 2).trim();
  }
}

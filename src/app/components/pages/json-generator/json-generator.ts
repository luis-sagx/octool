import { Component, signal } from '@angular/core';
import { OutputBox } from '../../ui/output-box/output-box';
import { InputBox } from '../../ui/input-box/input-box';

type ApiProvider = 'groq' | 'openai' | 'gemini' | 'anthropic' | 'mistral';

interface ProviderConfig {
  name: string;
  endpoint: string;
  model: string;
  keyPrefix: string;
  keyPlaceholder: string;
}

const PROVIDERS: Record<ApiProvider, ProviderConfig> = {
  groq: {
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    keyPrefix: 'ai_api_key_groq',
    keyPlaceholder: 'gsk_...',
  },
  openai: {
    name: 'OpenAI (ChatGPT)',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    keyPrefix: 'ai_api_key_openai',
    keyPlaceholder: 'sk-...',
  },
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.0-flash',
    keyPrefix: 'ai_api_key_gemini',
    keyPlaceholder: 'AIza...',
  },
  anthropic: {
    name: 'Anthropic (Claude)',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-20241022',
    keyPrefix: 'ai_api_key_anthropic',
    keyPlaceholder: 'sk-ant-...',
  },
  mistral: {
    name: 'Mistral',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    model: 'pixtral-12b-2409',
    keyPrefix: 'ai_api_key_mistral',
    keyPlaceholder: 'p_...',
  },
};

const PROVIDER_OPTIONS = Object.entries(PROVIDERS).map(([value, config]) => ({
  value: value as ApiProvider,
  label: config.name,
}));

@Component({
  selector: 'app-json-generator',
  standalone: true,
  imports: [OutputBox, InputBox],
  templateUrl: './json-generator.html',
})
export class JsonGenerator {
  readonly providers = PROVIDER_OPTIONS;
  readonly providerConfigs = PROVIDERS;

  selectedProvider = signal<ApiProvider>(
    (localStorage.getItem('ai_selected_provider') as ApiProvider) || 'groq'
  );
  prompt = signal('');
  loading = signal(false);
  result = signal<any>(null);
  error = signal<string | null>(null);

  private getStoredKey(provider: ApiProvider): string {
    return localStorage.getItem(PROVIDERS[provider].keyPrefix) || '';
  }

  apiKey = signal(this.getStoredKey(this.selectedProvider()));

  setProvider(provider: ApiProvider) {
    this.selectedProvider.set(provider);
    localStorage.setItem('ai_selected_provider', provider);
    this.apiKey.set(this.getStoredKey(provider));
  }

  saveKey() {
    const config = PROVIDERS[this.selectedProvider()];
    localStorage.setItem(config.keyPrefix, this.apiKey());
  }

  async generateJson() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const provider = this.selectedProvider();
      const config = PROVIDERS[provider];
      const key = this.apiKey();

      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      let body: Record<string, any> = {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that outputs only valid JSON.',
          },
          {
            role: 'user',
            content: `${this.prompt()}. Ensure the output is a valid JSON object.`,
          },
        ],
      };

      if (provider === 'anthropic') {
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        const messages = body['messages'];
        body = {
          model: config.model,
          max_tokens: 1024,
          messages: messages,
          system: messages[0].content,
        };
        body['messages'] = messages.slice(1);
      } else {
        headers['Authorization'] = `Bearer ${key}`;
        body['response_format'] = { type: 'json_object' };
      }

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Error en la API');
      }

      let content: string;
      if (provider === 'anthropic') {
        content = data.content[0].text;
      } else {
        content = data.choices[0].message.content;
      }

      this.result.set(JSON.parse(content));
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  formatJson(data: any): string {
    if (!data) return '';
    return JSON.stringify(data, null, 2).trim();
  }
}

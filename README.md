# 🛠️ Octool

A modern, fast, and lightweight **online toolkit** for everyday development tasks. Built with **Angular 20 + TailwindCSS**.

🔗 [Live Demo](https://octool.vercel.app)  
📂 [GitHub](https://github.com/luis-sagx/octool)

---

## 🚀 Features

### JSON Tools
- **Generator** — Build JSON objects interactively with type support (text, number, boolean, date, UUID, email, url)
- **Templates** — Pre-built JSON structures for testing (users, products, orders, API responses, etc.)
- **Convert** — Transform between JSON, CSV, TSV, XML, and YAML formats
- **Utils** — Format, minify, sort keys, validate, flatten/unflatten, diff, query

### Text Tools
- **Text Case** — Convert to UPPERCASE, lowercase, Capitalize, Title Case
- **Word Counter** — Count words and characters in your text
- **Diff Checker** — Compare two texts and see the differences

### Image Tools
- **Base64 Converter** — Encode images to Base64 and decode back to images
- **Format Converter** — Convert between PNG, JPEG, WEBP, BMP, and SVG
- **Image Resizer** — Resize by dimensions or target file size
- **Background Remover** — AI-powered background removal

---

## 🛠️ Technologies

- [Angular 20](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [Vercel](https://vercel.com) — Deployment

---

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 📁 Project Structure

```
src/app/
├── components/
│   ├── layout/
│   │   ├── nav/         ← navigation
│   │   └── footer/     ← footer
│   ├── pages/
│   │   ├── home/              ← landing page
│   │   ├── json-generator/      ← JSON builder
│   │   ├── json-templates/     ← JSON templates
│   │   ├── json-convert/      ← JSON convert
│   │   ├── json-utils/       ← JSON utils
│   │   ├── text-case-tool/   ← text case converter
│   │   ├── word-count/       ← word counter
│   │   ├── diff-checker/      ← text diff
│   │   ├── base64-tool/     ← base64 converter
│   │   ├── image-resize/     ← image resizer
│   │   ├── format-converter/ ← image format converter
│   │   └── background-remover/ ← background remover
│   └── ui/
│       ├── input-box/
│       ├── output-box/
│       ├── tool-card/
│       └── copy-button/
```

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/new-tool`
3. Make your changes
4. Commit: `git commit -m "Add new tool"`
5. Push: `git push origin feature/new-tool`
6. Open a Pull Request

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2026 Octool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## ⚡ Quick Links

| Tool | URL |
|------|-----|
| Home | `/` |
| JSON Generator | `/json-generator` |
| JSON Templates | `/json/templates` |
| JSON Convert | `/json/convert` |
| JSON Utils | `/json/utils` |
| Text Case | `/text-case` |
| Word Counter | `/word-count` |
| Diff Checker | `/diff-checker` |
| Base64 | `/base64` |
| Image Resize | `/image-resize` |
| Format Converter | `/format-converter` |
| Background Remover | `/background-remover` |
import { Component, signal } from '@angular/core';

interface JsonTemplate {
  name: string;
  description: string;
  icon: string;
  content: string;
  category: 'simple' | 'common' | 'complex';
}

const TEMPLATES: JsonTemplate[] = [
  // ========== SIMPLE ==========
  // Objetos pequeños, útiles para testing, con campos reales
  {
    name: 'User',
    description: 'Basic user - id, name, email, password',
    icon: 'fa-user',
    category: 'simple',
    content: `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password_here",
  "status": "active"
}`,
  },
  {
    name: 'Post',
    description: 'Blog post - id, title, body, author',
    icon: 'fa-file-alt',
    category: 'simple',
    content: `{
  "id": 1,
  "title": "My First Post",
  "body": "Post content here...",
  "authorId": 1,
  "published": true,
  "views": 42
}`,
  },
  {
    name: 'Comment',
    description: 'Comment - id, postId, userId, text',
    icon: 'fa-comment',
    category: 'simple',
    content: `{
  "id": 1,
  "postId": 1,
  "userId": 2,
  "text": "Great post!",
  "createdAt": "2024-01-20T10:30:00Z"
}`,
  },
  {
    name: 'Category',
    description: 'Category - id, name, slug, parentId',
    icon: 'fa-folder',
    category: 'simple',
    content: `{
  "id": 1,
  "name": "Technology",
  "slug": "technology",
  "parentId": null
}`,
  },
  {
    name: 'Tag',
    description: 'Tag - id, name, slug',
    icon: 'fa-tag',
    category: 'simple',
    content: `{
  "id": 1,
  "name": "JavaScript",
  "slug": "javascript"
}`,
  },
  {
    name: 'Order',
    description: 'E-commerce order - id, userId, total, status',
    icon: 'fa-shopping-cart',
    category: 'simple',
    content: `{
  "id": 1,
  "userId": 1,
  "total": 99.99,
  "status": "pending",
  "items": [
    { "productId": 1, "quantity": 2, "price": 29.99 },
    { "productId": 2, "quantity": 1, "price": 40.01 }
  ]
}`,
  },
  {
    name: 'Product',
    description: 'Product - id, name, price, category',
    icon: 'fa-box',
    category: 'simple',
    content: `{
  "id": 1,
  "name": "Wireless Mouse",
  "price": 29.99,
  "categoryId": 1,
  "inStock": true,
  "stock": 50
}`,
  },
  {
    name: 'Image',
    description: 'Image - id, url, alt, type',
    icon: 'fa-image',
    category: 'simple',
    content: `{
  "id": 1,
  "url": "https://example.com/img.jpg",
  "alt": "Description",
  "type": "jpg",
  "size": 102400
}`,
  },
  {
    name: 'File',
    description: 'File - id, name, url, size',
    icon: 'fa-file',
    category: 'simple',
    content: `{
  "id": 1,
  "name": "document.pdf",
  "url": "https://example.com/doc.pdf",
  "mimeType": "application/pdf",
  "size": 256000
}`,
  },
  {
    name: 'Setting',
    description: 'App setting - key, value',
    icon: 'fa-cog',
    category: 'simple',
    content: `{
  "key": "theme",
  "value": "dark",
  "type": "string"
}`,
  },
  {
    name: 'Session',
    description: 'User session - id, userId, token',
    icon: 'fa-clock',
    category: 'simple',
    content: `{
  "id": "sess_abc123",
  "userId": 1,
  "token": "jwt_token_here",
  "expiresAt": "2024-01-27T10:30:00Z"
}`,
  },
  {
    name: 'Login',
    description: 'Login data - email, password',
    icon: 'fa-sign-in-alt',
    category: 'simple',
    content: `{
  "email": "user@example.com",
  "password": "plain_password"
}`,
  },
  {
    name: 'Register',
    description: 'Registration - name, email, password',
    icon: 'fa-user-plus',
    category: 'simple',
    content: `{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "confirmPassword": "hashed_password"
}`,
  },
  {
    name: 'Profile',
    description: 'User profile - bio, avatar, social',
    icon: 'fa-id-card',
    category: 'simple',
    content: `{
  "userId": 1,
  "bio": "Hello world",
  "avatar": "https://example.com/avatar.jpg",
  "website": "https://johndoe.com",
  "location": "NYC"
}`,
  },
  {
    name: 'Address',
    description: 'Shipping/billing address',
    icon: 'fa-map-marker',
    category: 'simple',
    content: `{
  "userId": 1,
  "type": "shipping",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "US",
  "phone": "+1-555-123-4567"
}`,
  },
  // ========== COMMON ==========
  // Objetos más completos con relaciones y estructura
  {
    name: 'Full User',
    description: 'User with profile and relationships',
    icon: 'fa-user-circle',
    category: 'common',
    content: `{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "user",
  "status": "active",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer",
    "avatar": "https://example.com/avatar.jpg",
    "birthDate": "1990-05-15",
    "phone": "+1-555-123-4567"
  },
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "country": "US"
  },
  "stats": {
    "posts": 42,
    "followers": 128,
    "following": 56
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-20T14:22:00Z"
}`,
  },
  {
    name: 'Full Product',
    description: 'Product with variants and images',
    icon: 'fa-boxes',
    category: 'common',
    content: `{
  "id": 1,
  "name": "Wireless Headphones",
  "slug": "wireless-headphones",
  "sku": "WH-1000XM4",
  "price": 299.99,
  "comparePrice": 349.99,
  "description": "Premium noise-canceling headphones",
  "categoryId": 1,
  "tags": ["audio", "wireless", "premium"],
  "images": [
    {"url": "https://example.com/1.jpg", "alt": "Front"},
    {"url": "https://example.com/2.jpg", "alt": "Back"}
  ],
  "variants": [
    {"id": 1, "name": "Black", "sku": "WH-BLK", "stock": 50},
    {"id": 2, "name": "Silver", "sku": "WH-SIL", "stock": 30}
  ],
  "rating": 4.5,
  "reviews": 128,
  "featured": true,
  "inStock": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`,
  },
  {
    name: 'Full Order',
    description: 'Order with items and status',
    icon: 'fa-shopping-cart',
    category: 'common',
    content: `{
  "id": 1,
  "userId": 1,
  "status": "processing",
  "subtotal": 99.99,
  "tax": 8.00,
  "shipping": 5.00,
  "total": 112.99,
  "currency": "USD",
  "items": [
    {"productId": 1, "name": "Mouse", "qty": 2, "price": 29.99},
    {"productId": 2, "name": "Keyboard", "qty": 1, "price": 40.01}
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "SF",
    "state": "CA",
    "zip": "94102"
  },
  "notes": "Leave at door",
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}`,
  },
  {
    name: 'Blog Post',
    description: 'Post with content and relations',
    icon: 'fa-newspaper',
    category: 'common',
    content: `{
  "id": 1,
  "title": "Getting Started with Node.js",
  "slug": "getting-started-nodejs",
  "excerpt": "A quick guide to Node.js",
  "content": "Full HTML content...",
  "authorId": 1,
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "featuredImage": "https://example.com/cover.jpg",
  "status": "published",
  "publishedAt": "2024-01-20T10:30:00Z",
  "views": 1250,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z"
}`,
  },
  {
    name: 'API Error',
    description: 'API error response',
    icon: 'fa-exclamation-triangle',
    category: 'common',
    content: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email",
    "details": {}
  }
}`,
  },
  {
    name: 'API Success',
    description: 'API success response',
    icon: 'fa-check-circle',
    category: 'common',
    content: `{
  "success": true,
  "message": "Operation completed",
  "data": {
    "id": 1,
    "name": "Item"
  }
}`,
  },
  {
    name: 'Pagination',
    description: 'Paginated response',
    icon: 'fa-list-ol',
    category: 'common',
    content: `{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}`,
  },
  {
    name: 'Form Input',
    description: 'Form input with validation',
    icon: 'fa-wpforms',
    category: 'common',
    content: `{
  "name": "",
  "email": "",
  "subject": "",
  "message": "",
  "attachments": []
}`,
  },
  {
    name: 'Filter',
    description: 'Filter options',
    icon: 'fa-filter',
    category: 'common',
    content: `{
  "search": "",
  "status": [],
  "categoryId": null,
  "tagIds": [],
  "dateFrom": null,
  "dateTo": null,
  "priceMin": null,
  "priceMax": null,
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "page": 1,
  "limit": 20
}`,
  },
  // ========== COMPLEX ==========
  // Estructuras completas con metadata, nested objects, etc.
  {
    name: 'API Response',
    description: 'Full API response wrapper',
    icon: 'fa-server',
    category: 'complex',
    content: `{
  "success": true,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "error": null,
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0",
    "processingTime": 45
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}`,
  },
  {
    name: 'Config',
    description: 'App configuration',
    icon: 'fa-cog',
    category: 'complex',
    content: `{
  "app": {
    "name": "MyApp",
    "version": "1.0.0",
    "env": "production",
    "debug": false
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_db",
    "user": "admin",
    "pool": {
      "min": 2,
      "max": 10,
      "idleTimeout": 30000
    }
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0
  },
  "security": {
    "jwtSecret": "your-secret-key",
    "jwtExpiry": "7d",
    "refreshTokenExpiry": "30d",
    "corsOrigins": ["http://localhost:3000"],
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    }
  },
  "features": {
    "registration": true,
    "socialLogin": true,
    "emailVerification": true
  },
  "mail": {
    "driver": "smtp",
    "host": "smtp.example.com",
    "port": 587,
    "secure": false
  }
}`,
  },
  {
    name: 'Form Schema',
    description: 'Dynamic form definition',
    icon: 'fa-wpforms',
    category: 'complex',
    content: `{
  "formId": "contact_form",
  "title": "Contact Us",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Your name",
      "required": true,
      "minLength": 2,
      "maxLength": 50
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email",
      "placeholder": "you@example.com",
      "required": true
    },
    {
      "name": "subject",
      "type": "select",
      "label": "Subject",
      "options": [
        {"value": "support", "label": "Support"},
        {"value": "sales", "label": "Sales"},
        {"value": "other", "label": "Other"}
      ]
    },
    {
      "name": "message",
      "type": "textarea",
      "label": "Message",
      "required": true,
      "minLength": 10,
      "maxLength": 1000,
      "rows": 5
    },
    {
      "name": "attachment",
      "type": "file",
      "label": "Attachment",
      "accept": [".pdf", ".jpg", ".png"],
      "maxSize": 5242880
    }
  ],
  "submit": {
    "label": "Send Message",
    "endpoint": "/api/contact",
    "method": "POST"
  }
}`,
  },
  {
    name: 'Menu',
    description: 'Navigation menu',
    icon: 'fa-bars',
    category: 'complex',
    content: `{
  "id": "main_menu",
  "items": [
    {
      "id": "home",
      "label": "Home",
      "icon": "fa-home",
      "url": "/",
      "order": 1
    },
    {
      "id": "about",
      "label": "About",
      "url": "/about",
      "order": 2
    },
    {
      "id": "services",
      "label": "Services",
      "icon": "fa-cog",
      "url": "/services",
      "order": 3,
      "children": [
        {"id": "web", "label": "Web Dev", "url": "/services/web"},
        {"id": "mobile", "label": "Mobile", "url": "/services/mobile"}
      ]
    },
    {
      "id": "contact",
      "label": "Contact",
      "icon": "fa-envelope",
      "url": "/contact",
      "order": 4
    }
  ]
}`,
  },
  {
    name: 'Localization',
    description: 'i18n translations',
    icon: 'fa-language',
    category: 'complex',
    content: `{
  "locale": "en",
  "fallback": "en",
  "translations": {
    "common": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "search": "Search",
      "loading": "Loading..."
    },
    "nav": {
      "home": "Home",
      "about": "About",
      "contact": "Contact"
    },
    "user": {
      "profile": "Profile",
      "settings": "Settings",
      "logout": "Log Out"
    },
    "errors": {
      "required": "This field is required",
      "invalidEmail": "Invalid email",
      "tooShort": "At least {{min}} characters"
    }
  }
}`,
  },
  {
    name: 'WebSocket',
    description: 'WebSocket event',
    icon: 'fa-bolt',
    category: 'complex',
    content: `{
  "event": "user_presence",
  "type": "broadcast",
  "payload": {
    "userId": 1,
    "status": "online",
    "lastSeen": "2024-01-20T14:30:00Z"
  },
  "room": "project_123",
  "users": [1, 2, 3],
  "timestamp": "2024-01-20T14:30:00Z",
  "version": 1
}`,
  },
  {
    name: 'Event',
    description: 'Calendar event',
    icon: 'fa-calendar',
    category: 'complex',
    content: `{
  "id": 1,
  "title": "Team Meeting",
  "description": "Weekly sync",
  "start": "2024-01-20T10:00:00Z",
  "end": "2024-01-20T11:00:00Z",
  "timezone": "America/New_York",
  "location": "Zoom",
  "attendees": [
    {"userId": 1, "status": "accepted"},
    {"userId": 2, "status": "tentative"}
  ],
  "organizer": {"userId": 1, "email": "john@example.com"},
  "recurring": false,
  "reminders": [15, 60]
}`,
  },
  {
    name: 'Notification',
    description: 'User notification',
    icon: 'fa-bell',
    category: 'complex',
    content: `{
  "id": 1,
  "userId": 1,
  "type": "mention",
  "title": "John mentioned you",
  "message": "Hey @john, check this out",
  "link": "/post/123",
  "read": false,
  "createdAt": "2024-01-20T14:30:00Z"
}`,
  },
  {
    name: 'Analytics',
    description: 'Analytics event',
    icon: 'fa-chart-line',
    category: 'complex',
    content: `{
  "event": "page_view",
  "userId": 1,
  "sessionId": "sess_abc",
  "properties": {
    "page": "/dashboard",
    "referrer": "/",
    "device": "desktop",
    "browser": "Chrome",
    "os": "Mac"
  },
  "timestamp": "2024-01-20T14:30:00Z"
}`,
  },
];

@Component({
  selector: 'app-json-templates',
  standalone: true,
  templateUrl: './json-templates.html',
})
export class JsonTemplates {
  readonly templates = TEMPLATES;
  selectedTemplate = signal<JsonTemplate | null>(null);
  activeCategory = signal<'all' | 'simple' | 'common' | 'complex'>('all');

  get filteredTemplates() {
    const cat = this.activeCategory();
    return cat === 'all'
      ? this.templates
      : this.templates.filter((t) => t.category === cat);
  }

  setCategory(cat: 'all' | 'simple' | 'common' | 'complex') {
    this.activeCategory.set(cat);
  }

  selectTemplate(template: JsonTemplate) {
    this.selectedTemplate.set(template);
  }

  clearTemplate() {
    this.selectedTemplate.set(null);
  }

  formatJson(content: string): string {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  }

  getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'simple':
        return 'Simple';
      case 'common':
        return 'Common';
      case 'complex':
        return 'Complex';
      default:
        return cat;
    }
  }
}
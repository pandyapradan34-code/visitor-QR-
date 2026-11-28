# Architecture

## 1. Overview

Visitor Moments uses a simple three-layer web architecture:

```text
┌──────────────────────────────┐
│          Frontend            │
│  HTML + CSS + JavaScript     │
│                              │
│  Visitor Registration        │
│  Camera / Photo Selection    │
│  TV Display / Carousel       │
└──────────────┬───────────────┘
               │ HTTP / JSON / FormData
               ▼
┌──────────────────────────────┐
│          Backend             │
│      Node.js + Express       │
│                              │
│  Visitor Routes              │
│  Photo Upload Routes         │
│  Slideshow Routes            │
│  Multer Upload Middleware    │
└──────────────┬───────────────┘
               │ MySQL queries
               ▼
┌──────────────────────────────┐
│          MySQL               │
│                              │
│  visitors                    │
│  photos                      │
│  slideshow_queue             │
└──────────────────────────────┘

               │
               ▼
       backend/uploads/
        image files
```

## 2. Technology choices

### HTML, CSS and JavaScript

The frontend is implemented with standard web technologies. This keeps the visitor page and display page lightweight and easy to run in a browser.

### Node.js and Express

Node.js provides the server runtime and Express handles HTTP routes.

The backend separates visitor, photo, and slideshow functionality into route modules.

### MySQL

MySQL stores persistent visitor and photo information and maintains the slideshow queue.

### Multer

Multer handles multipart photo uploads and stores the uploaded files in the backend upload directory.

## 3. Main backend routes

### Visitor routes

```text
POST /api/visitors
```

Creates a visitor when the phone number is new, or returns the existing visitor when the phone number already exists.

```text
GET /api/visitors/:id
```

Returns a visitor and their stored photos.

### Photo routes

```text
POST /api/photos
```

Accepts up to 10 image files, validates the upload through Multer, inserts photo records, and creates slideshow queue records.

### Slideshow routes

```text
GET /api/slideshow/queue
```

Returns pending slideshow photos.

```text
POST /api/slideshow/:id/displayed
```

Marks a queue item as displayed.

```text
GET /api/slideshow/stats
```

Returns counts for visitors, photos, and pending queue items.

## 4. Data model

### visitors

Stores the visitor identity information.

Important fields used by the application include:

- `id`
- `name`
- `phone`

Relationship:

```text
One visitor → many photos
```

### photos

Stores photo metadata and links each photo to a visitor.

Important fields used by the application include:

- `id`
- `visitor_id`
- `file_name`
- `file_path`
- `consent_given`
- `uploaded_at`

Relationship:

```text
One photo → one visitor
```

### slideshow_queue

Stores the slideshow state for uploaded photos.

Important fields used by the application include:

- `id`
- `photo_id`
- `status`
- `created_at`
- `displayed_at`

Relationship:

```text
One photo → one slideshow queue item
```

## 5. Visitor upload flow

```text
Visitor opens /
      │
      ▼
Enter name + phone
      │
      ▼
POST /api/visitors
      │
      ├── New phone → create visitor
      │
      └── Existing phone → reuse visitor
      │
      ▼
Take selfie / select photos
      │
      ▼
Validate type + size + photo count
      │
      ▼
Check consent
      │
      ▼
POST /api/photos
      │
      ▼
Multer stores files
      │
      ▼
Insert photo records
      │
      ▼
Create pending slideshow records
```

## 6. Display flow

```text
TV opens /display
      │
      ▼
GET /api/slideshow/queue
      │
      ▼
Find pending photos
      │
      ▼
Group photos by visitor
      │
      ▼
Load visitor's stored photos
      │
      ▼
Validate image URLs
      │
      ▼
Display gallery / carousel
      │
      ▼
Automatically move to next photo
      │
      ▼
Mark new queue items as displayed
```

## 7. Concurrent upload handling

Each uploaded photo is processed as an individual database record and slideshow queue item.

The photo upload route uses a MySQL transaction:

```text
BEGIN TRANSACTION
      │
      ├── Insert photo 1
      ├── Insert queue item 1
      ├── Insert photo 2
      ├── Insert queue item 2
      └── ...
      │
      ▼
COMMIT
```

If an error occurs during the database work, the transaction is rolled back.

## 8. Important implementation detail

The display page uses periodic HTTP polling rather than WebSockets. It checks for new slideshow items every few seconds.

This keeps the implementation simple and does not require a separate real-time server.


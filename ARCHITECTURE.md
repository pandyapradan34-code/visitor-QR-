# Architecture

## Stack
Node.js + Express.js was selected for the backend because it provides a simple REST API and works naturally with the JavaScript frontend. MySQL was selected for structured visitor, photo and queue relationships. Multer handles multipart image uploads.

## Data Model
Visitors have many Photos. Each Photo creates one Slideshow Queue entry.

```text
Visitors (1) ----< Photos (1) ----< Slideshow Queue
```

## Request Flow
```text
Browser -> Express API -> Validation -> MySQL / File Storage
                                      -> Slideshow Queue
TV Display -> Queue API -> Image -> Display for 10 seconds
```

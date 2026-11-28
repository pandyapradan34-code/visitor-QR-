# Visitor Photo Slideshow

## 1. What the app does

Visitor Moments is a web application for collecting visitor photos and showing them on a separate display screen.

A visitor enters their name and mobile number, gives photo consent, and can either take a selfie using the browser camera or select image files. After the upload completes, the photos are added to a slideshow queue.

The display page is separate from the visitor registration page. It checks for new photos and shows visitor photos on a full-screen display.

If the same mobile number is used again, the existing visitor record is reused. The display can then load that visitor's previous photos together with the newly uploaded photos.

## 2. Main features

- Visitor registration using name and mobile number.
- Live selfie capture using the browser camera.
- Multiple photo upload.
- JPG, PNG, and WEBP image validation.
- Maximum 5 MB per image.
- Maximum 10 uploaded images per submission.
- Consent is required before photo submission.
- Visitor records are reused when the same phone number is entered again.
- Photos are stored in the backend upload directory and recorded in MySQL.
- Uploaded photos are added to a slideshow queue.
- Separate TV/computer display page.
- Automatic photo slideshow.
- Multiple photos from a visitor are shown as a carousel/gallery.
- Previous photos are loaded for returning visitors.
- Visitor name and photo count are shown on the display.

## 3. Technology stack

### Frontend

- HTML
- CSS
- JavaScript
- Browser MediaDevices API for selfie capture

### Backend

- Node.js
- Express.js
- Multer for file uploads
- MySQL2
- dotenv
- Nodemon for development

### Database

MySQL is used for visitor, photo, and slideshow queue data.

## 4. Project structure

The relevant project structure is:

```text
visitor-photo-slideshow/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── upload.js
│   ├── routes/
│   │   ├── photoRoutes.js
│   │   ├── slideshowRoutes.js
│   │   └── visitorRoutes.js
│   └── uploads/
│
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   └── display.html
│   ├── css/
│   │   ├── style.css
│   │   └── display.css
│   └── js/
│       ├── app.js
│       └── display.js
│
├── .env
├── .env.example
├── package.json
└── server.js
```

The exact root files can vary with the final repository, but the application depends on the backend routes, frontend pages, CSS, JavaScript, MySQL configuration, and upload directory described above.

## 5. Setup

### Requirements

Install:

- Node.js
- MySQL
- A modern browser

### Install dependencies

From the project root:

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=visitor_slideshow
DB_PORT=3306
```

Use the actual MySQL password and database settings for the local machine. Do not commit the real `.env` file.

### Database

Create the MySQL database used by the project and make sure the application tables exist:

- `visitors`
- `photos`
- `slideshow_queue`

The backend expects these relationships:

```text
visitors
   │
   └──< photos
            │
            └──< slideshow_queue
```

### Start the application

Development mode:

```bash
npm run dev
```

or:

```bash
node server.js
```

The application runs on:

```text
http://localhost:3000
```

## 6. Using the application

### Visitor page

Open:

```text
http://localhost:3000/
```

The visitor:

1. Enters name.
2. Enters a 10-digit mobile number.
3. Takes a selfie or selects photos.
4. Reviews the selected photos.
5. Gives consent.
6. Submits the photos.

### Display page

Open:

```text
http://localhost:3000/display
```

This page is intended for the smart TV or computer display.

It automatically checks for new slideshow items and displays visitor photos.

## 7. Returning visitors

The application uses the visitor's mobile number to identify an existing visitor.

When the same mobile number is submitted again:

```text
Phone number
     ↓
Existing visitor found
     ↓
Same visitor ID reused
     ↓
New photos linked to that visitor
```

The display can load the visitor's stored photos so the visitor's previous photos and new photos can be shown together.

## 8. Photo validation and upload limits

The upload middleware accepts:

- JPEG
- PNG
- WEBP

Limits:

- 5 MB maximum per image
- Maximum 10 images per submission

The frontend also performs the same basic type and size checks before upload.

## 9. Privacy and consent

The visitor must check the consent option before the frontend submits photos.

The photo upload request sends:

```text
consent=true
```

The backend rejects photo submission when visitor ID or consent is missing.

The project is designed for a display where visitor photos are shown publicly, so consent is part of the submission flow.

## 10. Slideshow behavior

New uploaded photos are inserted into `slideshow_queue` with a `pending` status.

The display page reads pending queue items and shows them automatically.

For a visitor with multiple photos, the display groups the visitor's photos into a gallery and moves through them automatically. Previous photos belonging to the same visitor can also be included.

## 11. Deployment

No deployed URL is included in the project files provided for this documentation update.

If the project is deployed later, add the public HTTPS URL here.

## 12. Repository requirements checklist

| Assignment requirement | Status |
|---|---|
| README.md | Included |
| ASSUMPTIONS.md | Included |
| AI_LOG.md | Included |
| ARCHITECTURE.md | Included |
| Manual test plan | Included in TEST_PLAN.md |
| `.env.example` | Must be present in repository |
| Public GitHub repository | Must be checked before submission |
| Regular meaningful commits | Must be checked in Git history |
| Deployed link | Not available in the supplied project files |


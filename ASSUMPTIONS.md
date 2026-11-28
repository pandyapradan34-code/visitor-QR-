# Assumptions

This file records the decisions made for requirements that were not fully specified in the assignment.

## 1. Returning visitor identification

A returning visitor is identified using their mobile phone number.

Reason:

- The visitor already enters a mobile number during registration.
- It gives the application a simple value that can be checked before creating a new visitor record.
- The current backend checks `visitors.phone` and reuses the existing visitor when the number is found.

## 2. Visitor name on a returning visit

The existing visitor record is reused when the phone number matches.

The current implementation does not update the stored visitor name during a returning visit.

## 3. Photo consent

The visitor must actively give consent before photo submission.

The frontend requires the consent checkbox to be selected and sends `consent=true` with the upload request.

The backend also checks that the consent value is `true`.

## 4. Supported image formats

The application accepts:

- JPEG/JPG
- PNG
- WEBP

Other file types are rejected by the upload middleware.

## 5. Image size limit

Each uploaded image is limited to 5 MB.

This limit is enforced by the upload middleware and also checked in the frontend.

## 6. Maximum photos per submission

A visitor can upload up to 10 images in one submission.

This limit is enforced by the upload middleware and the frontend.

## 7. Slideshow duration

Each photo is displayed for approximately 10 seconds in the current slideshow implementation.

## 8. Multiple photos from one visitor

When several photos belong to the same visitor, they are treated as a gallery and displayed one after another rather than as unrelated visitors.

## 9. Returning visitor photo history

The display is designed to load the visitor's stored photos together with the visitor's new photos.

This means a returning visitor can have their previous photos shown again.

## 10. Display device

The display page is intended to run in a modern browser on a smart TV, computer, or similar screen.

## 11. Concurrent uploads

The application uses MySQL and a slideshow queue so multiple upload requests can be stored independently.

Each uploaded photo receives its own database record and its own queue record.

The project does not implement a separate real-time WebSocket service; the display checks the queue periodically.

## 12. Camera access

Selfie capture uses the browser's camera API.

Camera permission must be granted by the visitor's browser.

The camera flow is intended to work in a browser environment where camera access is available.

## 13. Local development

The project is assumed to run locally with Node.js and MySQL during development.

The normal local application URL is `http://localhost:3000`.

## 14. File storage

Uploaded image files are stored in the project's backend upload directory, while the database stores the file path and related metadata.

## 15. Scope of administration

The current implementation does not include an admin approval workflow. Uploaded photos are placed directly into the slideshow queue after successful upload.


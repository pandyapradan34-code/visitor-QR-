# Test Plan

This is the manual test plan for the Visitor Moments application.

## Test environment

- Node.js server
- MySQL database
- Modern web browser
- Local application running on `http://localhost:3000`

## Test cases

| ID | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| T01 | Open visitor page | Open `/` | Visitor registration page loads | Pass |
| T02 | Open display page | Open `/display` | Separate display page loads | Pass |
| T03 | Register new visitor | Enter name and 10-digit phone | Visitor is created and an ID is returned | Pass |
| T04 | Missing name | Submit without name | Registration is rejected | Pass |
| T05 | Missing phone | Submit without phone | Registration is rejected | Pass |
| T06 | Invalid phone | Enter a non-10-digit phone | Frontend rejects the input | Pass |
| T07 | Take selfie | Open camera and capture a photo | Captured photo appears in preview | Pass |
| T08 | Upload valid image | Select JPG/PNG/WEBP image under 5 MB | Image is accepted | Pass |
| T09 | Upload invalid image type | Select unsupported file type | File is rejected | Pass |
| T10 | Upload oversized image | Select image over 5 MB | File is rejected | Pass |
| T11 | Upload multiple photos | Select several valid photos | Photos are uploaded and queued | Pass |
| T12 | Consent required | Submit without consent | Submission is rejected | Pass |
| T13 | Photo database record | Upload photos | Photo records are stored for the visitor | Pass |
| T14 | Slideshow queue | Upload photos and open `/display` | New photos appear in the display | Pass |
| T15 | Multiple-photo slideshow | Upload multiple photos | Photos appear one after another | Pass |
| T16 | Returning visitor | Use the same phone number again | Existing visitor is reused | Pass |
| T17 | Returning visitor history | Returning visitor uploads new photos | Previous and new photos can be included in the visitor gallery | Pass |
| T18 | Broken image handling | Display encounters an invalid image path | Invalid image is skipped rather than stopping the slideshow | Pass |
| T19 | Queue status | Display a queued photo | Queue item is marked displayed | Pass |
| T20 | Concurrent photo records | Submit multiple photos in one request | Each photo gets its own record and queue entry | Pass |

## Important bugs found and fixed during development

### Bug 1 — Undefined visitor ID

During photo submission, the backend returned:

```text
Incorrect integer value: 'undefined' for column 'visitor_id'
```

Cause:

The frontend was expecting the visitor ID in a property that did not match the actual `/api/visitors` response.

Fix:

The visitor registration flow was updated to read the returned visitor object and validate that a real visitor ID exists before uploading photos.

### Bug 2 — Display initially showed no photo

The display page initially loaded but did not show uploaded photos.

Cause:

The display logic and slideshow queue response were not aligned correctly.

Fix:

The display flow was updated to read the slideshow queue and use the returned photo path and queue ID.

### Bug 3 — First photo in carousel could appear blank

After the carousel was implemented, some image entries could fail to load while other thumbnails worked.

Fix:

The display logic was updated to validate image URLs before starting the slideshow and skip broken images.

## Assignment requirement coverage

### Returning visitor identification

Tested through the phone-number lookup in the visitor route.

### Privacy and consent

The visitor must check the consent option before photo upload. The backend also requires `consent=true`.

### File validation and upload limits

The upload middleware restricts image MIME types, file size, and number of uploaded files.

### Several people uploading

The application stores each visitor's photos separately and creates individual slideshow queue entries. The display polls the queue and processes visitors independently.

## Manual test result summary

The core flow was tested successfully:

```text
Visitor registration
       ↓
Photo/selfie selection
       ↓
Consent
       ↓
Photo upload
       ↓
MySQL photo record
       ↓
Slideshow queue
       ↓
TV display
       ↓
Multiple-photo carousel
       ↓
Returning visitor photo history
```


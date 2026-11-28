# AI Log

This project was developed with AI assistance. The following are the main AI interactions that affected the implementation.

## 1. Initial project planning

**Interaction:** Asked AI to help build the Visitor Photo Slideshow application according to the assignment requirements.

**Used for:** Project structure, visitor registration flow, slideshow flow, database entities, and frontend/backend separation.

**Result:** The application was built around a visitor page, a separate display page, Node.js/Express, MySQL, and a slideshow queue.

---

## 2. Visitor selfie camera

**Interaction:** Asked AI to add a live camera/selfie capture flow to the visitor page.

**Used for:** Browser camera access, capturing a frame from the video stream, converting it into an image file, previewing it, and uploading it with other photos.

**Result:** The visitor can open the camera, capture a selfie, and include it in the photo submission.

---

## 3. Photo validation and consent

**Interaction:** Asked AI to implement photo validation and consent before submission.

**Used for:** JPG/PNG/WEBP validation, 5 MB size limit, 10-photo limit, and consent handling.

**Result:** The frontend validates the files and the backend upload middleware also applies file type, size, and count limits.

---

## 4. AI mistake — visitor ID became undefined

**Interaction:** During testing, photo submission failed with:

```text
Incorrect integer value: 'undefined' for column 'visitor_id'
```

**How the mistake was noticed:** The browser console showed a 500 response from `/api/photos`, and MySQL reported that `visitor_id` was `undefined`.

**Cause:** The frontend was not correctly reading the visitor ID returned by the visitor registration response.

**Fix:** The visitor registration flow was corrected so the returned visitor ID is stored and validated before the photo upload request is sent.

**Result:** Photo submission worked successfully after the fix.

---

## 5. AI mistake — display page did not show uploaded photos

**Interaction:** Asked AI to connect the uploaded photos to the TV display.

**How the mistake was noticed:** The display page opened correctly but remained on the waiting screen even after photos were uploaded.

**Cause:** The display code and the actual slideshow queue response were not aligned.

**Fix:** The display logic was updated to use the actual queue fields such as the queue ID, visitor name, and file path.

**Result:** Uploaded photos appeared on the display.

---

## 6. Multiple-photo carousel

**Interaction:** Asked AI to improve the basic display page so multiple photos from one visitor could be viewed as a slideshow/carousel.

**Used for:** Visitor grouping, photo counter, thumbnails, previous/next controls, automatic transitions, and progress indication.

**Result:** Multiple photos belonging to a visitor can be shown as a gallery and automatically advanced.

---

## 7. Returning visitor history

**Interaction:** Asked AI to make returning visitors see previous photos together with their new photos.

**Used for:** Reusing an existing visitor based on phone number and loading the visitor's stored photo history.

**Result:** The display can load the visitor's previous photos as well as new photos associated with the same visitor.

---

## 8. AI mistake — first carousel image was blank

**Interaction:** After implementing the carousel, the first photo sometimes appeared as a broken/blank image while the other thumbnails loaded.

**How the mistake was noticed:** The display showed the visitor name and `1 / 4`, but the main image area was blank and one thumbnail showed a broken-image indicator.

**Cause:** The slideshow assumed every stored image path could be loaded successfully.

**Fix:** The display logic was changed to validate image URLs before starting the slideshow and skip images that fail to load.

**Result:** A broken image no longer prevents the carousel from continuing.

---

## 9. Final display UI improvement

**Interaction:** Asked AI to make the TV display more professional.

**Used for:** Dark full-screen layout, branding, visitor greeting, photo counter, thumbnails, navigation controls, progress bar, and automatic slideshow presentation.

**Result:** The display was changed from a basic waiting/photo page into a dedicated Visitor Moments presentation screen.


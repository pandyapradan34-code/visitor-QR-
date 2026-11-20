# Visitor Photo Slideshow

A web application where visitors register with their name and mobile number, upload photos with consent, and uploaded photos are placed into a slideshow queue for display on a TV or computer. Returning visitors are identified using their mobile number and their previous photos remain associated with their visitor profile.

## Tech Stack
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Uploads: Multer

## Setup
1. Install Node.js and MySQL.
2. Run `npm install`.
3. Create the database by running `database/schema.sql` in MySQL.
4. Copy `.env.example` to `.env` and set MySQL credentials.
5. Run `npm run dev`.
6. Open `http://localhost:3000` for visitor registration.
7. Open `http://localhost:3000/display` on the TV/computer display.

## Features
- Visitor registration and returning visitor lookup
- Photo upload with type and size validation
- Consent before public display
- Slideshow queue for concurrent uploads
- 10-second display duration
- Simple admin statistics page

## API
POST `/api/visitors`
GET `/api/visitors/:id`
POST `/api/photos`
GET `/api/slideshow/queue`
POST `/api/slideshow/:id/displayed`
GET `/api/slideshow/stats`

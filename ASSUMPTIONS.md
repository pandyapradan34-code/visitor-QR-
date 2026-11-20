# Assumptions

1. A visitor is identified using a mobile number. This avoids face recognition and keeps identity handling simple.
2. Mobile numbers are treated as unique visitor identifiers.
3. Maximum photo size is 5 MB per image.
4. Maximum 10 photos can be uploaded in one request.
5. Supported formats are JPG, JPEG, PNG and WEBP.
6. Visitors must explicitly consent before photos are displayed publicly.
7. Each photo remains on the slideshow for 10 seconds.
8. When multiple visitors upload at the same time, photos are processed in FIFO queue order.
9. Images are stored on the application server and only their paths are stored in MySQL.
10. The display screen is trusted and is opened on a TV or computer connected to the same application server.

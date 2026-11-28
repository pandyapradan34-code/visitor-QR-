// ======================================================
// VISITOR MOMENTS DISPLAY
// ======================================================

const emptyState =
    document.getElementById("empty");

const gallery =
    document.getElementById("gallery");

const mainPhoto =
    document.getElementById("mainPhoto");

const visitorName =
    document.getElementById("visitorName");

const photoNumber =
    document.getElementById("photoNumber");

const photoTotal =
    document.getElementById("photoTotal");

const thumbnailContainer =
    document.getElementById("thumbnailContainer");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const progressBar =
    document.getElementById("progressBar");


// ======================================================
// VARIABLES
// ======================================================

let queue = [];

let currentGallery = [];

let currentIndex = 0;

let currentVisitor = null;

let isPlaying = false;

let progressTimer = null;

let autoSlideTimer = null;

const PHOTO_DURATION = 8000;


// ======================================================
// BUILD IMAGE URL
// ======================================================

function getImageUrl(filePath) {

    if (!filePath) {
        return "";
    }


    // Already a complete URL

    if (
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
    ) {

        return filePath;

    }


    // Make sure relative paths start with /

    if (!filePath.startsWith("/")) {

        filePath = "/" + filePath;

    }


    return window.location.origin + filePath;

}


// ======================================================
// CHECK IF IMAGE CAN LOAD
// ======================================================

function checkImage(url) {

    return new Promise(function (resolve) {

        const image =
            new Image();


        image.onload = function () {

            resolve(true);

        };


        image.onerror = function () {

            console.error(
                "Image failed to load:",
                url
            );

            resolve(false);

        };


        image.src = url;

    });

}


// ======================================================
// LOAD QUEUE
// ======================================================

async function loadQueue() {

    try {

        const response =
            await fetch("/api/slideshow/queue");


        if (!response.ok) {

            throw new Error(
                "Unable to load slideshow queue"
            );

        }


        const data =
            await response.json();


        console.log(
            "Slideshow queue:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(data.photos)
        ) {

            return;

        }


        if (data.photos.length === 0) {

            return;

        }


        // ------------------------------------------
        // GROUP PHOTOS BY VISITOR
        // ------------------------------------------

        const visitorGroups = {};


        data.photos.forEach(function (photo) {

            const visitorId =
                photo.visitor_id;


            if (!visitorGroups[visitorId]) {

                visitorGroups[visitorId] = [];

            }


            visitorGroups[visitorId].push(
                photo
            );

        });


        // ------------------------------------------
        // ADD VISITORS TO QUEUE
        // ------------------------------------------

        Object.keys(visitorGroups).forEach(
            function (visitorId) {

                const alreadyQueued =
                    queue.some(
                        function (item) {

                            return String(
                                item.visitor_id
                            ) === String(visitorId);

                        }
                    );


                if (!alreadyQueued) {

                    const visitorPhotos =
                        visitorGroups[visitorId];


                    queue.push({

                        visitor_id:
                            Number(visitorId),

                        visitor_name:
                            visitorPhotos[0]
                                .visitor_name,

                        queue_items:
                            visitorPhotos

                    });

                }

            }
        );


        if (!isPlaying) {

            playNextVisitor();

        }

    } catch (error) {

        console.error(
            "Queue loading error:",
            error
        );

    }

}


// ======================================================
// GET ALL PHOTOS FOR VISITOR
// ======================================================

async function getVisitorGallery(visitorId) {

    try {

        const response =
            await fetch(
                `/api/slideshow/visitor/${visitorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load visitor gallery"
            );

        }


        const data =
            await response.json();


        console.log(
            "Visitor gallery:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(data.photos)
        ) {

            return null;

        }


        return data;

    } catch (error) {

        console.error(
            "Visitor gallery error:",
            error
        );

        return null;

    }

}


// ======================================================
// FILTER VALID IMAGES
// ======================================================

async function getValidPhotos(photos) {

    const validPhotos = [];


    for (
        const photo of photos
    ) {

        const imageUrl =
            getImageUrl(
                photo.file_path
            );


        if (!imageUrl) {

            console.warn(
                "Photo has no file path:",
                photo
            );

            continue;

        }


        const isValid =
            await checkImage(
                imageUrl
            );


        if (isValid) {

            validPhotos.push({

                ...photo,

                display_url:
                    imageUrl

            });

        } else {

            console.warn(
                "Skipping broken photo:",
                photo
            );

        }

    }


    return validPhotos;

}


// ======================================================
// PLAY NEXT VISITOR
// ======================================================

async function playNextVisitor() {

    if (
        isPlaying ||
        queue.length === 0
    ) {

        return;

    }


    isPlaying = true;


    const visitor =
        queue.shift();


    currentVisitor =
        visitor;


    // ------------------------------------------
    // GET ALL OLD + NEW PHOTOS
    // ------------------------------------------

    const galleryData =
        await getVisitorGallery(
            visitor.visitor_id
        );


    if (
        !galleryData ||
        !galleryData.photos ||
        galleryData.photos.length === 0
    ) {

        isPlaying = false;

        playNextVisitor();

        return;

    }


    console.log(
        "All visitor photos:",
        galleryData.photos
    );


    // ------------------------------------------
    // REMOVE BROKEN IMAGES
    // ------------------------------------------

    currentGallery =
        await getValidPhotos(
            galleryData.photos
        );


    console.log(
        "Valid visitor photos:",
        currentGallery
    );


    // ------------------------------------------
    // NO VALID PHOTOS
    // ------------------------------------------

    if (
        currentGallery.length === 0
    ) {

        console.error(
            "No valid photos available for visitor:",
            visitor.visitor_id
        );


        isPlaying = false;

        playNextVisitor();

        return;

    }


    currentIndex = 0;


    // ------------------------------------------
    // VISITOR NAME
    // ------------------------------------------

    visitorName.textContent =
        galleryData.visitor.name;


    // ------------------------------------------
    // PHOTO COUNT
    // ------------------------------------------

    photoTotal.textContent =
        currentGallery.length;


    // ------------------------------------------
    // SHOW GALLERY
    // ------------------------------------------

    emptyState.classList.add(
        "d-none"
    );

    gallery.classList.remove(
        "d-none"
    );


    // ------------------------------------------
    // CREATE THUMBNAILS
    // ------------------------------------------

    createThumbnails();


    // ------------------------------------------
    // SHOW FIRST VALID PHOTO
    // ------------------------------------------

    showPhoto(0);


    // ------------------------------------------
    // START SLIDESHOW
    // ------------------------------------------

    await startGallerySlideshow();


    // ------------------------------------------
    // MARK NEW PHOTOS DISPLAYED
    // ------------------------------------------

    await markQueueItemsDisplayed(
        visitor.queue_items
    );


    currentGallery = [];

    currentVisitor = null;

    isPlaying = false;


    setTimeout(
        function () {

            playNextVisitor();

        },
        500
    );

}


// ======================================================
// CREATE THUMBNAILS
// ======================================================

function createThumbnails() {

    thumbnailContainer.innerHTML = "";


    currentGallery.forEach(
        function (photo, index) {

            const thumbnail =
                document.createElement("img");


            thumbnail.src =
                photo.display_url;


            thumbnail.className =
                "thumbnail";


            thumbnail.alt =
                `Photo ${index + 1}`;


            thumbnail.addEventListener(
                "click",
                function () {

                    showPhoto(index);

                    resetAutoSlide();

                }
            );


            thumbnailContainer.appendChild(
                thumbnail
            );

        }
    );

}


// ======================================================
// SHOW PHOTO
// ======================================================

function showPhoto(index) {

    if (
        currentGallery.length === 0
    ) {

        return;

    }


    // Keep index valid

    if (index < 0) {

        index =
            currentGallery.length - 1;

    }


    if (
        index >= currentGallery.length
    ) {

        index = 0;

    }


    currentIndex = index;


    const photo =
        currentGallery[currentIndex];


    console.log(
        "Displaying photo:",
        photo.display_url
    );


    // Fade out

    mainPhoto.classList.add(
        "changing"
    );


    setTimeout(
        function () {

            mainPhoto.src =
                photo.display_url;


            mainPhoto.onload =
                function () {

                    mainPhoto.classList.remove(
                        "changing"
                    );

                };


            mainPhoto.onerror =
                function () {

                    console.error(
                        "Main image failed:",
                        photo.display_url
                    );


                    // Skip broken image

                    currentGallery.splice(
                        currentIndex,
                        1
                    );


                    photoTotal.textContent =
                        currentGallery.length;


                    if (
                        currentGallery.length === 0
                    ) {

                        return;

                    }


                    if (
                        currentIndex >=
                        currentGallery.length
                    ) {

                        currentIndex = 0;

                    }


                    createThumbnails();

                    showPhoto(
                        currentIndex
                    );

                };

        },
        150
    );


    photoNumber.textContent =
        currentIndex + 1;


    photoTotal.textContent =
        currentGallery.length;


    updateThumbnails();

}


// ======================================================
// UPDATE THUMBNAILS
// ======================================================

function updateThumbnails() {

    const thumbnails =
        thumbnailContainer.querySelectorAll(
            ".thumbnail"
        );


    thumbnails.forEach(
        function (
            thumbnail,
            index
        ) {

            if (
                index === currentIndex
            ) {

                thumbnail.classList.add(
                    "active"
                );

            } else {

                thumbnail.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ======================================================
// START SLIDESHOW
// ======================================================

function startGallerySlideshow() {

    return new Promise(
        function (resolve) {

            let photoCounter = 0;


            // --------------------------------------
            // ONE PHOTO
            // --------------------------------------

            if (
                currentGallery.length === 1
            ) {

                startProgressBar(
                    PHOTO_DURATION
                );


                autoSlideTimer =
                    setTimeout(
                        function () {

                            resolve();

                        },
                        PHOTO_DURATION
                    );


                return;

            }


            // --------------------------------------
            // MULTIPLE PHOTOS
            // --------------------------------------

            function showNext() {

                photoCounter++;


                if (
                    photoCounter >=
                    currentGallery.length
                ) {

                    stopProgressBar();

                    resolve();

                    return;

                }


                currentIndex++;


                if (
                    currentIndex >=
                    currentGallery.length
                ) {

                    currentIndex = 0;

                }


                showPhoto(
                    currentIndex
                );


                startProgressBar(
                    PHOTO_DURATION
                );


                autoSlideTimer =
                    setTimeout(
                        showNext,
                        PHOTO_DURATION
                    );

            }


            startProgressBar(
                PHOTO_DURATION
            );


            autoSlideTimer =
                setTimeout(
                    showNext,
                    PHOTO_DURATION
                );

        }
    );

}


// ======================================================
// PROGRESS BAR
// ======================================================

function startProgressBar(
    duration
) {

    stopProgressBar();


    progressBar.style.width =
        "0%";


    const startTime =
        Date.now();


    progressTimer =
        setInterval(
            function () {

                const elapsed =
                    Date.now() -
                    startTime;


                const percentage =
                    Math.min(
                        (elapsed / duration) *
                        100,
                        100
                    );


                progressBar.style.width =
                    percentage + "%";

            },
            50
        );

}


// ======================================================
// STOP PROGRESS BAR
// ======================================================

function stopProgressBar() {

    if (progressTimer) {

        clearInterval(
            progressTimer
        );

        progressTimer = null;

    }


    if (autoSlideTimer) {

        clearTimeout(
            autoSlideTimer
        );

        autoSlideTimer = null;

    }

}


// ======================================================
// RESET AUTO SLIDE
// ======================================================

function resetAutoSlide() {

    stopProgressBar();


    startProgressBar(
        PHOTO_DURATION
    );


    autoSlideTimer =
        setTimeout(
            function () {

                currentIndex++;


                if (
                    currentIndex >=
                    currentGallery.length
                ) {

                    currentIndex = 0;

                }


                showPhoto(
                    currentIndex
                );


                resetAutoSlide();

            },
            PHOTO_DURATION
        );

}


// ======================================================
// PREVIOUS BUTTON
// ======================================================

previousButton.addEventListener(
    "click",
    function () {

        if (
            currentGallery.length === 0
        ) {

            return;

        }


        currentIndex--;


        if (
            currentIndex < 0
        ) {

            currentIndex =
                currentGallery.length - 1;

        }


        showPhoto(
            currentIndex
        );


        resetAutoSlide();

    }
);


// ======================================================
// NEXT BUTTON
// ======================================================

nextButton.addEventListener(
    "click",
    function () {

        if (
            currentGallery.length === 0
        ) {

            return;

        }


        currentIndex++;


        if (
            currentIndex >=
            currentGallery.length
        ) {

            currentIndex = 0;

        }


        showPhoto(
            currentIndex
        );


        resetAutoSlide();

    }
);


// ======================================================
// MARK QUEUE ITEMS DISPLAYED
// ======================================================

async function markQueueItemsDisplayed(
    queueItems
) {

    if (
        !queueItems ||
        queueItems.length === 0
    ) {

        return;

    }


    const queueIds =
        queueItems.map(
            function (item) {

                return item.queue_id;

            }
        );


    try {

        await fetch(
            "/api/slideshow/displayed/bulk",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    queue_ids:
                        queueIds
                })

            }
        );


        console.log(
            "Marked displayed:",
            queueIds
        );

    } catch (error) {

        console.error(
            "Unable to mark photos displayed:",
            error
        );

    }

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadQueue();


// ======================================================
// CHECK FOR NEW PHOTOS
// ======================================================

setInterval(
    function () {

        loadQueue();

    },
    3000
);
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


// Time for each photo

const PHOTO_DURATION = 8000;


// ======================================================
// LOAD NEW PHOTOS FROM QUEUE
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


        if (!data.photos.length) {

            return;

        }


        /*
         * Group pending photos by visitor.
         *
         * This means if one visitor uploads
         * 4 photos, they are treated as one
         * visitor gallery instead of 4 separate
         * visitors.
         */

        const visitorGroups = {};


        data.photos.forEach(function (photo) {

            if (!visitorGroups[photo.visitor_id]) {

                visitorGroups[photo.visitor_id] = [];

            }


            visitorGroups[photo.visitor_id].push(photo);

        });


        /*
         * Add each visitor only once to the
         * display queue.
         */

        Object.keys(visitorGroups).forEach(function (visitorId) {

            const existing =
                queue.find(
                    item =>
                        String(item.visitor_id) ===
                        String(visitorId)
                );


            if (!existing) {

                queue.push({

                    visitor_id: Number(visitorId),

                    visitor_name:
                        visitorGroups[visitorId][0]
                            .visitor_name,

                    queue_items:
                        visitorGroups[visitorId]

                });

            }

        });


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
// GET COMPLETE VISITOR GALLERY
// ======================================================

async function getVisitorGallery(visitorId) {

    try {

        const response =
            await fetch(
                `/api/slideshow/visitor/${visitorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load visitor photos"
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


    /*
     * Fetch ALL photos belonging to this
     * visitor.
     *
     * This is what allows returning visitors
     * to see their old photos together with
     * their new photos.
     */

    const galleryData =
        await getVisitorGallery(
            visitor.visitor_id
        );


    if (
        !galleryData ||
        !galleryData.photos.length
    ) {

        isPlaying = false;

        playNextVisitor();

        return;

    }


    currentGallery =
        galleryData.photos;


    currentIndex = 0;


    visitorName.textContent =
        galleryData.visitor.name;


    photoTotal.textContent =
        currentGallery.length;


    /*
     * Show gallery
     */

    emptyState.classList.add("d-none");

    gallery.classList.remove("d-none");


    createThumbnails();

    showPhoto(0);


    /*
     * Wait until all photos have been
     * displayed before moving to the
     * next visitor.
     */

    await startGallerySlideshow();


    /*
     * Mark the NEW queue photos as displayed.
     *
     * Old photos do not have pending queue
     * entries and therefore don't need to
     * be marked.
     */

    await markQueueItemsDisplayed(
        visitor.queue_items
    );


    currentGallery = [];

    currentVisitor = null;

    isPlaying = false;


    /*
     * Small delay before next visitor
     */

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
                photo.file_path;


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
        !currentGallery.length
    ) {

        return;

    }


    /*
     * Keep index inside the gallery range.
     */

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


    /*
     * Fade image out
     */

    mainPhoto.classList.add(
        "changing"
    );


    setTimeout(
        function () {

            mainPhoto.src =
                photo.file_path;


            mainPhoto.onload =
                function () {

                    mainPhoto.classList.remove(
                        "changing"
                    );

                };

        },
        180
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
        function (thumbnail, index) {

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
// START GALLERY SLIDESHOW
// ======================================================

function startGallerySlideshow() {

    return new Promise(
        function (resolve) {

            let completedCycles = 0;


            /*
             * If there is only one photo,
             * display it for the normal
             * duration.
             */

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


            let photoCounter = 0;


            function showNext() {

                photoCounter++;


                /*
                 * After every photo has been
                 * shown once, finish this
                 * visitor's gallery.
                 */

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

function startProgressBar(duration) {

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


    /*
     * Manual navigation should not break
     * the gallery.
     */

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
            !currentGallery.length
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
            !currentGallery.length
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
// MARK QUEUE ITEMS AS DISPLAYED
// ======================================================

async function markQueueItemsDisplayed(
    queueItems
) {

    if (
        !queueItems ||
        !queueItems.length
    ) {

        return;

    }


    const queueIds =
        queueItems.map(
            item =>
                item.queue_id
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
            "Marked queue items as displayed:",
            queueIds
        );

    } catch (error) {

        console.error(
            "Unable to mark queue items:",
            error
        );

    }

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadQueue();


// ======================================================
// CHECK FOR NEW VISITORS EVERY 3 SECONDS
// ======================================================

setInterval(
    function () {

        loadQueue();

    },
    3000
);
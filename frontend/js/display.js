let queue = [];
let busy = false;

let currentPhotoNumber = 0;
let totalPhotoNumber = 0;


/* =========================================
   ELEMENTS
========================================= */

const empty =
    document.getElementById("empty");

const slide =
    document.getElementById("slide");

const slideImg =
    document.getElementById("slideImg");

const visitorName =
    document.getElementById("visitorName");

const currentPhoto =
    document.getElementById("currentPhoto");

const totalPhotos =
    document.getElementById("totalPhotos");


/* =========================================
   LOAD PHOTO QUEUE
========================================= */

async function load() {

    try {

        const response =
            await fetch(
                "/api/slideshow/queue",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        if (
            data.success &&
            Array.isArray(data.photos) &&
            data.photos.length
        ) {

            /*
             * Only start playing when
             * the display is currently free.
             */
            if (!busy) {

                queue = data.photos;

                totalPhotoNumber =
                    queue.length;

                currentPhotoNumber = 0;

                playNext();
            }
        }

    } catch (error) {

        console.error(
            "Unable to load slideshow queue:",
            error
        );
    }
}


/* =========================================
   PLAY NEXT PHOTO
========================================= */

async function playNext() {

    if (
        busy ||
        !queue.length
    ) {
        return;
    }


    busy = true;


    const item =
        queue.shift();


    currentPhotoNumber++;


    empty.classList.add("d-none");

    slide.classList.remove("d-none");


    /*
     * Reset animation by replacing
     * the image element's animation.
     */
    slideImg.classList.remove("photo-animation");

    void slideImg.offsetWidth;

    slideImg.classList.add("photo-animation");


    slideImg.src =
        item.file_path;


    slideImg.alt =
        `Photo shared by ${item.visitor_name}`;


    visitorName.textContent =
        item.visitor_name;


    currentPhoto.textContent =
        currentPhotoNumber;


    totalPhotos.textContent =
        Math.max(
            totalPhotoNumber,
            currentPhotoNumber
        );


    /*
     * Display each photo for 10 seconds.
     */
    setTimeout(
        async () => {

            try {

                await fetch(
                    `/api/slideshow/${item.queue_id}/displayed`,
                    {
                        method: "POST"
                    }
                );

            } catch (error) {

                console.error(
                    "Unable to mark photo as displayed:",
                    error
                );

            } finally {

                busy = false;

                /*
                 * If another photo is already
                 * waiting, play it immediately.
                 */
                if (queue.length) {

                    playNext();

                } else {

                    /*
                     * Keep the current photo visible
                     * until another photo arrives.
                     */
                    currentPhotoNumber = 0;
                }

            }

        },
        10000
    );
}


/* =========================================
   START
========================================= */

load();


/*
 * Check for new visitor photos
 * every 3 seconds.
 */
setInterval(
    load,
    3000
);
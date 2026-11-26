// ======================================================
// VISITOR MOMENTS - APP.JS
// ======================================================


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let visitorId = null;

let selectedFiles = [];

let cameraStream = null;


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const visitorForm = document.getElementById("visitorForm");

const nameInput = document.getElementById("name");

const phoneInput = document.getElementById("phone");

const photosInput = document.getElementById("photos");

const previewContainer = document.getElementById("preview");

const consentInput = document.getElementById("consent");

const submitButton = document.getElementById("submitButton");

const messageBox = document.getElementById("msg");


// Camera elements

const openCameraButton =
    document.getElementById("openCameraButton");

const closeCameraButton =
    document.getElementById("closeCameraButton");

const capturePhotoButton =
    document.getElementById("capturePhotoButton");

const cameraModal =
    document.getElementById("cameraModal");

const cameraVideo =
    document.getElementById("cameraVideo");

const selfiePreview =
    document.getElementById("selfiePreview");


// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(message, type = "error") {

    messageBox.textContent = message;

    messageBox.className = "message " + type;

}


// ======================================================
// CLEAR MESSAGE
// ======================================================

function clearMessage() {

    messageBox.textContent = "";

    messageBox.className = "message";

}


// ======================================================
// REGISTER VISITOR
// ======================================================

async function registerVisitor() {

    const name = nameInput.value.trim();

    const phone = phoneInput.value.trim();


    if (!name) {

        showMessage("Please enter your name.");

        return false;

    }


    if (!phone) {

        showMessage("Please enter your mobile number.");

        return false;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        showMessage("Please enter a valid 10 digit mobile number.");

        return false;

    }


    try {

        const response = await fetch("/api/visitors", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                phone: phone
            })

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Visitor registration failed."
            );

        }


        visitorId = data.visitor_id || data.id;


        return true;

    } catch (error) {

        console.error(error);

        showMessage(
            error.message || "Unable to register visitor."
        );

        return false;

    }

}


// ======================================================
// VALIDATE FILE
// ======================================================

function isValidImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        return false;

    }


    if (file.size > 5 * 1024 * 1024) {

        return false;

    }


    return true;

}


// ======================================================
// CREATE PHOTO PREVIEW
// ======================================================

function createPreview(file) {

    const reader = new FileReader();


    reader.onload = function (event) {

        const wrapper = document.createElement("div");

        wrapper.className = "preview-item";


        const image = document.createElement("img");

        image.src = event.target.result;

        image.alt = "Selected photo";


        wrapper.appendChild(image);


        previewContainer.appendChild(wrapper);

    };


    reader.readAsDataURL(file);

}


// ======================================================
// REFRESH ALL PREVIEWS
// ======================================================

function refreshPreviews() {

    previewContainer.innerHTML = "";

    selfiePreview.innerHTML = "";


    selectedFiles.forEach(function (file) {

        createPreview(file);

    });

}


// ======================================================
// ADD FILES
// ======================================================

function addFiles(files) {

    const newFiles = Array.from(files);


    for (const file of newFiles) {

        if (!isValidImage(file)) {

            showMessage(
                `${file.name} is not a valid image or is larger than 5MB.`
            );

            continue;

        }


        if (selectedFiles.length >= 10) {

            showMessage(
                "Maximum 10 photos are allowed."
            );

            break;

        }


        selectedFiles.push(file);

    }


    refreshPreviews();


    updateInputFiles();

}


// ======================================================
// UPDATE INPUT FILES
// ======================================================

function updateInputFiles() {

    const dataTransfer = new DataTransfer();


    selectedFiles.forEach(function (file) {

        dataTransfer.items.add(file);

    });


    photosInput.files = dataTransfer.files;

}


// ======================================================
// NORMAL PHOTO UPLOAD SELECTION
// ======================================================

photosInput.addEventListener("change", function (event) {

    clearMessage();

    addFiles(event.target.files);

});


// ======================================================
// OPEN CAMERA
// ======================================================

openCameraButton.addEventListener(
    "click",
    async function () {

        clearMessage();


        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            showMessage(
                "Camera is not supported by this browser."
            );

            return;

        }


        try {

            cameraStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: "user",
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },

                    audio: false

                });


            cameraVideo.srcObject = cameraStream;


            cameraModal.classList.remove("d-none");


        } catch (error) {

            console.error("Camera error:", error);


            if (error.name === "NotAllowedError") {

                showMessage(
                    "Camera permission was denied. Please allow camera permission in your browser."
                );

            }

            else if (error.name === "NotFoundError") {

                showMessage(
                    "No camera was found on this device."
                );

            }

            else {

                showMessage(
                    "Unable to open camera. Please check camera permission."
                );

            }

        }

    }
);


// ======================================================
// CLOSE CAMERA
// ======================================================

function closeCamera() {

    if (cameraStream) {

        cameraStream.getTracks().forEach(
            function (track) {

                track.stop();

            }
        );

        cameraStream = null;

    }


    cameraVideo.srcObject = null;


    cameraModal.classList.add("d-none");

}


// ======================================================
// CLOSE CAMERA BUTTON
// ======================================================

closeCameraButton.addEventListener(
    "click",
    function () {

        closeCamera();

    }
);


// ======================================================
// CAPTURE PHOTO
// ======================================================

capturePhotoButton.addEventListener(
    "click",
    function () {

        if (!cameraStream) {

            showMessage(
                "Camera is not active."
            );

            return;

        }


        const videoWidth = cameraVideo.videoWidth;

        const videoHeight = cameraVideo.videoHeight;


        if (!videoWidth || !videoHeight) {

            showMessage(
                "Camera is not ready yet. Please try again."
            );

            return;

        }


        // Create canvas

        const canvas = document.createElement("canvas");

        canvas.width = videoWidth;

        canvas.height = videoHeight;


        const context = canvas.getContext("2d");


        // Mirror selfie

        context.translate(videoWidth, 0);

        context.scale(-1, 1);


        context.drawImage(
            cameraVideo,
            0,
            0,
            videoWidth,
            videoHeight
        );


        // Convert canvas to image

        canvas.toBlob(
            function (blob) {

                if (!blob) {

                    showMessage(
                        "Unable to capture photo."
                    );

                    return;

                }


                // Check maximum photos

                if (selectedFiles.length >= 10) {

                    showMessage(
                        "Maximum 10 photos are allowed."
                    );

                    closeCamera();

                    return;

                }


                // Create File

                const selfieFile = new File(

                    [blob],

                    `selfie-${Date.now()}.jpg`,

                    {
                        type: "image/jpeg"
                    }

                );


                // Add selfie

                selectedFiles.push(selfieFile);


                // Update file input

                updateInputFiles();


                // Show previews

                refreshPreviews();


                // Close camera

                closeCamera();


                showMessage(
                    "Selfie captured successfully.",
                    "success"
                );

            },

            "image/jpeg",

            0.9

        );

    }
);


// ======================================================
// CLOSE CAMERA WHEN CLICKING OUTSIDE
// ======================================================

cameraModal.addEventListener(
    "click",
    function (event) {

        if (event.target === cameraModal) {

            closeCamera();

        }

    }
);


// ======================================================
// SUBMIT FORM
// ======================================================

visitorForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessage();


        // Check photos

        if (selectedFiles.length === 0) {

            showMessage(
                "Please take a selfie or upload at least one photo."
            );

            return;

        }


        // Check consent

        if (!consentInput.checked) {

            showMessage(
                "Please give consent before submitting."
            );

            return;

        }


        // Disable button

        submitButton.disabled = true;

        submitButton.textContent = "Uploading...";


        try {

            // ==========================================
            // STEP 1 - REGISTER VISITOR
            // ==========================================

            if (!visitorId) {

                const registered =
                    await registerVisitor();


                if (!registered) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Photos";

                    return;

                }

            }


            // ==========================================
            // STEP 2 - UPLOAD PHOTOS
            // ==========================================

            const formData = new FormData();


            formData.append(
                "visitor_id",
                visitorId
            );


            selectedFiles.forEach(
                function (file) {

                    formData.append(
                        "photos",
                        file
                    );

                }
            );


            const response =
                await fetch(
                    "/api/photos",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Photo upload failed."
                );

            }


            // ==========================================
            // SUCCESS
            // ==========================================

            document.getElementById(
                "visitorForm"
            ).classList.add("d-none");


            document.getElementById(
                "successScreen"
            ).classList.remove("d-none");


        } catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Something went wrong while uploading photos."
            );


            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Photos";

        }

    }
);


// ======================================================
// INITIAL MESSAGE
// ======================================================

clearMessage();
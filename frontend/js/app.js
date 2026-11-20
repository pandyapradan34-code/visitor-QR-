let visitorId = null;

const form = document.getElementById("visitorForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

const uploadBox = document.getElementById("uploadBox");
const uploadForm = document.getElementById("uploadForm");

const photosInput = document.getElementById("photos");
const consent = document.getElementById("consent");

const msgEl = document.getElementById("msg");

const registrationStep = document.getElementById("registrationStep");
const successStep = document.getElementById("successStep");

const photoStep = document.getElementById("photoStep");

const previewContainer =
    document.getElementById("previewContainer");

const previewGrid =
    document.getElementById("previewGrid");

const photoCount =
    document.getElementById("photoCount");

const continueButton =
    document.getElementById("continueButton");

const uploadButton =
    document.getElementById("uploadButton");

const uploadArea =
    document.querySelector(".upload-area");


/* =========================================
   VISITOR REGISTRATION
========================================= */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        msg("Please enter your name and mobile number.", "danger");
        return;
    }

    if (phone.length < 7) {
        msg("Please enter a valid mobile number.", "danger");
        return;
    }

    setButtonLoading(
        continueButton,
        true,
        "Checking..."
    );

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

            msg(
                data.message || "Unable to register visitor.",
                "danger"
            );

            setButtonLoading(
                continueButton,
                false,
                "Continue"
            );

            return;
        }

        visitorId = data.visitor.id;

        registrationStep.classList.add("d-none");

        uploadBox.classList.remove("d-none");

        photoStep.classList.add("active");

        document
            .querySelector(".progress-step")
            .classList.add("completed");

        msg(
            data.returning
                ? "Welcome back! Your previous photos are already linked to your visitor profile."
                : "Your visitor profile has been created successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        msg(
            "Unable to connect to the server. Please try again.",
            "danger"
        );

    } finally {

        setButtonLoading(
            continueButton,
            false,
            "Continue"
        );
    }
});


/* =========================================
   PHOTO SELECTION
========================================= */

photosInput.addEventListener("change", () => {

    const files = [...photosInput.files];

    validateAndPreview(files);
});


/* =========================================
   DRAG & DROP
========================================= */

uploadArea.addEventListener("dragover", (e) => {

    e.preventDefault();

    uploadArea.classList.add("dragging");
});


uploadArea.addEventListener("dragleave", () => {

    uploadArea.classList.remove("dragging");
});


uploadArea.addEventListener("drop", (e) => {

    e.preventDefault();

    uploadArea.classList.remove("dragging");

    const files = [...e.dataTransfer.files];

    validateAndPreview(files);

    const dataTransfer = new DataTransfer();

    files.forEach(file => {
        dataTransfer.items.add(file);
    });

    photosInput.files = dataTransfer.files;
});


/* =========================================
   VALIDATE + PREVIEW
========================================= */

function validateAndPreview(files) {

    if (!files.length) {

        previewContainer.classList.add("d-none");

        return;
    }


    if (files.length > 10) {

        msg(
            "You can upload a maximum of 10 photos at once.",
            "danger"
        );

        photosInput.value = "";

        previewContainer.classList.add("d-none");

        return;
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    for (const file of files) {

        if (!allowedTypes.includes(file.type)) {

            msg(
                `${file.name} is not a supported image type.`,
                "danger"
            );

            photosInput.value = "";

            previewContainer.classList.add("d-none");

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            msg(
                `${file.name} is larger than 5 MB.`,
                "danger"
            );

            photosInput.value = "";

            previewContainer.classList.add("d-none");

            return;
        }
    }


    msgEl.innerHTML = "";

    previewGrid.innerHTML = "";

    photoCount.textContent =
        `${files.length} photo${files.length > 1 ? "s" : ""}`;


    files.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = (e) => {

            const item =
                document.createElement("div");

            item.className = "preview-item";

            item.innerHTML = `
                <img
                    src="${e.target.result}"
                    alt="Selected photo ${index + 1}"
                >

                <div class="preview-number">
                    ${index + 1}
                </div>
            `;

            previewGrid.appendChild(item);
        };

        reader.readAsDataURL(file);
    });


    previewContainer.classList.remove("d-none");
}


/* =========================================
   PHOTO UPLOAD
========================================= */

uploadForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    if (!visitorId) {

        msg(
            "Visitor information is missing. Please start again.",
            "danger"
        );

        return;
    }


    if (!consent.checked) {

        msg(
            "Please provide permission before uploading your photos.",
            "warning"
        );

        return;
    }


    const files = [...photosInput.files];


    if (!files.length) {

        msg(
            "Please select at least one photo.",
            "warning"
        );

        return;
    }


    const formData = new FormData();

    formData.append(
        "visitor_id",
        visitorId
    );

    formData.append(
        "consent",
        "true"
    );


    files.forEach(file => {

        formData.append(
            "photos",
            file
        );
    });


    setButtonLoading(
        uploadButton,
        true,
        "Uploading..."
    );


    try {

        const response = await fetch(
            "/api/photos",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            msg(
                data.message || "Photo upload failed.",
                "danger"
            );

            return;
        }


        uploadBox.classList.add("d-none");

        successStep.classList.remove("d-none");


        document
            .querySelectorAll(".progress-step")
            .forEach(step => {
                step.classList.add("completed");
            });


        msgEl.innerHTML = "";


    } catch (error) {

        console.error(error);

        msg(
            "Unable to upload photos. Please try again.",
            "danger"
        );

    } finally {

        setButtonLoading(
            uploadButton,
            false,
            "Upload Photos"
        );
    }
});


/* =========================================
   BUTTON LOADING
========================================= */

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button) return;


    if (loading) {

        button.disabled = true;

        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            ${text}
        `;

    } else {

        button.disabled = false;

        button.innerHTML = `
            <span>${text}</span>
            <span class="button-arrow">→</span>
        `;
    }
}


/* =========================================
   MESSAGE
========================================= */

function msg(text, type) {

    msgEl.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;
}
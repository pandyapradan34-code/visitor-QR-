let visitorId = null;

const form = document.getElementById("visitorForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const uploadBox = document.getElementById("uploadBox");
const uploadForm = document.getElementById("uploadForm");
const consent = document.getElementById("consent");
const photos = document.getElementById("photos");
const msgEl = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        msg("Name and phone are required", "danger");
        return;
    }

    msg("Checking visitor...", "info");

    try {
        const r = await fetch("/api/visitors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                phone: phone
            })
        });

        const d = await r.json();

        if (!r.ok) {
            msg(d.message || "Unable to register visitor.", "danger");
            return;
        }

        visitorId = d.visitor.id;

        msg(
            d.returning
                ? "Welcome back! Your previous photos are already linked to this visitor."
                : "Visitor registered successfully.",
            "success"
        );

        uploadBox.classList.remove("d-none");

    } catch (error) {
        console.error(error);
        msg("Unable to connect to the server.", "danger");
    }
});

uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!consent.checked) {
        msg("Please provide photo display consent.", "warning");
        return;
    }

    const files = [...photos.files];

    if (!files.length) {
        msg("Select photos first.", "warning");
        return;
    }

    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            msg(`${file.name} is larger than 5 MB.`, "danger");
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            msg(`${file.name} is not a supported image type.`, "danger");
            return;
        }
    }

    const fd = new FormData();

    fd.append("visitor_id", visitorId);
    fd.append("consent", "true");

    files.forEach(file => {
        fd.append("photos", file);
    });

    try {
        const r = await fetch("/api/photos", {
            method: "POST",
            body: fd
        });

        const d = await r.json();

        msg(
            d.message || "Upload completed.",
            r.ok ? "success" : "danger"
        );

        if (r.ok) {
            e.target.reset();
        }

    } catch (error) {
        console.error(error);
        msg("Unable to upload photos.", "danger");
    }
});

function msg(text, type) {
    msgEl.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;
}
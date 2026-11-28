const router = require("express").Router();
const db = require("../config/db");


// ======================================================
// GET PENDING SLIDESHOW PHOTOS
// ======================================================

router.get("/queue", async (req, res, next) => {

    try {

        const [rows] = await db.execute(`
            SELECT
                q.id AS queue_id,
                p.id AS photo_id,
                p.visitor_id,
                p.file_path,
                p.file_name,
                p.uploaded_at,
                v.name AS visitor_name
            FROM slideshow_queue q
            JOIN photos p
                ON p.id = q.photo_id
            JOIN visitors v
                ON v.id = p.visitor_id
            WHERE q.status = 'pending'
            ORDER BY q.created_at ASC
        `);


        res.json({
            success: true,
            photos: rows
        });

    } catch (error) {

        next(error);

    }

});


// ======================================================
// GET ALL PHOTOS OF A VISITOR
// ======================================================

router.get("/visitor/:visitorId", async (req, res, next) => {

    try {

        const visitorId = Number(req.params.visitorId);


        if (!visitorId) {

            return res.status(400).json({
                success: false,
                message: "Invalid visitor ID"
            });

        }


        const [visitors] = await db.execute(
            `
            SELECT
                id,
                name,
                phone,
                created_at
            FROM visitors
            WHERE id = ?
            `,
            [visitorId]
        );


        if (!visitors.length) {

            return res.status(404).json({
                success: false,
                message: "Visitor not found"
            });

        }


        const [photos] = await db.execute(
            `
            SELECT
                id,
                visitor_id,
                file_name,
                file_path,
                uploaded_at
            FROM photos
            WHERE visitor_id = ?
            ORDER BY uploaded_at ASC, id ASC
            `,
            [visitorId]
        );


        res.json({

            success: true,

            visitor: visitors[0],

            photos: photos

        });

    } catch (error) {

        next(error);

    }

});


// ======================================================
// MARK ONE PHOTO AS DISPLAYED
// ======================================================

router.post("/:id/displayed", async (req, res, next) => {

    try {

        await db.execute(
            `
            UPDATE slideshow_queue
            SET
                status = 'displayed',
                displayed_at = NOW()
            WHERE id = ?
            `,
            [req.params.id]
        );


        res.json({
            success: true
        });

    } catch (error) {

        next(error);

    }

});


// ======================================================
// MARK MULTIPLE PHOTOS AS DISPLAYED
// ======================================================

router.post("/displayed/bulk", async (req, res, next) => {

    try {

        const queueIds = Array.isArray(req.body.queue_ids)
            ? req.body.queue_ids
            : [];


        if (!queueIds.length) {

            return res.status(400).json({
                success: false,
                message: "No queue IDs provided"
            });

        }


        const placeholders =
            queueIds.map(() => "?").join(",");


        await db.execute(
            `
            UPDATE slideshow_queue
            SET
                status = 'displayed',
                displayed_at = NOW()
            WHERE id IN (${placeholders})
            `,
            queueIds
        );


        res.json({
            success: true
        });

    } catch (error) {

        next(error);

    }

});


// ======================================================
// STATS
// ======================================================

router.get("/stats", async (req, res, next) => {

    try {

        const [[v]] = await db.execute(
            "SELECT COUNT(*) total FROM visitors"
        );


        const [[p]] = await db.execute(
            "SELECT COUNT(*) total FROM photos"
        );


        const [[q]] = await db.execute(
            `
            SELECT COUNT(*) total
            FROM slideshow_queue
            WHERE status = 'pending'
            `
        );


        res.json({

            success: true,

            visitors: v.total,

            photos: p.total,

            pending: q.total

        });

    } catch (error) {

        next(error);

    }

});


module.exports = router;
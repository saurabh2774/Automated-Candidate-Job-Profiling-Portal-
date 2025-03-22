import clientPromise from "@/lib/mongodb";
import { GridFSBucket } from "mongodb";

export default async function handler(req, res) {
    const { resumeId } = req.query; // Resume ID passed via query params

    if (!resumeId) {
        return res.status(400).json({ error: 'Resume ID is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db("resumePortal");
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

        const objectId = new require("mongodb").ObjectId(resumeId);
        const downloadStream = bucket.openDownloadStream(objectId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="resume_${resumeId}.pdf"`);

        downloadStream.on("error", (err) => {
            res.status(404).json({ error: "Resume not found" });
        });

        downloadStream.pipe(res); // Stream the file directly to the response
    } catch (error) {
        console.error("Error downloading resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

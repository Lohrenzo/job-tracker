// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
// const __dirname = path.dirname(__filename); // get the name of the directory
import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  createJobController,
  createJobForm,
  jobDetailController,
  loggenInUserJobsController,
  updateJobController,
} from "../controllers/jobController.js";
import upload from "../db/multerConfig.js";

const router = express.Router();

// Render new application form
router.get("/my-applications/new", requireAuth, createJobForm);

// User-specific job applications route
router.get("/my-applications", requireAuth, loggenInUserJobsController);

// Job application detail route
router.get("/my-applications/:slug", requireAuth, jobDetailController);

// New job application with file upload route
router.post(
  "/my-applications/new",
  requireAuth,
  upload("cv"),
  createJobController
);

// Update job application route
router.post("/my-applications/:slug/update", requireAuth, updateJobController);

export default router;

// Serve CV files route
// router.get("/my-applications/cv/:filename", requireAuth, (req, res) => {
//   // const filePath = path.join(uploadDir, req.params.filename);
//   const filePath = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

//   // Check if file exists before sending
//   if (fs.existsSync(filePath)) {
//     res.sendFile(filePath);
//   } else {
//     res.status(404).send("File not found");
//   }
// });

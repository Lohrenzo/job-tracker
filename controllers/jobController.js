import { s3Upload } from "../db/s3Service.js";
import {
  createJob,
  getJobById,
  getUserSpecificJobs,
} from "../models/jobModel.js";

// New job application form
export const createJobForm = (req, res) => {
  res.render("newApplication", { title: "New Job Application" });
};

// New job application controller
export const createJobController = async (req, res, next) => {
  const {
    companyName,
    role,
    description,
    location,
    amount,
    timeScale,
    dateApplied,
    stage,
    url,
  } = req.body;

  if (!companyName || !role || !description || !dateApplied) {
    return res.render("newApplication", {
      title: "New Job Application",
      message: "Please enter required fields",
    });
  }

  try {
    if (!req.file) {
      return res.render("newApplication", {
        title: "New Job Application",
        message: "Please upload a valid CV (PDF).",
      });
    }

    // Upload CV to S3 and get the file URL
    const s3CvUrl = await s3Upload(req.file, "cv", req.session.user.username);

    // Store job in database with S3 file URL
    const newJob = await createJob(
      companyName,
      role,
      location,
      description,
      amount,
      timeScale,
      new Date(dateApplied),
      stage,
      s3CvUrl, // Store CV URL instead of the file itself
      false,
      false,
      url,
      req.session.user.id // Link the current user
    );

    console.log("New Job Created: ", newJob);
    res.redirect("/my-applications");
  } catch (error) {
    console.error("Error creating job: ", error);
    next(error);
  }
};

// Getting user-specific jobs controller
export const loggenInUserJobsController = async (req, res) => {
  try {
    // Fetch jobs only for the logged-in user
    const jobs = await getUserSpecificJobs(req.session.user.id);

    console.log("My Jobs: ", jobs);

    res.render("myJobs", {
      title: "My Job Applications",
      myJobs: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs: ", error);
    res.render("myJobs", {
      title: "My Job Applications",
      myJobs: [],
      message: "Failed to load job applications.",
    });
  }
};

// Job detail controller
export const jobDetailController = async (req, res, next) => {
  try {
    // Fetch job details from database
    const job = await getJobById(parseInt(req.params.jobId));

    if (!job) {
      res.render("applicationDetail", {
        title: `Job Application Detail`,
        message: `Job Application Not Available!!`,
      });
    }

    if (job.candidateid !== req.session.user.id) {
      res.render("applicationDetail", {
        title: `Job Application Detail`,
        message: `You Are Not Authorized To View This Job!!`,
      });
    }
    console.log("Logged In User ID: ", req.session.user.id);

    console.log("Job Application Detail: ", job);

    res.render("applicationDetail", {
      title: `Detail for ${job.role}`,
      job: job,
    });
  } catch (error) {
    console.error("Error fetching job application: ", error);
    next(error);
  }
};

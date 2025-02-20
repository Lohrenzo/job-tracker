import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import * as dateFns from "date-fns";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import searchRoutes from "./routes/searchRoute.js";
import errorHandling from "./middlewares/errorHandler.js";
import createTables from "./db/createTables.js";

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "/views"));
// set view engine as pug
app.set("view engine", "pug");

// Static file handling
app.use(express.static("views"));
// app.use(express.static(path.join(__dirname, "public")));

// Serve static files from 'uploads' directory
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session
const expiryDate = new Date(Date.now() + 45 * 60 * 1000); // 45 mins
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies only in production
      httpOnly: true,
      expires: expiryDate,
    },
  })
);

// Middleware to pass user data to templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// date formatter persisting the entire app
app.locals.dateFns = dateFns;

// Routes
app.get("/", async (req, res) => {
  // Testing postgres connection
  // const result = await pool.query("SELECT current_database()");
  // console.log(`The database name is ${result.rows[0].current_database}`);
  res.render("home", {
    title: "Job Tracker",
  });
});

app.use(authRoutes);
app.use(jobRoutes);
app.use(searchRoutes);

// Error handler middleware
app.use(errorHandling);

//Create table before starting server
createTables();

// Server running
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}\n`);
});

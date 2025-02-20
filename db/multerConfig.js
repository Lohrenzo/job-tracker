import multer from "multer";
// import path from "path";
// import fs from "fs";

// const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
// const __dirname = path.dirname(__filename); // get the name of the directory

// Ensure upload directory exists
// const uploadDir = path.join(__dirname, "..", "uploads");
// // const uploadDir = path.join(__dirname, "..", "uploads", "cvs");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // const uniqueName = `${file.fieldname}-${Date.now()}-${file.originalname}`;
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log("File: ", file);
  console.log("File type: ", file.mimetype);

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF or Image files are allowed."));
  }
};

export default function upload(fieldname) {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 1000000000 },
  }).single(`${fieldname}`);
}

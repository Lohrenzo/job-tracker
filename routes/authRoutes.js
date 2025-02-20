import express from "express";
import {
  createUserController,
  createUserForm,
  loginController,
  loginForm,
  logoutController,
} from "../controllers/authController.js";
import upload from "../db/multerConfig.js";

const router = express.Router();

// Routes for displaying forms
router.get("/register", createUserForm);
router.get("/login", loginForm);

// Register route
router.post("/register", upload("image"), createUserController);

// Login route
router.post("/login", loginController);

// Logout route
router.get("/logout", logoutController);

// router.put("/profile/:id", updateUserController);
// router.delete("/profile/:id", deleteUserById);

export default router;

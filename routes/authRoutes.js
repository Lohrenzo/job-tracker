import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  createUserController,
  createUserForm,
  loginController,
  loginForm,
  logoutController,
  updatePasswordController,
  updateUserController,
  updateUserForm,
} from "../controllers/authController.js";
import upload from "../db/multerConfig.js";

const router = express.Router();

// Routes for displaying forms
router.get("/register", createUserForm);
router.get("/login", loginForm);
router.get("/profile", requireAuth, updateUserForm);

// Register route
router.post("/register", upload("image"), createUserController);

// Login route
router.post("/login", loginController);

// Logout route
router.get("/logout", requireAuth, logoutController);

// Update user details route
router.post(
  "/profile-update",
  requireAuth,
  upload("image"),
  updateUserController
);

// Update password route
router.post("/password-update", requireAuth, updatePasswordController);

// router.delete("/profile/:id", requireAuth, deleteUserById);

export default router;

import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import {
  createUserController,
  createUserForm,
  deleteUserController,
  forgotPassEmailSent,
  forgotPasswordForm,
  forgotPasswordTokenController,
  forgotPasswordTokenForm,
  initiateForgotPasswordController,
  loginController,
  loginForm,
  logoutController,
  updatePasswordController,
  updateUserController,
  updateUserForm,
} from "../controllers/authController.js";
import upload from "../db/multerConfig.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Get routes for displaying forms
router.get("/register", createUserForm);
router.get("/login", loginForm);
router.get("/profile", requireAuth, updateUserForm);
router.get("/forgot-password", forgotPasswordForm);
router.get("/forgot-password/sent", forgotPassEmailSent);
router.get("/reset-password/:token", forgotPasswordTokenForm);

// Logout route
router.get("/logout", requireAuth, logoutController);

// Register route
router.post("/register", upload("image"), createUserController);

// Login route
router.post("/login", loginController);

// Update user details route
router.post(
  "/profile-update",
  requireAuth,
  upload("image"),
  updateUserController
);

// Update password when logged in route
router.post("/password-update", requireAuth, updatePasswordController);

// Route to initiate password reset
router.post("/forgot-password", initiateForgotPasswordController);

// Route to handle the reset token
router.post("/reset-password/:token", forgotPasswordTokenController);

// Route to update the password
router.post("/reset-password", (req, res) => {
  const { token, password } = req.body;
  // Find the user with the given token and update their password
  const user = users.find((user) => user.resetToken === token);
  if (user) {
    user.password = password;
    delete user.resetToken; // Remove the reset token after the password is updated
    res.status(200).send("Password updated successfully");
  } else {
    res.status(404).send("Invalid or expired token");
  }
});

// Delete user account
router.post("/profile/delete/:id", requireAuth, deleteUserController);

export default router;

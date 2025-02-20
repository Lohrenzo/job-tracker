import { s3Upload } from "../db/s3Service.js";
import {
  createUser,
  deleteUserById,
  getUserById,
  updatePasswordById,
  updateUserById,
  userExistsEmail,
  userExistsUsername,
} from "../models/authModel.js";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

// Create user form
export const createUserForm = (req, res) => {
  // if there's a session, redirect to jobs page
  if (req.session.user) return res.redirect("/my-applications");
  res.render("register", { title: "New User" });
  // res.sendFile(path.join(__dirname, "public/register.html"));
};

// Login form
export const loginForm = (req, res) => {
  // if there's a session, redirect to jobs page
  if (req.session.user) return res.redirect("/my-applications");
  res.render("login", { title: "Login User" });
};

// Update User Form
export const updateUserForm = (req, res) => {
  // if there's no session, redirect to login page
  if (!req.session.user) return res.redirect("/login");
  res.render("profile", {
    title: "Update Profile Details",
    user: req.session.user,
  });
};

// Create user controller
export const createUserController = async (req, res, next) => {
  const { username, email, firstName, lastName, password, password2 } =
    req.body;

  // validate input
  if (!username || !email || !firstName || !password || !password2) {
    return res.render("register", {
      title: "New User",
      message: "Fill all required fields!!",
    });
  }

  if (password !== password2) {
    return res.render("register", {
      title: "New User",
      message: "Passwords must be the same!!",
    });
  }

  try {
    // Check if email already exists
    const existingUserEmail = await userExistsEmail(email);
    if (existingUserEmail) {
      return res.render("register", {
        title: "New User",
        message: `User with email "${email}" already exists!`,
      });
    }

    // Check if username already exists
    const existingUsername = await userExistsUsername(username);
    if (existingUsername.length > 0) {
      return res.render("register", {
        title: "New User",
        message: `User with username "${username}" already exists!`,
      });
    }

    if (!req.file) {
      return res.render("register", {
        title: "New User",
        message: "Please upload a valid image.",
      });
    }

    console.log("File: ", req.file);
    console.log("File type: ", req.file.mimetype);

    // Upload image to S3 and get the file URL
    const s3ImageUrl = await s3Upload(req.file, "profile", username);

    const hashedPassword = bcrypt.hashSync(password, salt);

    // create new user
    const newUser = await createUser(
      username,
      email,
      firstName,
      lastName,
      s3ImageUrl,
      hashedPassword
    );

    console.log("New User Created: ", newUser);

    // Save user data in session
    req.session.user = newUser;

    console.log("Session after sign up: ", req.session);

    // req.session.save((err) => {
    //   if (err) {
    //     console.error("Error saving session:", err);
    //     return next(err);
    //   }
    // });
    res.redirect("/my-applications");
  } catch (error) {
    console.error("Error creating user: ", error.message);
    next(error);
  }
};

// Login controller
export const loginController = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", {
      message: "Please enter both username and password",
    });
  }

  try {
    const user = await userExistsUsername(username);

    if (!user[0] || !bcrypt.compareSync(password, user[0].password)) {
      return res.render("login", {
        title: "Login User",
        message: "Invalid credentials!",
      });
    }

    req.session.user = user[0];
    console.log("Session after login:", req.session);
    res.redirect("/my-applications");
  } catch (error) {
    next(error);
  }
};

// Logout controller
export const logoutController = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    console.log("User logged out.");
    res.redirect("/login");
  });
};

// Update user
export const updateUserController = async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const oldUser = await getUserById(userId);

    if (!oldUser) {
      return res.render("profile", {
        title: "Update Profile Details",
        message: "User not found!",
      });
    }

    // Extract form data
    const { username, email, firstName, lastName } = req.body;

    // Use existing values if fields are empty
    const updatedUserData = {
      username: username.trim() || oldUser.username,
      email: email.trim() || oldUser.email,
      firstName: firstName.trim() || oldUser.firstName,
      lastName: lastName.trim() || oldUser.lastName,
      image: oldUser.image, // Default to old image unless a new one is uploaded
    };

    // Handle profile image upload
    if (req.file) {
      try {
        updatedUserData.image = await s3Upload(
          req.file,
          "profile",
          updatedUserData.username
        );
      } catch (uploadError) {
        console.error("Error uploading profile image:", uploadError);
        return res.render("profile", {
          title: "Update Profile Details",
          message: "Failed to upload profile image!",
        });
      }
    }

    // Update the user in the database
    const updatedUser = await updateUserById(
      userId,
      updatedUserData.username,
      updatedUserData.email,
      updatedUserData.firstName,
      updatedUserData.lastName,
      updatedUserData.image
    );

    // Update session data
    req.session.user = updatedUser;

    res.render("profile", {
      title: "Update Profile Details",
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    next(error);
  }
};

// Update user password controller
export const updatePasswordController = async (req, res, next) => {
  // Extract form data
  const { password, password2 } = req.body;

  // Validate input
  if (password !== password2) {
    return res.render("profile", {
      title: "Update Profile Details",
      passwordMessage: "Passwords must be the same!!",
    });
  }

  if (!password || !password2) {
    return res.render("profile", {
      title: "Update Profile Details",
      passwordMessage: "Fill in required field!!",
    });
  }

  try {
    const userId = req.session.user.id;
    const user = await getUserById(userId);

    // Check if the new password matches with the old one
    if (bcrypt.compareSync(password, user.password)) {
      return res.render("profile", {
        title: "Update Profile Details",
        passwordMessage: "You can't use the same password as before!!",
        user: user,
      });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, salt);

    const updatedUser = await updatePasswordById(userId, hashedPassword);

    // Update session data
    req.session.user = updatedUser;

    return res.render("profile", {
      title: "Update Profile Details",
      successMessage: "Your password has been changed successfully",
      user: user,
    });
  } catch (err) {
    console.error("Error updating user profile:", err.message);
    next(err);
  }
};

// Delete user
export const deleteUserController = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserById(req.params.id);
    if (!deletedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User deleted successfully", deleteUser);
  } catch (err) {
    next(err);
  }
};

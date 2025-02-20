import { s3Upload } from "../db/s3Service.js";
import {
  createUser,
  deleteUserById,
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
export const updateUser = async (req, res, next) => {
  const { username, email, firstName, lastName } = req.body;
  try {
    // Upload image to S3 and get the file URL
    const s3ImageUrl = await s3Upload(
      req.file,
      "profile",
      req.session.user.username
    );

    const updatedUser = await updateUserById(
      req.session.user.id,
      username,
      email,
      firstName,
      lastName,
      s3ImageUrl
    );
    if (!updatedUser)
      return res.render("updateProfile", {
        title: `Edit Profile`,
        message: "User not found!",
      });
    return res.render("updateProfile", {
      title: `Edit Profile`,
      message: "User updated successfully!",
      user: updatedUser,
    });
    // handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserById(req.params.id);
    if (!deletedUser) return handleResponse(res, 404, "User not found");
    handleResponse(res, 200, "User deleted successfully", deleteUser);
  } catch (err) {
    next(err);
  }
};

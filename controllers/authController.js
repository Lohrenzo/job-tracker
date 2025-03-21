import { s3Upload } from "../db/s3Service.js";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  getUserById,
  updatePasswordById,
  updateUserById,
  userExistsEmail,
  userExistsUsername,
} from "../models/authModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

// create the email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ionos.co.uk",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    // console.log("File: ", req.file);
    // console.log("File type: ", req.file.mimetype);

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

    // console.log("New User Created: ", newUser);

    // Save user data in session
    req.session.user = newUser;

    // console.log("Session after sign up: ", req.session);

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
    console.log("Login Failed: Please enter both username and password!");
    return res.render("login", {
      message: "Please enter both username and password",
    });
  }

  try {
    const user = await userExistsUsername(username);

    if (!user[0] || !bcrypt.compareSync(password, user[0].password)) {
      console.log("Login Failed: Invalid Credentials!");
      return res.render("login", {
        title: "Login User",
        message: "Invalid credentials!",
      });
    }

    req.session.user = user[0];
    // console.log("Session after login:", req.session);
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
    // Get the user's password
    const password = req.body.password;
    if (!password) {
      console.log("Deleting User Account Failed: User must input password!");
      return res.render("profile", {
        title: "Update Profile Details",
        deleteMessage: "User must input password!!",
      });
      // throw Error("User must input password!");
    }

    const user = await getUserById(req.params.id);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log("Deleting User Account Failed: Invalid Password!");
      return res.render("profile", {
        title: "Update Profile Details",
        deleteMessage: "Invalid Password!!",
      });
      // throw Error("Invalid Password!!");
    }

    // Delete profile image from S3 if it exists
    if (user.image) {
      try {
        await s3Delete(user.image);
        console.log("User image deleted from S3:", user.image);
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error.message);
      }
    }

    // Delete user from DB
    const deletedUser = await deleteUserById(req.params.id);
    if (!deletedUser) throw Error("User not found");
    // console.log("User deleted successfully: ", deletedUser);

    req.session.destroy((err) => {
      if (err) return next(err);
      console.log("User account deleted successfully: ", deletedUser);
      res.redirect("/login");
    });
  } catch (err) {
    next(err);
  }
};

// Load forgot password form
export const forgotPasswordForm = (req, res) => {
  // if there's no session, redirect to login page
  if (req.session.user) return res.redirect("/my-applications");
  return res.render("forgotPassword", {
    title: "Reset Your password",
  });
};

// Password reset link sent successfully
export const forgotPassEmailSent = (req, res) => {
  // if there's no session, redirect to login page
  if (req.session.user) return res.redirect("/my-applications");
  return res.render("forgotPassEmailSent", {
    title: "Password Reset Link Sent",
  });
};

// Initiate Password Reset
export const initiateForgotPasswordController = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    console.log("Email is required");
    return res.render("forgotPassword", {
      title: "Reset Your password",
      message: "Email is required!!",
    });
    // res.status(400);
    // throw new Error("Email is required");
  }

  try {
    // Check if the email exists
    const user = await getUserByEmail(email);

    console.log("user: ", user);

    if (!user) {
      return res.render("forgotPassword", {
        title: "Reset Your password",
        message: `User with email "${email}" not found!!`,
      });
    }

    // Generate a reset token
    const token = jwt.sign(
      { password: user.password, id: user.id },
      process.env.SESSION_SECRET,
      { expiresIn: "15m" }
    );
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("Reset Password Link: ", link);

    // define the email object
    const emailObject = {
      from: `"Job Application Tracker" <${process.env.EMAIL_ADDRESS}>`, // sender address
      to: `${email}`, // list of receivers. use a comma to seperate multiple emails
      subject: "Job Application Tracker Password Reset", // Subject line
      // text: `Hello ${user.username}, use the link to reset your password: ${link}`, // plain text body
      html: `
        <p>Hello ${user.username}, </p> <br><br> 
        <p>Click the link below to reset your password: </p> 
        <a href="${link}">Password reset link</a><br> 
        <b>This link is only valid for 15 minutes.</b>
      `, // html body
    };

    // Send the reset password link to the user's email
    transporter.sendMail(emailObject, (error, info) => {
      if (error) {
        console.log(error);
        return res.render("forgotPassword", {
          title: "Reset Your password",
          message: "Something went wrong!",
        });
        // res.status(500).send("Error sending email");
      } else {
        console.log(`Email sent: ${info.response}`);
        return res.redirect("/forgot-password/sent");
      }
    });
  } catch (err) {
    console.log("Error sending rest email: ", err);
    next();
    // throw err;
  }
};

// Render the Forgot Password With Token Form
export const forgotPasswordTokenForm = (req, res) => {
  // Get the token from the request parameter
  const { token } = req.params;
  // Check if the token exists
  if (!token) {
    console.log("Token is required");
    throw new Error("Token is required");
  }

  return res.render("forgotPasswordTokenForm", {
    title: "Enter Your New Password",
    token: token,
  });
};

// Reset password link with token
export const forgotPasswordTokenController = async (req, res, next) => {
  try {
    // Get password from request body
    const { password, password2 } = req.body;

    // Get the token from the request parameter
    const { token } = req.params;

    // Verify that there is a password in the request body
    if (!password) {
      console.log("Password is required");
      // res.status(400);
      return res.render("forgotPasswordTokenForm", {
        title: "Enter Your New Password",
        message: "Password is required!!",
        token: token,
      });
      // throw new Error("Password is required");
    }

    // Verify that both passwords metch
    if (password !== password2) {
      return res.render("forgotPasswordTokenForm", {
        title: "Enter Your New Password",
        message: "Passwords do not match!!",
        token: token,
      });
    }

    // Check if the token exists
    if (!token) {
      console.log("Token is required");
      throw new Error("Token is required");
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);

    // Find the user using the id from the decoded token
    const user = await getUserById(decoded.id);
    if (!user) {
      console.log("User does not exist");
      throw new Error("User does not exist");
    }

    // Do a quick validation
    if (decoded.password !== user.password) {
      console.log("Invalid token");
      throw new Error("Invalid token");
    }

    if (bcrypt.compareSync(password, decoded.password)) {
      return res.render("forgotPasswordTokenForm", {
        title: "Enter Your New Password",
        message: "You can't use your current password!!",
        token: token,
      });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, salt);

    // update the user's password
    // const updatedUser =
    await updatePasswordById(user.id, hashedPassword);

    // Update session data
    // req.session.user = updatedUser;

    // define the email object
    const emailObject = {
      from: `"Job Application Tracker" <${process.env.EMAIL_ADDRESS}>`, // sender address
      to: `${user.email}`, // list of receivers. use a comma to seperate multiple emails
      subject: "Job Application Tracker Password Reset Confirmation", // Subject line
      html: `<b>Hello ${user.username}, </b> <br><br> <p>You have successfully reset your password.</p> <br> <p>Thank you.</p>`, // html body
    };

    // Send the user a confirmation email
    transporter.sendMail(emailObject, (error, info) => {
      if (error) {
        console.log(error);
        return res.render("forgotPasswordTokenForm", {
          title: "Enter Your New Password",
          message:
            "You have successfully reset your password, but something went wrong when sending you a confirmation email. Go to the login page and login with your new password!!",
          token: token,
        });
        // res.status(500).send("Error sending email");
      } else {
        console.log(`Email sent: ${info.response}`);
        return res.redirect("/forgot-password/sent");
      }
    });

    // Redirect user to login page
    return res.redirect("/login");
  } catch (error) {
    console.log("Error resetting password: ", error);
    next(error);
  }
};

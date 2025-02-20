// Middleware to protect routes
export default function requireAuth(req, res, next) {
  if (req.session.user) {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect("/login"); // User is not authenticated, redirect to login page
  }
}

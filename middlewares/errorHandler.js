// Centralized error handling

// const errorHandling = (err, req, res, next) => {
//   console.log(err.stack);
//   res.status(500).json({
//     status: 500,
//     message: "Something went wrong",
//     error: err.message,
//   });
// };

function errorHandling(err, req, res, next) {
  console.error("Unhandled Error: ", err);
  res.render("error", {
    title: "Something Went Wrong",
    error: err.message,
  });
  // res.sendFile(path.join(__dirname, "public/error.html"));
}

export default errorHandling;

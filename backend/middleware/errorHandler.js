// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = Number(err?.statusCode) || 500;
  let message = err?.message || "Internal Server Error";
  let code = err?.code;

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 400;
      message = "Image size must be less than 5MB.";
      code = "VALIDATION_ERROR";
    } else {
      statusCode = 400;
      message = err.message || "File upload failed.";
      code = "VALIDATION_ERROR";
    }
  }

  if (err.message && err.message.includes("Only JPG, PNG, WEBP, and GIF")) {
    statusCode = 400;
    message = err.message;
    code = "VALIDATION_ERROR";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
    code = code || "VALIDATION_ERROR";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message =
      Object.values(err.errors ?? {})?.[0]?.message || "Validation failed.";
    code = code || "VALIDATION_ERROR";
  }

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const responsePayload = {
    success: false,
    message,
    ...(code ? { code } : {}),
  };

  if (process.env.NODE_ENV === "development") {
    responsePayload.details = err?.stack || err;
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;

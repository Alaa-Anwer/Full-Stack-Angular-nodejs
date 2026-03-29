import Joi from "joi";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import AppError from "../utils/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildReadableFieldPath = (detailPath = []) =>
  detailPath.length > 0 ? detailPath.join(".") : "field";

const getIssueMessage = (detail) => {
  if (!detail) {
    return "Invalid request data.";
  }

  if (detail.message) {
    return detail.message.replace(/"/g, "");
  }

  const fieldPath = buildReadableFieldPath(detail.path);
  return `${fieldPath} is invalid.`;
};

const cleanupUploadedFile = (req) => {
  const filename = req?.file?.filename;
  if (!filename) {
    return;
  }

  const uploadedPath = path.join(__dirname, "..", "uploads", filename);
  if (fs.existsSync(uploadedPath)) {
    fs.unlinkSync(uploadedPath);
  }
};

const validateSchemaPart = (schema, value) =>
  schema.validate(value ?? {}, {
    abortEarly: true,
    convert: true,
    allowUnknown: true,
  });

const validateRequest =
  ({ body, params, query } = {}) =>
  (req, res, next) => {
    try {
      if (body) {
        const { value, error } = validateSchemaPart(body, req.body);
        if (error) {
          cleanupUploadedFile(req);
          throw new AppError(
            getIssueMessage(error.details?.[0]),
            400,
            "VALIDATION_ERROR",
          );
        }
        req.body = value;
      }

      if (params) {
        const { value, error } = validateSchemaPart(params, req.params);
        if (error) {
          throw new AppError(
            getIssueMessage(error.details?.[0]),
            400,
            "VALIDATION_ERROR",
          );
        }
        req.params = value;
      }

      if (query) {
        const { value, error } = validateSchemaPart(query, req.query);
        if (error) {
          throw new AppError(
            getIssueMessage(error.details?.[0]),
            400,
            "VALIDATION_ERROR",
          );
        }
        req.query = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;

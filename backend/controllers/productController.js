import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const MAX_LIMIT = 100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildImageUrl = (req, imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `${req.protocol}://${req.get("host")}${imagePath}`;
};

const normalizeProductImage = (req, productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  return {
    ...product,
    image: buildImageUrl(req, product.image),
  };
};

const removeUploadedFileIfExists = (imagePath) => {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return;
  }

  const sanitizedRelativePath = imagePath.replace(/^\//, "");
  const absolutePath = path.join(__dirname, "..", sanitizedRelativePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

/**
 * Get all products with pagination, filtering, and search
 * GET /api/products
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      minPrice,
      maxPrice,
    } = req.query;

    // Build filter object
    const filter = {};

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      MAX_LIMIT,
    );
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Product.countDocuments(filter);

    // Fetch products
    const products = await Product.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const productsWithImageUrl = products.map((product) =>
      normalizeProductImage(req, product),
    );

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: productsWithImageUrl,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: normalizeProductImage(req, product),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product (Admin only)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const parsedPrice = parseFloat(req.body.price);
    const parsedStock = parseInt(req.body.stock, 10);
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.image || "").trim();

    const product = new Product({
      title,
      description,
      price: parsedPrice,
      stock: parsedStock,
      category,
      image: imagePath,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: normalizeProductImage(req, product),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (Admin only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Update fields
    const { title, description, category } = req.body;
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (req.body.price !== undefined)
      product.price = parseFloat(req.body.price);
    if (req.body.stock !== undefined)
      product.stock = parseInt(req.body.stock, 10);
    if (category !== undefined) product.category = category;

    if (req.file) {
      removeUploadedFileIfExists(product.image);
      product.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      product.image = req.body.image.trim();
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: normalizeProductImage(req, product),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    removeUploadedFileIfExists(product.image);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: normalizeProductImage(req, product),
    });
  } catch (error) {
    next(error);
  }
};

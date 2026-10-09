const mongoose = require("mongoose");
const Product = require("../models/Product");

const productFields = [
  "name",
  "category",
  "gender",
  "price",
  "oldPrice",
  "rating",
  "reviews",
  "image",
  "badge",
  "description",
  "stock",
  "featured",
];

const validateProduct = (product) => {
  if (
    typeof product.name !== "string" ||
    !product.name.trim() ||
    typeof product.category !== "string" ||
    !product.category.trim() ||
    typeof product.image !== "string" ||
    !product.image.trim()
  ) {
    return "Name, category and image are required.";
  }

  const price = Number(product.price);
  const oldPrice = Number(product.oldPrice);
  const stock = Number(product.stock ?? 0);
  const rating = Number(product.rating ?? 0);
  const reviews = Number(product.reviews ?? 0);

  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(oldPrice) || oldPrice < price) {
    return "Prices must be valid non-negative numbers, and original price cannot be below selling price.";
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return "Stock must be a non-negative whole number.";
  }

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return "Rating must be between 0 and 5.";
  }

  if (!Number.isInteger(reviews) || reviews < 0) {
    return "Review count must be a non-negative whole number.";
  }

  return "";
};

/* ==============================
   GET ALL PRODUCTS
================================ */

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};


/* ==============================
   GET SINGLE PRODUCT
================================ */

const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};


/* ==============================
   CREATE PRODUCT
================================ */

const createProduct = async (req, res) => {
  try {
    const validationError = validateProduct({
      ...req.body,
      stock: req.body.stock ?? 0,
    });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const product = await Product.create({
      ...Object.fromEntries(
        productFields
          .filter((field) => req.body[field] !== undefined)
          .map((field) => [field, req.body[field]])
      ),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      success: false,
      message: error.name === "ValidationError" || error.name === "CastError"
        ? error.message
        : "Failed to create product.",
    });
  }
};


/* ==============================
   UPDATE PRODUCT
================================ */

const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const updates = Object.fromEntries(
      productFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );
    const validationError = validateProduct({ ...product.toObject(), ...updates });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    Object.assign(product, updates);
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      success: false,
      message: error.name === "ValidationError" || error.name === "CastError"
        ? error.message
        : "Failed to update product.",
    });
  }
};


/* ==============================
   DELETE PRODUCT
================================ */

const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
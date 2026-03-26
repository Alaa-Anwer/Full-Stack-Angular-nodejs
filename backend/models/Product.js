import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
